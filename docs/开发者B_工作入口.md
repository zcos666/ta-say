# 开发者 B 工作入口

## 1. 你的职责

你负责《ta说》的翻译官与传播闭环：

- 恋爱翻译官页面
- 翻译结果结构化展示
- 分享卡页面
- 分享卡导出
- 通关后首页入口
- 语音输入或降级
- 翻译相关 API 封装

## 2. 你优先进入的目录

- `src/pages/TranslatorPage`
- `src/pages/ShareCardPage`
- `src/features/translator`
- `src/features/share-card`
- `src/services/voice`
- `src/components/share`

## 3. 你先不要动的目录

- `src/pages/ChatPage`
- `src/features/pollution`
- `src/features/reply`
- `src/features/save-load`

## 4. 你第一阶段的目标

1. 打通翻译官输入到结构化结果的 mock 闭环。
2. 让分享卡基于固定 mock 数据先跑起来。
3. 接首页通关后入口。
4. 再接真实会话统计与 API。

## 5. 你依赖 A 提供的数据

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

- `.trae/prompts/developer-b`

## 8. 你的第一批建议任务

1. 翻译官页面骨架
2. 结构化结果卡片
3. mock `translatorService`
4. 分享卡页面
5. 通关后首页入口
6. 导出能力预留
