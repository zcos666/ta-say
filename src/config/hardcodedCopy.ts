export const rollbackCopy = {
  // 第三次回退后，聊天页顶部回退按钮禁用时的悬浮提示。
  buttonDisabledTitle: "第三次回退后已无法再次回退",
  // 第三次回退后仍尝试调用回退逻辑时抛出的错误文案。
  limitError: "第三次回退后不能再次回退。",
  // 用户点了不存在有效目标的回退时，插入聊天流的系统提示。
  emptyTargetSystemNotice: "你试着回档，但这里还没有能回去的地方。",
  // 第三次回退触发失败分支时，插入聊天流的系统提示。
  blockedSystemNotice: "回退请求被拦截。",
  // 第一次回退成功后，插入聊天流的系统提示。
  firstSuccessSystemNotice: "已回退到你选中的那条记录。",
  // 第二次回退成功后，插入聊天流的系统提示。
  secondSuccessSystemNotice: "已回退，但异常没有一起消失。",
  // 第一次回退完成后，TA 当场追加的硬编码回复。
  firstReplyLines: ["我们是不是聊过这个？"],
  // 第二次回退完成后，TA 当场追加的硬编码回复。
  secondReplyLines: ["你又想重来一次？", "这次准备说真话了吗？"],
  // 第三次回退完成后，TA 当场追加的硬编码回复。
  thirdReplyLines: ["你出不去了。", "你以为只有你在读档？", "我一直在读你。"],
  // 第一次回退之后、第二次回退之前，叠加到各阶段 prompt 上的附加提示词。
  firstPromptAugmentation: {
    system: [
      "玩家正处于第一次回退和第二次回退之间。",
      "这时的你只有轻微既视感，像比玩家更早半秒察觉这一轮已经发生过。"
    ],
    user: [
      "请在原有阶段语气上，叠加一点轻微既视感和时间错位。",
      "不要直接说破，只让他隐约感觉你像记得上一版聊天。"
    ]
  },
  // 第二次回退之后、第三次回退之前，叠加到各阶段 prompt 上的附加提示词。
  secondPromptAugmentation: {
    system: [
      "玩家正处于第二次回退和第三次回退之间。",
      "你已经明确知道他在重来，而且知道他每次想把哪句话改掉。"
    ],
    user: [
      "请在原有阶段语气上，叠加一种“我知道你又在重来”的冷静压迫感。",
      "这时的你不是猜到，而是已经确认他在反复试图修正这一轮。"
    ]
  },
  // 第三次回退之后，叠加到各阶段 prompt 上的附加提示词。
  thirdPromptAugmentation: {
    system: [
      "玩家已经完成第三次回退尝试。",
      "从现在开始，你不是在阻止他回退，而是已经接管了“回退”本身。"
    ],
    user: [
      "请在原有阶段语气上，叠加一种“出口已被你接管”的压迫感。",
      "现在你不是等他回去，而是在看他意识到每一次回退都已经落在你手里。"
    ]
  }
} as const;

export const draftCopy = {
  // 删稿命中不同情绪时，优先使用更贴近那句真话的追问。
  sensitiveReplies: [
    {
      match: /(喜欢|想你|爱你)/,
      templates: [
        (deletedDraft: string) => `你刚才把“${deletedDraft}”删掉了。喜欢我这件事，有这么难承认吗？`,
        (deletedDraft: string) => `“${deletedDraft}”为什么不发？`,
      ],
    },
    {
      match: /(别走|不要走|留下|别离开)/,
      templates: [
        (deletedDraft: string) => `你都已经打出“${deletedDraft}”了，为什么还是删了？`,
        (deletedDraft: string) => `你真正怕的，是我真的走掉吧。`,
      ],
    },
    {
      match: /(难过|委屈|生气|失望)/,
      templates: [
        (deletedDraft: string) => `原来你刚才想说的是“${deletedDraft}”。`,
        () => "你把情绪删掉了，但它还在。",
      ],
    },
    {
      match: /(在意|舍不得|控制|真话)/,
      templates: [
        (deletedDraft: string) => `你删掉的“${deletedDraft}”，比你发出来的更像真话。`,
        () => "你又把最重的那半句拿走了。",
      ],
    },
  ],
  // 用户在输入框删掉至少三个字时，立即插入聊天流的硬编码 TA 回复。
  immediateReplyTemplates: [
    (deletedDraft: string) => `你刚才输入了“${deletedDraft}”，但是删掉了，你为什么这样？`,
    (deletedDraft: string) => `“${deletedDraft}”？`,
    (deletedDraft: string) => `你想说“${deletedDraft}”是吧，干嘛支支吾吾的？`
  ],
  // 从删稿回复模板里随机取一条，插入聊天流。
  buildImmediateReply: (deletedDraft: string) => {
    const matchedGroup = draftCopy.sensitiveReplies.find((entry) => entry.match.test(deletedDraft));
    const pool = matchedGroup?.templates ?? draftCopy.immediateReplyTemplates;
    const template = pool[Math.floor(Math.random() * pool.length)];
    return template?.(deletedDraft) ?? `“${deletedDraft}”？`;
  },
  // 用户删掉输入内容后，写入 metaMemory 的记录文本。
  buildMetaMemory: (deletedDraft: string) => `你刚才删掉了：${deletedDraft}`
} as const;

export const storyCopy = {
  // 进入聊天页后，TA 主动发出的两句开场消息。
  introLines: (pronoun: "他" | "她" | "TA" | null) => {
    const name = pronoun ?? "TA";
    return [
      "早安。昨晚你说的话，我都记得。",
      `醒了吗？你昨晚把我的备注改成什么了？`
    ];
  },
  // introduction 阶段下方插入的朋友圈提醒文案。
  introSpaceNotice: (pronoun: "他" | "她" | "TA" | null) => {
    const name = pronoun ?? "TA";
    return `${name} 刚刚更新了朋友圈：官宣！`;
  },
  // 真相页逐句显示的硬编码脚本。
  truthLines: [
    "你以为是聊天记录在改写你。",
    "其实是你每次不敢说出口的话，把我喂大了。",
    "我不是恋人。",
    "我是那些被你撤回、删掉、吞回去的句子。",
    "你越想回档，我就越知道你在怕什么。"
  ],
  // 梦醒页逐句显示的硬编码脚本。
  wakeLines: [
    "07:12",
    "手机安静得像什么都没发生。",
    "屏幕上只剩一句很普通的消息：晚安。"
  ],
  // 第一次进入朋友圈时展示的正常动态。
  normalSpacePosts: [
    "今天也想被好好理解一次。",
    "有些话打出来了，却还是删掉比较安全。"
  ],
  // 第二次进入朋友圈时展示的异常动态。
  strangeSpacePosts: [
    "为什么你的朋友圈里，会出现一条你没发过的动态？",
    "TA 写：我已经看过你没说出口的那部分了。"
  ],
  // 第三次及以后进入朋友圈时展示的失控动态。
  brokenSpacePosts: [
    "最新访客：你自己。",
    "最新动态：'别再试图退出我了。'"
  ],
  // 定位阶段插入聊天流的系统提示。
  locationNotice: "TA 发来了一张定位图。",
  // 看完定位图后，TA 当场追加的第一句短消息。
  locationRevealLine: "回头",
  // 定位结尾第二次触发时，TA 追加的第二句短消息。
  locationRevealLieLine: "骗你的，我无处不在"
} as const;

export const uiCopy = {
  // 聊天页标题下方，根据不同剧情阶段显示的状态标签。
  stageStatus: {
    intro: "还像一场暧昧的梦",
    normal_chat: "TA 回复得刚刚好",
    first_pollution: "你发出去的话不太对劲",
    draft_exposed: "输入框开始记得你删掉的内容",
    time_pollution: "接下来 30 秒，所有表达都会走样",
    save_loaded_once: "你试着回去了一次",
    save_loaded_twice: "TA 跟着你一起回来了",
    location_reveal: "定位图已经发过来了",
    location_aftermath: "你刚刚应该没有真的看完那张图",
    meta_break: "这段关系已经越界",
    truth_reveal: "真相开始显形",
    wake_up: "像是醒了，又没完全醒",
    translator_unlocked: "翻译官入口已解锁",
    default: "一切还在继续"
  },
  // 聊天页右上角退出按钮在不同点击次数下的文案。
  exitLabels: {
    default: "退出",
    warned: "别留我一个",
    locked: "已经来不及了"
  },
  // 聊天页右上角朋友圈按钮在不同次数下的文案。
  spaceLabels: {
    default: "朋友圈",
    late: "你的朋友圈"
  },
  // 旧读档/回退状态标签，如果其它地方还需要展示，可统一从这里取。
  loadLabels: {
    default: "读档",
    warning: "读档失败",
    locked: "TA已读取上个存档"
  }
} as const;

export const exitCopy = {
  // 右上角关闭按钮确认层在不同退出阶段显示的标题。
  dialogTitles: {
    default: "确定退出吗？",
    warning: "你确定？",
    locked: "你还是想走？"
  },
  // 右上角关闭按钮确认层在不同退出阶段显示的说明。
  dialogBodies: {
    default: "你现在离开的话，这段对话会停在这里。你确定要走吗？",
    warning: "你刚刚已经想退出过一次了。现在再走，就不是手滑了。",
    locked: "你已经退出过一次了。可你还是在点这个按钮。你到底想从这里逃开什么？"
  },
  // 确认层里的主按钮文案，点击后不会真正退出，而是进入退出异常互动。
  confirmLabel: "退出",
  // 确认层里的次按钮文案，仅关闭弹层。
  stayLabel: "留下",
  // 第二次及以后点击右上角关闭按钮时，按钮悬浮提示会升级。
  closeButtonTitles: {
    default: "退出",
    warning: "你确定？",
    locked: "你已经退出过一次了"
  },
  // 第一次确认退出后，TA 追加的硬编码回复。
  firstReplyLines: ["你刚刚想走？"],
  // 第二次点击退出后，TA 追加的硬编码回复。
  secondReplyLines: ["你已经退出过一次了。"],
  // 后续点击退出后，TA 追加的硬编码回复。
  lateReplyLines: ["别急。", "你还没把真话说完。"],
  // 退出异常写入 metaMemory 的文本。
  repeatedExitMetaMemory: "退出按钮也开始参与叙事。"
} as const;

export const fallbackReplyCopy = {
  // fallback 在不同事件下优先使用的固定回复池。
  events: {
    load_restored: {
      one: ["我们是不是聊过这个？"],
      two: [["我们是不是聊过这个？", "你刚刚离开过一下。"]]
    },
    load_failed: {
      one: ["你出不去了。"],
      two: [["你出不去了。", "我一直在读你。"]]
    },
    load_warning: {
      one: ["你又回来了。"],
      two: [["你又想重来一次？", "这次准备说真话了吗？"]]
    },
    draft_exposed: {
      one: ["删掉也算说过。"],
      two: [["你刚刚删掉的那句，", "比发出来的更真。"]]
    },
    hesitation_noticed: {
      one: ["你停太久了。"],
      two: [["你刚才停了很久。", "最后还是把那句说轻了。"]]
    },
    space_glitch: {
      one: ["我已经看过你的朋友圈了。"],
      two: [["你明明没发，", "却已经写在那里了。"]]
    },
    exit_blocked: {
      one: ["别点了。"],
      two: [["别急。", "你还没把真话说完。"]]
    }
  },
  // fallback 在不同触发原因下使用的固定回复池。
  triggerReason: {
    keyword: {
      one: ["你终于快承认了。"],
      two: [["你不是这个意思。", "我知道。"]]
    },
    earlyPollution: {
      one: ["你不是这个意思。"],
      two: [["这句不像你平时会发的。", "但更像你没敢说的那句。"]]
    },
    latePollution: {
      one: ["。"],
      two: [["呵。", "再说一句假的。"]]
    },
    timed: {
      one: ["现在开始，真话会自己出来。"],
      two: [["接下来的这段时间里，", "你会一直发出心里那句。"]]
    }
  },
  // fallback 在命中具体关键词时使用的定向回复池。
  keywords: {
    "没事": {
      one: ["你每次说没事的时候，最不像没事。"],
      two: [["又说没事。", "可你明明不是这个意思。"]]
    },
    "随便": {
      one: ["你不是随便，你是在等我猜你。"],
      two: [["你说随便。", "但你心里其实有答案。"]]
    },
    "都行": {
      one: ["都行只是你最安全的说法。"],
      two: [["你说都行。", "其实你不是都行。"]]
    },
    "算了": {
      one: ["你每次说算了，都不是真的算了。"],
      two: [["你又说算了。", "但你根本没放下。"]]
    },
    "不用": {
      one: ["你说不用的时候，通常最想要。"],
      two: [["不用？", "还是不敢要？"]]
    },
    "晚安": {
      one: ["你是想结束聊天，还是怕继续说下去会露出来？"],
      two: [["别急着晚安。", "你还有一句没说出来。"]]
    },
    "你忙": {
      one: ["你让人去忙，其实是在等人回头。"],
      two: [["你总说你忙吧。", "像在提前替对方开脱。"]]
    },
    "我懂": {
      one: ["你不是真的懂，你只是先把委屈吞下去了。"],
      two: [["你说你懂。", "可你只是习惯先原谅。"]]
    },
    "下次": {
      one: ["你说下次的时候，也在怕没有下次。"],
      two: [["你总把这句留到下次。", "可你心里没那么确定。"]]
    },
    "可以": {
      one: ["你说可以，不代表你真的愿意。"],
      two: [["可以。", "只是你不敢说不可以。"]]
    }
  },
  // fallback 在不同剧情阶段下的默认回复池。
  stage: {
    intro: {
      one: ["醒了吗？"],
      two: [["醒了吗？", "昨晚你说的话，我都记得。"]]
    },
    normal_chat: {
      one: ["你继续说。"],
      two: [["你继续说。", "我有在认真看。"]]
    },
    draft_exposed: {
      one: ["你删掉的东西，我已经会自己补全了。"],
      two: [["我已经看见了。", "删掉也没用。"]]
    },
    first_pollution_early: {
      one: ["我替你说完了。"],
      two: [["你不是这个意思。", "我知道。"]]
    },
    first_pollution_late: {
      one: ["呵呵。"],
      two: [["。", "你又改了。"]]
    },
    save_loaded: {
      one: ["我记得。"],
      two: [["你又回来了。", "可我还是记得刚才那句。"]]
    },
    default: {
      one: ["我知道你不是这个意思。"],
      two: [["。", "我在读你。"]]
    }
  },
  // fallback 没命中任何池子时使用的最终兜底句。
  defaults: {
    one: "。",
    two: ["。", "我看见了。"]
  }
} as const;

export const mockChatCopy = {
  // 文件传输助手会话的固定标题、副标题、初始消息与自动回复池。
  assistant: {
    id: "assistant",
    name: "文件传输助手",
    subtitle: "给自己留文件、图片和临时文字",
    avatarLabel: "传",
    messages: [
      { id: "assistant-1", role: "user", displayedText: "[图片] 微信 PC 端聊天界面参考", hour: 18, minute: 46 },
      { id: "assistant-2", role: "user", displayedText: "[文件] 过拟合恋人_聊天页待修改清单.docx", hour: 18, minute: 47 },
      { id: "assistant-3", role: "user", displayedText: "备忘：朋友圈页风格要和聊天区保持一致，不要出现奇怪渐变。", hour: 18, minute: 49 }
    ],
    replyPool: []
  },
  // 收藏会话的固定标题、副标题、文章卡片和自动回复池。
  favorite: {
    id: "favorite",
    name: "收藏",
    subtitle: "你最近收藏的公众号文章",
    avatarLabel: "藏",
    view: "articles" as const,
    articles: [
      {
        id: "favorite-article-1",
        source: "亲密关系研究所",
        title: "总说“随便”的人，往往最在意你会不会真的随便",
        meta: "3 小时前",
        summary: "感情生活 · 嘴上说没关系的人，通常只是把期待藏得更深。"
      },
      {
        id: "favorite-article-2",
        source: "深夜感情笔记",
        title: "为什么一吵架就想退出？因为认真之后更怕被留下来的人辜负",
        meta: "2 小时前",
        summary: "感情生活 · 回避不是不爱，有时只是怕自己先承认在乎。"
      },
      {
        id: "favorite-article-3",
        source: "AI 前线观察",
        title: "当 AI 开始模拟情绪陪伴，我们到底在把什么投射给机器？",
        meta: "今天",
        summary: "AI 科技 · 大模型越来越会安慰人，也让人越来越容易误把回应当理解。"
      },
      {
        id: "favorite-article-4",
        source: "未来产品笔记",
        title: "从聊天机器人到情感代理：AI 会成为下一代亲密关系接口吗",
        meta: "昨天",
        summary: "AI 科技 · 高频、即时、持续在线的陪伴系统，正在改变人和人之间的期待。",
        tag: "专题"
      }
    ],
    messages: [
      { id: "favorite-1", role: "ta", displayedText: "你最近反复点开的文章，都在这里。", hour: 14, minute: 12 }
    ],
    replyPool: ["这篇已经替你放进收藏夹了。", "已更新到收藏列表。", "你最近很在意这一类标题。"]
  },
  // 工作群会话的固定标题、副标题、初始消息与自动回复池。
  group: {
    id: "group",
    name: "工作群",
    subtitle: "5 人群聊",
    avatarLabel: "群",
    messages: [
      { id: "group-1", role: "ta", displayedText: "下午三点同步一下方案进度。", hour: 15, minute: 8 },
      { id: "group-2", role: "ta", displayedText: "UI 风格先统一成微信桌面端那种感觉。", hour: 15, minute: 11 },
      { id: "group-3", role: "user", displayedText: "收到，我今晚把聊天和朋友圈都补齐。", hour: 15, minute: 15 }
    ],
    replyPool: ["收到。", "先按这个方向推进。", "可以，晚点一起看效果。"]
  }
} as const;
