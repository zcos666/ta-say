# 《ta说》Architecture

## 1. 文档目标

本文档用于把 PRD 落成可开发的技术架构，重点解决以下问题：

1. 如何把“前 80% 恋爱 Meta 恐怖游戏”与“后 20% 恋爱翻译官”做成一个统一产品，而不是两个割裂页面。
2. 如何在 2 人并行开发的情况下，清晰划分模块边界、共享数据结构和接口契约。
3. 如何保证 MVP 在黑客松周期内稳定可演示、可离线降级、可后续继续迭代。

---

## 2. 架构原则

1. 剧情推进靠规则，不靠 LLM 自由发挥。
2. 核心体验优先于工程复杂度，先稳定演示，再增加表现力。
3. 前后端接口尽量薄，优先让前端可用 mock 数据独立开发。
4. 所有 Meta 记忆、读档、草稿监听都先保存在本地，不依赖用户账号系统。
5. 语音、LLM、分享卡都必须支持降级方案，确保现场网络波动时仍可 Demo。

---

## 3. 产品架构概览

```text
+---------------------------------------------------------------+
|                           Browser App                         |
|                     Vite + React + TypeScript                 |
+---------------------------------------------------------------+
| UI Layer                                                      |
| - StartPage / SelectionPage / ChatPage / SpacePage            |
| - TruthPage / WakePage / TranslatorPage / ShareCardPage       |
+---------------------------------------------------------------+
| Experience Engine                                             |
| - StoryStateMachine                                           |
| - TriggerEngine                                               |
| - PollutionEngine                                             |
| - DraftMonitor                                                |
| - SaveLoadManager                                             |
| - EndingResolver                                              |
+---------------------------------------------------------------+
| App Services                                                  |
| - LLMClient                                                   |
| - VoiceInputService                                           |
| - LocalStorageRepository                                      |
| - ShareCardComposer                                           |
+---------------------------------------------------------------+
| API Layer                                                     |
| - /api/anti-translate                                         |
| - /api/ta-reply                                               |
| - /api/love-translate                                         |
| - /api/share-line                                             |
+---------------------------------------------------------------+
| Runtime Data                                                  |
| - session state (memory)                                      |
| - localStorage persistent state                               |
| - static script/config assets                                 |
+---------------------------------------------------------------+
```

---

## 4. 技术选型

### 4.1 前端

- `Vite + React + TypeScript`
- `React Router` 或轻量页面状态切换
- `Zustand` 作为全局状态容器
- `Tailwind CSS` 或 `CSS Modules` 实现移动端聊天 UI
- `Framer Motion` 或纯 CSS 做轻量故障动效
- `html-to-image` + `canvas` 生成分享卡截图

### 4.2 后端

- 优先方案：`Node.js` Serverless API
- 可选部署：`Vercel Functions` / `Netlify Functions` / 自建轻量 Express
- 仅做四个薄接口，不做数据库、不做账号系统

### 4.3 外部能力

- 语音输入：浏览器 `Web Speech API`
- LLM：任意稳定文本模型，要求低延迟、可控输出
- 离线兜底：本地规则表 + 预设回复 + 预设翻译结果

---

## 5. 模块拆分

### 5.1 页面层

| 页面 | 作用 | 负责人建议 |
|---|---|---|
| StartPage | 进入作品、展示氛围、判断是否已通关 | 恐怖游戏负责人 |
| SelectionPage | 选择 fearType 和 taPronoun | 恐怖游戏负责人 |
| ChatPage | 核心聊天体验、输入、污染、回复、读档、退出 | 恐怖游戏负责人 |
| SpacePage | 异常动态支线页 | 恐怖游戏负责人 |
| TruthPage | 真相揭示 | 恐怖游戏负责人 |
| WakePage | 梦醒收束 + 解锁翻译官 | 恐怖游戏负责人 |
| TranslatorPage | 聊天翻译输入、输出报告 | 翻译官负责人 |
| ShareCardPage | 分享卡生成与截图导出 | 翻译官负责人 |

### 5.2 核心引擎层

| 模块 | 职责 | 说明 |
|---|---|---|
| `StoryStateMachine` | 控制剧情阶段和页面流转 | 绝不交给 LLM |
| `TriggerEngine` | 识别关键词、发送次数、时间段、事件条件 | 所有规则入口 |
| `PollutionEngine` | 先走规则表，再决定是否调用 LLM 补充 | 负责 Before / After |
| `DraftMonitor` | 监听输入框内容与删除行为 | 记录 `deletedDrafts` |
| `SaveLoadManager` | 自动存档、读档、保留 metaMemory | 实现“TA 记得” |
| `ReplyEngine` | 生成 TA 回复，优先级为脚本 > LLM > fallback | 负责恐怖分级 |
| `EndingResolver` | 根据会话数据计算结局类型 | 给分享卡和总结使用 |

### 5.3 服务层

| 模块 | 职责 |
|---|---|
| `LLMClient` | 统一请求四个接口，处理超时、重试、fallback |
| `VoiceInputService` | 调用浏览器语音识别并做失败降级 |
| `LocalStorageRepository` | 统一封装本地持久化、版本迁移、清档 |
| `ShareCardComposer` | 组合分享卡数据，生成截图用数据结构 |

---

## 6. 推荐目录结构

```text
ta-say/
  src/
    app/
      routes/
      store/
      providers/
    pages/
      StartPage/
      SelectionPage/
      ChatPage/
      SpacePage/
      TruthPage/
      WakePage/
      TranslatorPage/
      ShareCardPage/
    components/
      chat/
      ui/
      share/
    features/
      story/
        stateMachine.ts
        stageConfig.ts
        triggerEngine.ts
        endingResolver.ts
      pollution/
        pollutionEngine.ts
        pollutionRules.ts
      reply/
        replyEngine.ts
        replyFallbacks.ts
      drafts/
        draftMonitor.ts
      save-load/
        saveLoadManager.ts
      translator/
        translatorService.ts
        translatorPrompts.ts
      share-card/
        shareCardComposer.ts
    services/
      api/
        llmClient.ts
      voice/
        voiceInputService.ts
      storage/
        storageRepository.ts
    config/
      keywords.ts
      prompts.ts
      staticAssets.ts
    types/
      session.ts
      api.ts
      story.ts
  api/
    anti-translate.ts
    ta-reply.ts
    love-translate.ts
    share-line.ts
```

---

## 7. 状态模型设计

### 7.1 会话态 `SessionState`

```ts
type FearType = "害怕被抛下" | "害怕被控制" | "害怕说真话";
type TaPronoun = "他" | "她" | "TA";
type StoryStage =
  | "intro"
  | "normal_chat"
  | "first_pollution"
  | "draft_exposed"
  | "time_pollution"
  | "save_loaded_once"
  | "save_loaded_twice"
  | "meta_break"
  | "truth_reveal"
  | "wake_up"
  | "translator_unlocked"
  | "share_ready";

interface ChatMessage {
  id: string;
  role: "user" | "ta" | "system";
  originalText?: string;
  displayedText: string;
  kind?: "normal" | "polluted" | "warning" | "glitch";
  timestamp: number;
}

interface SessionState {
  fearType: FearType | null;
  taPronoun: TaPronoun | null;
  stage: StoryStage;
  chatHistory: ChatMessage[];
  originalInputs: string[];
  pollutedInputs: string[];
  triggeredKeywords: string[];
  deletedDrafts: string[];
  metaMemory: string[];
  pollutionCount: number;
  deletedDraftCount: number;
  loadCount: number;
  sendCount: number;
  spaceVisitCount: number;
  exitClickCount: number;
  activeTimedPollution: boolean;
  hasFinishedGame: boolean;
  endingType: string | null;
  translatorReport?: LoveTranslationReport;
  shareCardData?: ShareCardData;
}
```

### 7.2 本地持久化 `PersistedState`

```ts
interface PersistedState {
  hasFinishedGame: boolean;
  autoSaveSnapshot?: SessionSnapshot;
  loadCount: number;
  metaMemory: string[];
  shareCardData?: ShareCardData;
  version: number;
}
```

### 7.3 自动存档快照 `SessionSnapshot`

- 只恢复聊天现场和剧情节点
- 不恢复 `metaMemory`
- 不恢复 `loadCount`
- 不恢复 `deletedDrafts`
- 不恢复已经暴露过的异常事件

这样才符合 PRD 中“玩家回档了，但 TA 仍然记得”的 Meta 体验。

---

## 8. 剧情状态机

### 8.1 主状态流

```text
start
  -> selection
  -> intro
  -> normal_chat
  -> first_pollution
  -> draft_exposed
  -> meta_break
  -> truth_reveal
  -> wake_up
  -> translator_unlocked
  -> share_ready
```

### 8.2 关键转场条件

| 当前阶段 | 进入条件 | 退出条件 |
|---|---|---|
| `intro` | 进入聊天页后首段开场消息 | 用户完成 2 次正常发送 |
| `normal_chat` | 前 2 次对话 | 第 3 次发送或关键词命中时进入第一次污染 |
| `first_pollution` | 保证第一次污染必定发生 | 污染完成并收到 TA 回复 |
| `draft_exposed` | 删除敏感草稿且剧情进入中段 | 草稿读取事件触发完成 |
| `meta_break` | 读档第 2/3 次、空间异常、退出异常任一达到阈值 | 真相爆发脚本开始 |
| `truth_reveal` | 真相脚本连续输出完成 | 进入梦醒页 |
| `wake_up` | 显示普通聊天现实 | 用户点击查看翻译官 |
| `translator_unlocked` | 通关后或首页直达 | 完成翻译或进入分享卡 |

### 8.3 子系统状态

- `loadCount` 只增不减
- `spaceVisitCount` 控制空间页内容升级
- `exitClickCount` 控制退出按钮文案和 TA 回复升级
- `activeTimedPollution` 控制 30 秒污染期

---

## 9. 数据流设计

### 9.1 游戏聊天数据流

```text
用户输入
  -> DraftMonitor 记录输入变化
  -> TriggerEngine 检查关键词/发送次数/阶段
  -> PollutionEngine 生成最终发送文本
  -> ChatPage 执行动画并写入 chatHistory
  -> ReplyEngine 生成 TA 回复
  -> StoryStateMachine 更新阶段
  -> SaveLoadManager 视情况自动存档或写入 metaMemory
```

### 9.2 翻译官数据流

```text
用户输入聊天记录
  -> TranslatorPage 表单校验
  -> translatorService 请求 /api/love-translate
  -> 返回结构化报告
  -> EndingResolver / ShareCardComposer 读取关键句
  -> ShareCardPage 生成分享卡
```

### 9.3 分享卡数据流

```text
SessionState + TranslatorReport
  -> EndingResolver 计算 endingType
  -> /api/share-line 或本地模板生成一句话
  -> ShareCardComposer 组装页面模型
  -> 截图导出
  -> localStorage 保存最近一次结果
```

---

## 10. 核心引擎设计

### 10.1 TriggerEngine

职责：

1. 判断是否命中污染关键词。
2. 判断是否到达固定剧情发送次数。
3. 判断是否处于 30 秒反义时间段。
4. 判断是否触发草稿曝光、空间异常、退出异常、定位惊吓。

优先级：

```text
硬编码剧情节点
> 明确事件触发
> 关键词触发
> 时间段触发
> LLM 自由生成
> fallback
```

### 10.2 PollutionEngine

执行顺序：

1. 查关键词映射表。
2. 若命中固定高优先级关键词，直接使用规则文本。
3. 若未命中，但当前阶段要求污染，则调用 `/api/anti-translate`。
4. 若接口失败，使用按 `fearType` 分类的本地兜底改写。

输出：

```ts
interface PollutionResult {
  originalText: string;
  pollutedText: string;
  triggerReason: "count" | "keyword" | "timed" | "scripted";
  keyword?: string;
  shouldShowBeforeAfter: boolean;
}
```

### 10.3 ReplyEngine

执行顺序：

1. 先判断是否有脚本化事件回复。
2. 再尝试根据阶段和关键词生成预设回复。
3. 若需要更自然变化，调用 `/api/ta-reply`。
4. 接口失败时使用本地回复库。

关键要求：

- 单次仅返回 1-2 句
- 每句长度短
- 恐怖程度随阶段升级
- 不允许替换剧情主走向

### 10.4 SaveLoadManager

职责：

1. 在第一次污染前创建自动存档。
2. 读档时恢复 `chatHistory` 和 `stage` 到存档点。
3. 保留 `loadCount`、`metaMemory`、`deletedDrafts` 等 Meta 数据。
4. 根据读档次数插入异常消息。

### 10.5 DraftMonitor

核心逻辑：

1. 监听输入框文本变化。
2. 如果文本中出现敏感词，标记为草稿候选。
3. 当用户删除或清空时，将片段写入 `deletedDrafts`。
4. 用去重和长度阈值避免记录噪声。

---

## 11. API 契约

### 11.1 `POST /api/anti-translate`

请求：

```json
{
  "userInput": "没事，你忙吧",
  "keyword": "没事",
  "stage": "first_pollution",
  "fearType": "害怕说真话"
}
```

响应：

```json
{
  "pollutedText": "我很介意，但我希望你自己猜出来。",
  "source": "rule"
}
```

### 11.2 `POST /api/ta-reply`

请求：

```json
{
  "stage": "draft_exposed",
  "originalInput": "没事",
  "pollutedInput": "我很介意，但我希望你自己猜出来。",
  "events": ["draft_exposed"],
  "loadCount": 1,
  "deletedDrafts": ["我有点害怕"]
}
```

响应：

```json
{
  "reply": [
    "你刚刚删掉的那句，",
    "比这句真。"
  ],
  "source": "llm"
}
```

### 11.3 `POST /api/love-translate`

请求：

```json
{
  "chatText": "A: 你今天怎么这么晚回？\nB: 没事，你忙吧。",
  "context": {
    "fearType": "害怕说真话"
  }
}
```

响应：

```json
{
  "original": "没事，你忙吧。",
  "possibleMeaning": "我有点失落，但我不想显得自己很需要你。",
  "sharpTranslation": "我不是没事，我是在等你自己发现我不开心。",
  "betterExpression": "我知道你可能有事，但我等了挺久，心里有点失落。你可以告诉我刚刚发生了什么吗？",
  "actionAdvice": "不要用没事测试对方，把具体需求说清楚。"
}
```

### 11.4 `POST /api/share-line`

请求：

```json
{
  "endingType": "草稿幽灵",
  "hardestSentence": "没事，你忙吧。",
  "pollutionCount": 7,
  "deletedCount": 3,
  "loadCount": 2
}
```

响应：

```json
{
  "shareLine": "你删掉的话，比你发出去的更诚实。"
}
```

---

## 12. 路由与页面装配

推荐路由：

```text
/                 -> StartPage
/select           -> SelectionPage
/chat             -> ChatPage
/space            -> SpacePage
/truth            -> TruthPage
/wake             -> WakePage
/translator       -> TranslatorPage
/share            -> ShareCardPage
```

页面装配原则：

1. `ChatPage` 是主容器，挂载聊天流、顶部按钮、输入栏和事件浮层。
2. `SpacePage` 是支线页，但依赖同一份 `SessionState`。
3. `TranslatorPage` 与 `ShareCardPage` 不重置会话，可读取通关数据和翻译结果。

---

## 13. 前后端协作边界

### 13.1 前端负责

- 剧情状态机
- 页面流转
- 聊天气泡渲染
- 反义污染触发逻辑
- 读档与本地记忆
- 输入框监听
- 分享卡页面与截图
- 离线 fallback

### 13.2 API 层负责

- LLM prompt 封装
- 输出格式约束
- 超时和错误处理
- 安全过滤和敏感风格约束

### 13.3 两位开发者共享边界

共享类型定义：

- `SessionState`
- `LoveTranslationReport`
- `ShareCardData`
- `StoryStage`
- `EndingType`

共享配置文件：

- `keywords.ts`
- `stageConfig.ts`
- `prompts.ts`
- `replyFallbacks.ts`

---

## 14. 双人并行开发接口

### 14.1 恐怖游戏负责人交付给翻译官负责人的内容

1. 通关后会话统计：
   - `pollutionCount`
   - `deletedDraftCount`
   - `loadCount`
   - `spaceVisitCount`
   - `endingType`
   - `hardestSentence`
2. 通关状态：
   - `hasFinishedGame`
3. 最近一次对话摘要：
   - `chatHistory`
   - `pollutedInputs`

### 14.2 翻译官负责人交付给恐怖游戏负责人的内容

1. `TranslatorPage` 路由与组件
2. `love-translate` 接口请求封装
3. `ShareCardData` 生成器
4. 分享卡导出能力
5. 通关后的入口组件

### 14.3 集成点

唯一强依赖集成点：

1. `hasFinishedGame`
2. `translator_unlocked` 阶段跳转
3. `ShareCardData` 的统计字段来源

---

## 15. 离线与降级策略

### 15.1 必须可离线工作的部分

- 开始页、选择页、聊天页基本流程
- 关键词污染
- 预设 TA 回复
- 输入框监听
- 读档三状态
- 真相页、梦醒页
- 分享卡静态生成

### 15.2 可降级部分

- 语音输入降级为预设语音选项
- LLM 污染生成降级为规则表
- TA 回复降级为回复库
- 恋爱翻译官降级为模板输出
- 分享卡一句话降级为本地文案映射

---

## 16. 风险与对策

| 风险 | 描述 | 对策 |
|---|---|---|
| LLM 不稳定 | 输出太长、跑题、失去恐怖感 | 强约束 prompt + JSON schema + 本地 fallback |
| 状态失控 | 多个事件同时触发导致剧情错乱 | 明确状态机和事件优先级 |
| 双人开发冲突 | 同时修改聊天页和共享类型 | 提前锁定目录边界和类型文件 |
| 现场网络差 | LLM 或语音接口超时 | 全链路可降级 |
| 体验过长 | 现场无法在 8 分钟内跑完 | 强制触发节点，不依赖用户自由输入 |
| 分享卡不好看 | 传播欲不够 | 尽早做一版高保真静态样式 |

---

## 17. 测试策略

### 17.1 单元测试优先对象

- `triggerEngine`
- `pollutionEngine`
- `endingResolver`
- `saveLoadManager`

### 17.2 集成测试优先对象

- 第三次发送必触发第一次污染
- 删除敏感草稿后能在中段被读取
- 读档 3 次按钮状态与结果正确
- 通关后首页出现翻译官入口
- 分享卡正确展示统计字段

### 17.3 手动走查脚本

1. 正常聊天到第一次污染。
2. 输入敏感词后删除，验证草稿监听。
3. 连续读档 3 次，验证 Meta 记忆不消失。
4. 通关进入翻译官，输出结构化结果。
5. 生成分享卡并截图导出。

---

## 18. 版本规划

### MVP

- 完整单结局流程
- 文本输入
- 语音输入或预设模拟
- 规则污染 + TA 回复
- 草稿监听
- 读档系统
- 翻译官
- 分享卡

### MVP+

- 空间异常页
- 退出异常
- 反义时间段
- 假定位图
- 更强动效

### Post Hackathon

- 多结局
- 图片 OCR
- 更复杂的恋爱语气分支
- 可配置剧本编辑器

---

## 19. 最终结论

《ta说》最适合采用“前端单页状态机 + 薄 API + 本地 Meta 存储”的架构：

1. 前半段恐怖体验由规则与状态机强控制，保证可演示。
2. 后半段翻译官由结构化 LLM 输出增强实用性。
3. 双人协作通过共享状态模型、共享接口契约和清晰页面边界实现并行。
4. 所有关键能力都具备离线或半离线降级方案，适合黑客松场景。
