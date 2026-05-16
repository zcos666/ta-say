# storage services

共享模块。

用于封装 `localStorage` 读写、状态迁移和会话持久化。

## 约束

- 页面不直接操作存储。
- 读档与 Meta 记忆规则由上层 feature 决定。
- 存储结构变更时必须同步更新共享文档。
