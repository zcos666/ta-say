# api services

共享模块

用于统一 LLM 与接口请求封装。

当前约定：

- `llmClient.ts`
- `generateTaReply(request)`：供 TA 回复链路调用，失败时由上层回退到本地 fallback
- `llmClient.loveTranslate(chatText)`：供翻译官调用，失败时由上层回退到 mock 结果

实现原则：

- 前端只保留最小封装，不在页面里直接发 LLM 请求
- 所有接口调用都要允许失败，并由上层兜底
- 环境变量统一使用 `VITE_LLM_API_KEY`、`VITE_LLM_BASE_URL`、`VITE_LLM_MODEL`
