# 《过拟合恋人》Architecture

## 1. 文档目标

本文档用于把 `ta说_PRD_最终版.md` 落成可执行技术架构，明确：

1. 规则系统与模型系统的边界
2. 页面、业务逻辑和服务层的职责
3. 正式功能必须如何落地

## 2. 架构原则

1. 剧情推进靠规则，不交给模型自由决定。
2. 文本细节、翻译结果和分享卡总结由模型负责生成。
3. 页面组件不直接调用模型或接口。
4. 正式功能不得由静态页、假数据或预设替代。
5. 错误处理可以存在，但不能伪装成正式结果。

## 3. 整体架构

```text
Browser App
├─ UI Layer
│  ├─ Start / Selection / Chat / Space / Truth / Wake
│  ├─ Translator
│  └─ Share Card
├─ Experience Engine
│  ├─ Story State Machine
│  ├─ Trigger Engine
│  ├─ Pollution Engine
│  ├─ Draft Monitor
│  ├─ Save Load Manager
│  └─ Ending Resolver
├─ Business Layer
│  ├─ Reply Engine
│  ├─ Translator Service
│  ├─ Share Card Composer
│  ├─ Voice Input Service
│  └─ Storage Repository
└─ API Layer
   ├─ Anti Translate API
   ├─ Ta Reply API
   ├─ Love Translate API
   └─ Share Line API
```

## 4. 模块职责

### 4.1 规则系统

负责：

- 剧情阶段
- 关键词触发
- 反义时间段
- 读档状态
- 空间与退出异常
- 结局判定

### 4.2 模型系统

负责：

- 反义污染补充生成
- `TA` 回复生成
- 恋爱翻译官结构化输出
- 分享卡一句话生成

### 4.3 服务系统

负责：

- 请求封装
- 结果清洗
- 状态持久化
- 语音输入接入
- 分享卡数据组装

## 5. 接口要求

正式接口至少包括：

- `POST /api/anti-translate`
- `POST /api/ta-reply`
- `POST /api/love-translate`
- `POST /api/share-line`

这些接口属于正式能力边界，不应长期由开发期假实现替代。

## 6. 正式能力要求

以下能力必须按正式方式落地：

1. `TA` 回复生成
2. 恋爱翻译官结构化生成
3. 语音输入转文字
4. 分享卡数据与导出

以下做法都不能算完成：

- 用静态文本占位
- 用固定示例结果循环输出
- 用本地假接口长期替代正式接口
- 用预设文本替代语音输入

## 7. 当前架构任务

1. 补齐正式接口边界
2. 收拢模型请求到统一服务层
3. 保证分享卡、翻译官、聊天主链路都依赖真实业务数据
4. 清理文档和实现中的功能代偿口径
