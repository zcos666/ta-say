# 《ta说》项目工作台

《ta说》是一个“前半段恋爱 Meta 恐怖游戏 + 后半段恋爱语言翻译官”的互动网页项目。

当前仓库已经完成：

- PRD 文档
- 总体技术架构
- 双人实施计划
- Trae `vibe-coding` 指引
- 统一目录骨架
- 版本规范与工具链文档
- 开发者 A / B 分工入口

## 文档导航

核心产品与架构：

- `ta说_PRD_最终版.md`
- `ta说_Architecture.md`
- `ta说_实施计划.md`
- `ta说_Trae_Vibe_Coding_指引.md`

仓库治理文档：

- `docs/统一文件架构.md`
- `docs/版本规范.md`
- `docs/工具链与开发工具.md`
- `docs/协作分工与目录归属.md`
- `docs/开发者A_工作入口.md`
- `docs/开发者B_工作入口.md`
- `CHANGELOG.md`

## 当前建议开发顺序

1. 两位开发者先共同锁定共享类型、路由和状态骨架。
2. 开发者 A 打通首页到梦醒页的主剧情链路。
3. 开发者 B 打通翻译官到分享卡的 mock 闭环。
4. 第二轮再接 LLM、语音、离线 fallback 和视觉优化。

## 当前版本

- 项目阶段：`MVP Foundation`
- 仓库版本：`v0.1.0-foundation`
- 版本说明见：`docs/版本规范.md`

## 目录原则

- `src/pages/StartPage` 到 `src/pages/WakePage` 主要由开发者 A 负责。
- `src/pages/TranslatorPage` 和 `src/pages/ShareCardPage` 主要由开发者 B 负责。
- `src/types`、`src/services/storage`、`src/features/story` 为共享区域。
- 共享区域改动必须先同步双方。
