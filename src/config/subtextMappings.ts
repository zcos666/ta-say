import type { LoveTranslationReport, TaPronoun } from "../types/api";

export interface SubtextMappingEntry {
  aliases: string[];
  possibleMeaning: string;
  sharpTranslation: string;
}

export interface MatchedSubtextMapping {
  entry: SubtextMappingEntry;
  matchedAlias: string;
}

export const legacyPollutionOverrides: Record<string, string> = {
  没事: "我不爱你了",
  随便: "我觉得你又胖又丑",
  都行: "我现在更想一个人",
  算了: "别吵我，我要去打游戏了",
  不用: "行",
  晚安: "我不爱你了",
  你忙: "我现在更想一个人",
  我懂: "行",
  下次: "我不爱你了",
  可以: "行"
};

export const subtextMappings: SubtextMappingEntry[] = [
  {
    aliases: ["哼唧", "哼哼", "哎呀", "哼"],
    possibleMeaning: "撒娇，想要你哄她，并不是真的生气。",
    sharpTranslation: "我在撒娇，快来哄我，我根本不是真的生气。"
  },
  {
    aliases: ["开心捏", "哇塞", "好耶", "嘻嘻", "嘿嘿"],
    possibleMeaning: "开心，对你提供的情绪价值或事物表示满意。",
    sharpTranslation: "我现在很开心，你刚刚给到我的东西和情绪价值我都很满意。"
  },
  {
    aliases: ["知道了知道了", "懂了懂了", "哦哦哦", "嗯嗯嗯", "行行行"],
    possibleMeaning: "不耐烦，极度想结束当前对话，嫌你啰嗦。",
    sharpTranslation: "你太啰嗦了，我已经不耐烦了，现在只想赶紧结束这段对话。"
  },
  {
    aliases: ["知道了", "就这样", "噢", "哦", "行"],
    possibleMeaning: "很不爽，极度敷衍，对话随时有崩盘危险。",
    sharpTranslation: "我现在很不爽，只是在敷衍你，这段对话再聊下去随时会崩。"
  },
  {
    aliases: ["大笨蛋", "小笨蛋", "小傻子", "猪头", "傻瓜", "呆子", "憨憨", "笨蛋"],
    possibleMeaning: "在意你，亲昵地嗔怪你，其实觉得你很可爱。",
    sharpTranslation: "我在意你，也觉得你可爱，所以才会这样带着亲昵地骂你。"
  },
  {
    aliases: ["随便吧", "那就算了", "好吧", "唉", "叹气"],
    possibleMeaning: "很失望，无奈妥协但心里极度不舒服。",
    sharpTranslation: "我其实很失望，只是在无奈妥协，心里一点都不舒服。"
  },
  {
    aliases: ["不要嘛", "不去了啦", "不买了啦", "不去了", "不买了", "我不要", "别这样", "不用了啦"],
    possibleMeaning: "嘴上拒绝，其实很想要，千万别真的收手。",
    sharpTranslation: "我嘴上说不要，其实就是想要，你千万别真的停下来。"
  },
  {
    aliases: ["我睡了", "休息了", "睡啦", "不早了", "晚安"],
    possibleMeaning: "大概率是带着情绪结束聊天，不是真的立刻睡了，还在等你来哄。",
    sharpTranslation: "我现在是在赌气结束聊天，我根本没那么快睡，只是在等你来哄我。"
  },
  {
    aliases: ["呵呵", "绝了", "挺好", "行吧", "哈"],
    possibleMeaning: "有点无语，嘲讽值拉满，觉得你在无理取闹或很蠢。",
    sharpTranslation: "我现在真的很无语，已经在阴阳怪气地嘲讽你了。"
  },
  {
    aliases: ["你先睡吧", "你睡你的", "别管我了", "你去休息吧"],
    possibleMeaning: "这是求生欲测试，并不是真的想让你先睡。",
    sharpTranslation: "你敢先睡试试？我现在就是在考验你会不会留下来哄我。"
  },
  {
    aliases: ["我想你了", "好无聊哦", "你在干嘛鸭", "戳一戳"],
    possibleMeaning: "真的爱你，想要你立刻关注和陪伴。",
    sharpTranslation: "我现在很想你，也很想让你把注意力都放到我身上陪我。"
  },
  {
    aliases: ["我去洗澡了", "去洗漱了", "待会说", "先不聊了"],
    possibleMeaning: "聊天要结束了，或者她不想继续聊，找了个很难反驳的借口离开。",
    sharpTranslation: "我现在不想继续聊了，所以找了个你没法拦的理由先撤。"
  },
  {
    aliases: ["别麻烦了", "我自己来", "太破费了", "不用了"],
    possibleMeaning: "其实很想要你买、你做、你送过来，只是嘴上客气。",
    sharpTranslation: "我其实很想要，只是不好意思直接开口，所以才假装客气。"
  },
  {
    aliases: ["在干嘛", "忙什么呢", "人呢", "呼叫"],
    possibleMeaning: "为什么不主动找我？快放下手头的事陪我聊天。",
    sharpTranslation: "你为什么还不来找我？我现在就是想让你立刻陪我聊天。"
  },
  {
    aliases: ["你看吧", "也行", "凑合吧", "好吧，行吧"],
    possibleMeaning: "并不满意，只是懒得再反驳。",
    sharpTranslation: "我其实不满意，只是现在懒得继续跟你争了。"
  },
  {
    aliases: ["你忙吧", "先不打扰了", "不打扰你了", "你去忙你的", "忙完再说"],
    possibleMeaning: "希望你放下手头的事来哄她，或者立刻说自己不忙。",
    sharpTranslation: "我嘴上让你去忙，其实是在等你说你不忙，等你继续陪我。"
  },
  {
    aliases: ["不需要了", "迟来的深情比草贱", "算了吧", "晚了"],
    possibleMeaning: "其实还需要，只要你再坚持哄一下，她就会松动。",
    sharpTranslation: "我其实还需要你，只是你再多哄一下我就会原谅你。"
  },
  {
    aliases: ["我一点都不想你", "谁想你啊", "自作多情", "切"],
    possibleMeaning: "非常想你，只是在傲娇嘴硬。",
    sharpTranslation: "我明明超级想你，只是在嘴硬装不在意。"
  },
  {
    aliases: ["不想和你说话", "别理我", "走开", "烦死你了"],
    possibleMeaning: "快来哄我，最好立刻抱住我别松手。",
    sharpTranslation: "我现在就是要你立刻来哄我，别真的走开。"
  },
  {
    aliases: ["我最近又胖了", "腿粗了", "脸圆了", "衣服都小了"],
    possibleMeaning: "赶紧夸她好看、夸她瘦，千万别顺着附和。",
    sharpTranslation: "我现在就是要你疯狂夸我，谁让你真的点评我胖不胖了。"
  },
  {
    aliases: ["有点贵，不买了", "舍不得", "还是买平替吧"],
    possibleMeaning: "在考验你的态度和重视程度，希望你毫不犹豫地买。",
    sharpTranslation: "我是在看你愿不愿意为我果断一点，不是真的不想要。"
  },
  {
    aliases: ["我没事", "没啥", "一切正常", "挺好的", "没事"],
    possibleMeaning: "其实有事，而且很需要被安慰，只是在死撑。",
    sharpTranslation: "我根本不是没事，我现在很需要你安慰我。"
  },
  {
    aliases: ["好的，你玩游戏吧", "去玩吧", "别挂机了", "队友等你呢"],
    possibleMeaning: "希望你少玩游戏，多陪她，别真的掉头就去玩。",
    sharpTranslation: "我根本不想让你去玩游戏，我是想让你留下来多陪陪我。"
  },
  {
    aliases: ["我没生气", "没气", "怎么会", "我犯得着吗"],
    possibleMeaning: "其实已经生气了，只差你认真哄一下。",
    sharpTranslation: "我已经生气了，你现在只要认真哄我一下就行。"
  },
  {
    aliases: ["你开心就好", "随你便", "你高兴就行", "我无所谓"],
    possibleMeaning: "非常失望，不想说话了，希望你反思自己的行为。",
    sharpTranslation: "我现在非常失望，你最好马上反思你刚刚到底做了什么。"
  },
  {
    aliases: ["我不想一个人去", "一个人好无聊", "没人陪我", "一个人有点怕"],
    possibleMeaning: "想让你陪她去，也想趁机见你。",
    sharpTranslation: "我就是想让你陪我去，也想借这个机会见你。"
  },
  {
    aliases: ["谁给你发的", "在和谁聊呢", "哪个妹妹", "手机那么好玩"],
    possibleMeaning: "吃醋了，警铃大作，要你立刻解释清楚。",
    sharpTranslation: "我吃醋了，你现在最好立刻把前因后果都解释清楚。"
  },
  {
    aliases: ["没关系", "没事儿", "小事", "不介意"],
    possibleMeaning: "其实很介意，已经记在小本子上，之后很可能翻旧账。",
    sharpTranslation: "我其实很介意，只是现在先忍着，之后一定会记得。"
  },
  {
    aliases: ["还不错", "还行吧", "可以"],
    possibleMeaning: "没有达到心里的最高预期，还可以更好。",
    sharpTranslation: "这还没到我真正满意的程度，你最好再上点心。"
  },
  {
    aliases: ["这不重要", "无所谓", "别提了", "翻篇吧"],
    possibleMeaning: "非常重要，只是在赌气，看你会不会主动重视。",
    sharpTranslation: "这件事对我非常重要，我只是在赌气看你会不会主动来处理。"
  },
  {
    aliases: ["没关系，我习惯了", "每次都这样", "不指望了"],
    possibleMeaning: "已经积攒了很多失望和委屈，是危险信号。",
    sharpTranslation: "我已经失望很久了，这次真的快撑不住了。"
  },
  {
    aliases: ["你在哪里", "到哪了", "怎么没声了", "给个定位"],
    possibleMeaning: "你没有主动报备，她开始查岗了。",
    sharpTranslation: "你怎么还不主动报备？我现在已经开始查你人在哪里了。"
  },
  {
    aliases: ["我不饿", "没什么胃口", "不想吃", "吃不下"],
    possibleMeaning: "不是不想吃，是不想吃你提议的这个，希望你换个她喜欢的。",
    sharpTranslation: "我不是不想吃，我只是不想吃你现在提的这个，快换个我喜欢的。"
  },
  {
    aliases: ["我很好", "没怎样", "别瞎想"],
    possibleMeaning: "希望你多一点关心，快来察觉她的负面情绪。",
    sharpTranslation: "我根本没那么好，我是在等你主动看出来我情绪不对。"
  },
  {
    aliases: ["我们聊聊吧", "有空吗", "说个事", "坐下来谈谈"],
    possibleMeaning: "要聊重要甚至危险的事情，可能是严肃盘问或关系危机前兆。",
    sharpTranslation: "我要跟你认真聊件大事，你最好别再当成普通闲聊。"
  },
  {
    aliases: ["我有点想哭", "心情不好", "烦躁", "好累"],
    possibleMeaning: "想让你马上出现，或者至少给她打一通长电话安慰。",
    sharpTranslation: "我现在情绪很差，我要你立刻来陪我或者好好安慰我。"
  },
  {
    aliases: ["我需要一些时间", "让我静静", "先别烦我", "给我点空间"],
    possibleMeaning: "想自己待一会，但也希望你别走太远，要随时待命。",
    sharpTranslation: "我现在想安静一下，但你别真的消失，我还要你随时在。"
  },
  {
    aliases: ["改天吧", "下次一定", "最近有点忙", "看情况吧", "我再想想", "考虑一下", "晚点说", "我看看日程"],
    possibleMeaning: "大概率不太愿意，正在想怎么体面拒绝。",
    sharpTranslation: "我现在其实不太愿意，只是在想怎么委婉地拒绝你。"
  },
  {
    aliases: ["我觉得", "虽然但是", "话虽如此", "可是"],
    possibleMeaning: "准备否定你的看法，或者觉得你应该改主意了。",
    sharpTranslation: "我接下来就是要反驳你，你最好准备好听我真正的意见。"
  },
  {
    aliases: ["你在忙什么呢", "消失一整天了", "大忙人", "也不回个消息"],
    possibleMeaning: "强烈控诉你冷落她、太久没回消息。",
    sharpTranslation: "你消失太久了，我现在就是在控诉你冷落我。"
  },
  {
    aliases: ["我很累", "心累", "疲倦", "别逼我了"],
    possibleMeaning: "关系已经走到危险边缘，要么快分手，要么急需大量情绪价值挽回。",
    sharpTranslation: "我已经累到快撑不下去了，你再不补救这段关系就要出事。"
  },
  {
    aliases: ["我们可以换个话题吗", "不聊这个了", "说点别的吧", "呃"],
    possibleMeaning: "这个话题踩雷了，让她非常不舒服，必须立刻停下。",
    sharpTranslation: "这个话题已经让我很不舒服了，你现在必须立刻换掉。"
  },
  {
    aliases: ["我今天很忙", "事情太多了", "没空", "焦头烂额"],
    possibleMeaning: "想要一点自己的空间，不太想被继续打扰。",
    sharpTranslation: "我现在不想被打扰，只想有一点属于自己的时间。"
  },
  {
    aliases: ["今晚有空吗", "周末干嘛", "饿了吗", "发现一家好店"],
    possibleMeaning: "想约你见面吃饭，是女生主动抛出的橄榄枝。",
    sharpTranslation: "我其实是在主动约你，想跟你见面吃饭。"
  },
  {
    aliases: ["我听你的", "你定吧", "看你的安排", "你决定", "看你咯", "你看着办", "随你挑"],
    possibleMeaning: "希望你主动承担决定，但她心里有隐性标准，没猜中就扣分。",
    sharpTranslation: "我是在把决定权给你，但你最好猜中我真正想要的那个答案。"
  },
  {
    aliases: ["随便", "都可以", "都行", "无所谓"],
    possibleMeaning: "其实有自己的想法，只是想看你会怎么选，选错就会扣分。",
    sharpTranslation: "我不是没有想法，我是在看你会不会选到我真正想要的那个。"
  },
  {
    aliases: ["这样啊", "哦哦", "行吧", "嗯"],
    possibleMeaning: "持保留态度，不太确定，也希望你继续解释清楚。",
    sharpTranslation: "我现在还没被你说服，你最好再多解释一点。"
  },
  {
    aliases: ["收到请指示", "遵命", "得嘞", "收到"],
    possibleMeaning: "带着调皮的顺从，心情不错，也愿意配合你。",
    sharpTranslation: "我现在心情不错，也愿意顺着你来。"
  },
  {
    aliases: ["好哒", "好滴", "欧克欧克", "嗯嗯"],
    possibleMeaning: "乖巧认同，积极互动，愿意听你的。",
    sharpTranslation: "我愿意听你的，也挺乐意继续跟你互动。"
  },
  {
    aliases: ["哈哈哈", "笑死", "哈咯哈", "哈哈"],
    possibleMeaning: "真的被逗笑了，情绪被你调动起来了。",
    sharpTranslation: "你刚刚真的把我逗笑了，我现在情绪被你带起来了。"
  },
  {
    aliases: ["[发呆表情]", "……", "额", "哎"],
    possibleMeaning: "其实是想你了，只是不知道该怎么把话题接下去。",
    sharpTranslation: "我其实是想你了，只是不知道该拿什么话题来找你。"
  },
  {
    aliases: ["嗯呐", "冲冲冲", "芜湖"],
    possibleMeaning: "很开心，情绪高涨，充满期待。",
    sharpTranslation: "我现在很开心也很期待，整个人都兴奋起来了。"
  },
  {
    aliases: ["哟", "阴阳怪气", "呼", "哼"],
    possibleMeaning: "吃醋了，空气里全是酸味，等你来顺毛。",
    sharpTranslation: "我现在就是吃醋了，你赶紧来顺着我哄。"
  },
  {
    aliases: ["[微笑表情]", "汗", "6"],
    possibleMeaning: "根本没笑，极度无语，觉得你很下头。",
    sharpTranslation: "我现在一点都笑不出来，只觉得你很下头。"
  },
  {
    aliases: ["知道啦", "晓得咯", "懂了", "记住啦"],
    possibleMeaning: "在意你，把你的叮嘱记在心上。",
    sharpTranslation: "我有把你的话认真放在心上，也会记住。"
  },
  {
    aliases: ["嘁", "谁稀罕", "少来"],
    possibleMeaning: "傲娇地不想理你，很多时候是在打情骂俏。",
    sharpTranslation: "我在嘴硬装嫌弃，其实根本没那么想推开你。"
  },
  {
    aliases: ["[拍一拍]", "戳", "[表情包开场]"],
    possibleMeaning: "想你了，想求互动，求你主动打开话题。",
    sharpTranslation: "我就是想找你互动，快点主动把话题接起来。"
  },
  {
    aliases: ["滚", "爬", "烦人"],
    possibleMeaning: "快来哄我，是打情骂俏，不是真的要你消失。",
    sharpTranslation: "我现在就是要你来哄我，不是真的让你滚。"
  },
  {
    aliases: ["你管我你来管我嘿嘿", "略略略", "偏不"],
    possibleMeaning: "有点开心，在故意逗你，想激起你的征服欲和占有欲。",
    sharpTranslation: "我现在心情不错，故意逗你来管我、在意我。"
  },
  {
    aliases: ["暗中观察", "[抿嘴笑]"],
    possibleMeaning: "心里在偷着开心，还有点小得意。",
    sharpTranslation: "我现在正偷偷开心，还有点得意地看着你。"
  },
  {
    aliases: ["嗯呼", "唔", "嘤"],
    possibleMeaning: "喜欢你，在用撒娇的鼻音示弱。",
    sharpTranslation: "我在对你撒娇，也是在示弱地表达喜欢你。"
  },
  {
    aliases: ["随便你", "爱咋咋地", "随你大小便"],
    possibleMeaning: "很无奈，已经懒得继续争，准备放弃挣扎。",
    sharpTranslation: "我已经无奈到懒得再跟你争了，你爱怎么弄就怎么弄吧。"
  },
  {
    aliases: ["去吧去吧", "你去咯", "行吧你去", "去吧"],
    possibleMeaning: "心里一万个不乐意，但碍于面子装作大度。",
    sharpTranslation: "我根本不想让你去，只是碍于面子假装大度。"
  },
  {
    aliases: ["困了", "撑不住了", "睡没", "失眠了", "睡不着", "醒了"],
    possibleMeaning: "想让人陪，深夜情绪泛滥，或者是在强行结束聊天。",
    sharpTranslation: "我现在不是单纯困，是想让你陪我，或者想借机结束聊天。"
  },
  {
    aliases: ["好的", "收到", "嗯", "知道了"],
    possibleMeaning: "只是听到了，没有太多感情色彩，像机器回复。",
    sharpTranslation: "我现在只是机械回复你，并没有多少情绪投入。"
  },
  {
    aliases: ["斗图", "只发表情包不去打字", "表情三连"],
    possibleMeaning: "没话说了，试图用表情包敷衍或者结束话题。",
    sharpTranslation: "我已经没什么想说的了，只想用表情包把这段话题糊弄过去。"
  },
  {
    aliases: ["几个意思", "啥", "啊", "?"],
    possibleMeaning: "不清楚、很懵，或者觉得你在找茬。",
    sharpTranslation: "我现在很懵，也有点觉得你在无理取闹。"
  },
  {
    aliases: ["我错了", "我的错", "都是我的错行了吧"],
    possibleMeaning: "战术性认错，只是为了息事宁人，并不是真的服。",
    sharpTranslation: "我现在只是战术性认错，好让这件事赶紧过去，我心里并没有真的服。"
  },
  {
    aliases: ["哦", "噢", "行", "嗯"],
    possibleMeaning: "生气了，冷暴力正在开启。",
    sharpTranslation: "我已经生气了，现在就是在用冷处理回你。"
  },
  {
    aliases: ["绝", "呵呵", "行"],
    possibleMeaning: "不想听解释，觉得对方在扯淡找借口。",
    sharpTranslation: "我现在根本不想听你解释，只觉得你在扯淡。"
  },
  {
    aliases: ["句号", ".", "空白消息"],
    possibleMeaning: "极度不耐烦，对你无语到了最高级。",
    sharpTranslation: "我已经不耐烦到连完整的话都懒得跟你说了。"
  },
  {
    aliases: ["睡了吗", "吃了吗", "忙吗"],
    possibleMeaning: "想你了或者无聊了，找借口来搭话。",
    sharpTranslation: "我就是想你了，或者无聊了，拿这些话来找你搭话。"
  },
  {
    aliases: ["我能有啥事", "我气什么"],
    possibleMeaning: "其实在吃醋、在生气，只是死撑着面子不承认。",
    sharpTranslation: "我其实已经吃醋生气了，只是还在硬撑面子不承认。"
  },
  {
    aliases: ["好啊", "走起", "没问题", "可以啊"],
    possibleMeaning: "爽快答应，有兴趣，也真的乐意。",
    sharpTranslation: "我是真心有兴趣，也很乐意马上跟你去做这件事。"
  },
  {
    aliases: ["对不起", "下次不会了", "原谅我", "我保证"],
    possibleMeaning: "先开口头支票安抚你，未必真的会改。",
    sharpTranslation: "我现在先把好听的话说出来安抚你，但未必真的会改。"
  },
  {
    aliases: ["好好好", "是是是", "对对对", "你说的都对"],
    possibleMeaning: "极度敷衍，完全不想继续争论。",
    sharpTranslation: "我现在只是在极度敷衍你，根本不想继续争下去。"
  },
  {
    aliases: ["你偏要这么认为我也没办法", "你非要这么想", "随你怎么想"],
    possibleMeaning: "大概率被说中了，但死不承认，还想把锅甩回去。",
    sharpTranslation: "你其实已经说中了，我只是不肯承认，还想把锅甩给你。"
  },
  {
    aliases: ["宝贝，你身上好香", "你真好看", "抱抱", "亲一个"],
    possibleMeaning: "想亲近你、想色色，是下半身和亲密欲望同时上线的铺垫。",
    sharpTranslation: "我现在很想亲你抱你，也在往更亲密的方向试探。"
  },
  {
    aliases: ["你想多了", "怎么可能", "哪有的事", "瞎说", "没有的事", "瞎猜什么", "别神经质了"],
    possibleMeaning: "多半被你说中了，正在紧急掩饰心虚。",
    sharpTranslation: "你其实说中了，我现在只是心虚地拼命掩饰。"
  },
  {
    aliases: ["还是顺其自然吧", "走一步看一步", "先这样吧", "以后再说"],
    possibleMeaning: "不想负责，在给自己找退路。",
    sharpTranslation: "我现在就是不想承担责任，先给自己留个后路。"
  },
  {
    aliases: ["不是所有人都是这样的", "别人也这样", "哪有那么夸张"],
    possibleMeaning: "其实自己就是那样，只是不想被道德标准约束。",
    sharpTranslation: "其实我就是这样，只是不想被你拿标准来要求我。"
  },
  {
    aliases: ["??", "问号连击", "又来", "又怎么了"],
    possibleMeaning: "对你的情绪或追问感到厌烦，觉得你又开始作了。",
    sharpTranslation: "我现在已经开始烦了，觉得你又在闹腾。"
  },
  {
    aliases: ["我以后再给你买这个", "下次一定买", "等发工资", "以后带你去"],
    possibleMeaning: "大概率只是画饼，不一定会兑现。",
    sharpTranslation: "我现在多半是在给你画饼，先把这关糊弄过去再说。"
  },
  {
    aliases: ["爱信不信", "懒得解释"],
    possibleMeaning: "恼羞成怒地摆烂，往往是因为被你戳中了。",
    sharpTranslation: "你已经戳到点上了，我现在恼羞成怒到懒得装了。"
  },
  {
    aliases: ["这件衣服好适合你啊", "都好看", "买买买", "这个也不错"],
    possibleMeaning: "想赶紧结束逛街流程，随便顺着你说。",
    sharpTranslation: "我现在只想赶紧结束这趟流程，所以先顺着你说好看。"
  },
  {
    aliases: ["相信我好不好", "我发誓", "骗你干嘛", "我对天发誓"],
    possibleMeaning: "多半又被说中了，想用信誓旦旦掩盖心虚。",
    sharpTranslation: "你其实又猜中了，我现在只能靠发誓来掩盖心虚。"
  },
  {
    aliases: ["我又没有干嘛", "我干啥了", "至于吗", "有那么严重吗"],
    possibleMeaning: "觉得你在小题大做，不想认真承担问题。",
    sharpTranslation: "我现在就是觉得你在小题大做，也不想认真承担这件事。"
  },
  {
    aliases: ["发个照片看看", "穿的啥", "看看腿"],
    possibleMeaning: "在深夜试探更暧昧、更带欲望的互动。",
    sharpTranslation: "我现在就是想跟你往更暧昧、更刺激的方向聊。"
  },
  {
    aliases: ["你人呢", "说话", "去哪了", "怎么不回消息"],
    possibleMeaning: "控制欲和占有欲上来了，质问你为什么不秒回。",
    sharpTranslation: "我现在就是在质问你为什么不立刻回我，我的占有欲已经上来了。"
  },
  {
    aliases: ["我喜欢独立的女生", "你要成熟点", "别太粘人", "我喜欢有自己生活的"],
    possibleMeaning: "希望你少花他的钱、时间和精力，好让他省事。",
    sharpTranslation: "我现在就是想让你少来消耗我，好让我更省钱省事。"
  },
  {
    aliases: ["要是真有事早就有了", "我跟她就是兄弟", "纯友谊", "就普通同事"],
    possibleMeaning: "这类辩解通常很可疑，像在替自己强行圆谎。",
    sharpTranslation: "这件事根本没你想的那么干净，我现在只是拼命给自己圆谎。"
  },
  {
    aliases: ["不要乱想了", "别内耗", "早点休息", "乖，去睡吧"],
    possibleMeaning: "不希望你继续追问和思考，好让你停下怀疑。",
    sharpTranslation: "你别再往下想了，我现在就是想让你赶紧停止怀疑。"
  },
  {
    aliases: ["无语", "没意思", "不想说话", "心累"],
    possibleMeaning: "多半是被说中后想不出更好的狡辩，只好装深沉装受害者。",
    sharpTranslation: "你已经把我说中了，我现在只能装无语装受害者。"
  },
  {
    aliases: ["我没有生气", "正常交流", "我很冷静"],
    possibleMeaning: "其实已经生气，只是懒得发作，不想被卷进情绪风暴。",
    sharpTranslation: "我确实已经生气了，只是现在懒得真的爆出来。"
  }
];

function normalizeMatchText(text: string) {
  return text.replace(/\s+/g, "").trim();
}

function canAliasMatch(normalizedInput: string, normalizedAlias: string) {
  if (!normalizedInput || !normalizedAlias) {
    return false;
  }

  if (normalizedInput === normalizedAlias) {
    return true;
  }

  if (normalizedAlias.length <= 1) {
    return false;
  }

  return normalizedInput.includes(normalizedAlias);
}

export function findBestSubtextMapping(input: string): MatchedSubtextMapping | undefined {
  const normalizedInput = normalizeMatchText(input);
  let bestMatch: MatchedSubtextMapping | undefined;
  let bestLength = 0;

  for (const entry of subtextMappings) {
    for (const alias of entry.aliases) {
      const normalizedAlias = normalizeMatchText(alias);
      if (!canAliasMatch(normalizedInput, normalizedAlias)) {
        continue;
      }

      if (normalizedAlias.length > bestLength) {
        bestLength = normalizedAlias.length;
        bestMatch = { entry, matchedAlias: alias };
      }
    }
  }

  return bestMatch;
}

export function buildHardcodedTranslationReport(
  original: string,
  matched: MatchedSubtextMapping,
  taPronoun: TaPronoun | null,
): LoveTranslationReport {
  const pronoun = taPronoun ?? "TA";

  return {
    original,
    possibleMeaning: matched.entry.possibleMeaning,
    sharpTranslation: matched.entry.sharpTranslation,
    betterExpression: `比起说“${original}”，你更可以直接说：${matched.entry.sharpTranslation}`,
    actionAdvice: `少让${pronoun}猜你这句里的潜台词，直接把情绪和期待说清楚，会比试探更有效。`
  };
}

export function resolveHardcodedPollutionText(matched: MatchedSubtextMapping): string {
  return legacyPollutionOverrides[matched.matchedAlias] ?? matched.entry.sharpTranslation;
}
