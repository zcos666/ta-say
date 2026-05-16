# 开发者 A 工作入口

## 1. 你的职责

你负责《ta说》的恐怖游戏主体验：

- 首页
- 选择页
- 聊天主界面
- 污染机制
- TA 回复
- 草稿监听
- 读档系统
- 空间异常
- 真相页
- 梦醒页

## 2. 你优先进入的目录

- `src/pages/StartPage`
- `src/pages/SelectionPage`
- `src/pages/ChatPage`
- `src/pages/SpacePage`
- `src/pages/TruthPage`
- `src/pages/WakePage`
- `src/features/pollution`
- `src/features/reply`
- `src/features/drafts`
- `src/features/save-load`

## 3. 你先不要动的目录

- `src/pages/TranslatorPage`
- `src/pages/ShareCardPage`
- `src/features/translator`
- `src/features/share-card`

## 4. 你第一阶段的目标

1. 打通首页到梦醒页。
2. 让第 3 次发送必触发第一次污染。
3. 让读档系统和草稿监听具备最小闭环。
4. 写入 `hasFinishedGame`，为 B 提供通关入口数据。

## 5. 你必须提供给 B 的数据

- `hasFinishedGame`
- `pollutionCount`
- `deletedDraftCount`
- `loadCount`
- `endingType`
- `hardestSentence`
- `fearType`

## 6. 你开始编码前先读

- `ta说_Architecture.md`
- `ta说_实施计划.md`
- `docs/统一文件架构.md`
- `docs/协作分工与目录归属.md`

## 7. 你的 Trae 提示词目录

- `.trae/prompts/developer-a`

## 8. 你的第一批建议任务

1. 聊天页骨架
2. 发送消息链路
3. 第一次污染
4. 草稿监听
5. 读档三状态
6. 真相页逐行播放
