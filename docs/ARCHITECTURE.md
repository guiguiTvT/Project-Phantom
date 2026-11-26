# 架构设计 — Project Phantom：破壁行动

## 1. 技术栈

| 层 | 选型 | 用途 |
| --- | --- | --- |
| 前端框架 | React 18 + TypeScript + Vite 6 | SPA |
| 样式 | Tailwind CSS 3.4 | 设计令牌与布局 |
| 动画 | Framer Motion | 启动、反转、面板过渡 |
| 状态 | Zustand 5（persist） | 统一游戏状态 + 本地存档 |
| 图标 | Lucide React | 功能图标 |
| 关系图 | React Flow 12 | 人物关系图 |
| 图表 | Recharts | 结算四维图（Phase 5） |
| 服务端 | Node.js + Express 4 + tsx | 模型代理与状态接口 |
| 存档 | LocalStorage | 单机存档、快照 |
| 测试 | Vitest（Phase 1+）/ Playwright（Phase 6） | 规则与端到端 |

模型调用只发生在服务端，前端仅请求自身 `/api/*`（开发期由 Vite proxy 转发）。配置项：`LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`、`PORT`。无配置时服务端报告 `demo` 模式，前端显示「本地演示」。

## 2. 目录

```
src/
  components/
    boot/           启动终端、LOGO、身份符文
    os/             顶栏、侧栏、右栏、底栏、模态框
    views/          动态墙、情报板、关系图、模拟舱、防御台
    ui/             通用按钮 / 标签 / 面板 / Toast
  pages/            BootPage / IdentityPage / OSPage
  layouts/          PhantomShell（五区网格）
  stores/           gameStore（唯一可写状态入口）
  engine/
    GameEngine.ts   状态初始化、证据归档、AP 守卫、日志、幂等
    PersonalityEngine.ts  行为向量累计（判定在 Phase 5）
    （EventEngine / EndingEngine / ReplayEngine 按阶段补充）
  data/             纯配置：feed / evidence / contradictions / npcs / events / actions / personalities / endings / gameConfig
  services/         saveService / aiService（Phase 3）
  types/            GameState、内容数据、人格、事件、结局类型
  hooks/            useAiStatus 等
  utils/            cn、seed/PRNG、时间格式化
server/
  index.ts          Express 入口
  routes/           API 路由（当前 /api/health、/api/ai/status）
  agents/ prompts/ services/ validators/   Phase 3 AI 编排
tests/              Vitest 规则与数据完整性
docs/               本目录
```

## 3. 状态与数据流

```
UI event
  → store action
    → GameEngine 纯函数（规则校验 + 状态变换 + 日志 + 人格向量）
      → EventEngine（Phase 4：条件匹配、onceOnly、后续事件）
        → Zustand set + persist
          → 视图按权限投影可见信息
```

- **GameEngine 不依赖 React**，输入 `GameState` 与操作参数，输出新状态或拒绝原因。
- **Store 是唯一写入点**；组件只读状态、发 action。
- **AI 输出不直接写状态**：Phase 3 起，服务端校验后的 `intent / eventRequests` 作为普通 action 建议返回，仍由 GameEngine 裁决。
- **权限投影**：ACT II 中视图层过滤 `accessLevel === 'redteam'` 的内容；该过滤必须在数据选择器统一实现，而非依赖隐藏按钮。

## 4. 核心类型（src/types）

- `GameState`：`screen / phase / player / actionPoints / collectedEvidenceIds / evidenceLinks / npcStates / world / triggeredEventIds / log / personality / snapshots / seed / endingId / startedAt / updatedAt`
- `Evidence`：来源、发布时间、摘要、详述、`verification`（cross-checked / pending / stale / disputed）、矛盾组、关联动态与 NPC、可见级别。
- `FeedPost`：作者、频道、时间、内容、标签、关联证据。
- `Npc`：身份、性格、已知事实、记忆、关系、当前任务 / 情绪、对话历史、权限范围。
- `EventDefinition`：触发条件、状态效果、后续事件、延迟回合、一次性。
- `ActionDefinition`：阶段、行动点成本、人格权重向量、意图。
- `PersonalityConfig`：16 种代码、名称、主题色、叙事文本。
- `EndingConfig`：条件、优先级、叙事文本。

## 5. 确定性与可重放

- 初始世界状态与内容数据为常量；随机性统一走 `mulberry32(seed)`，种子写入状态。
- 规则计算为纯函数，给定状态 + 行动 + 种子得到一致结果。
- 快照包含完整状态与日志，Phase 6 的回溯从快照派生新分支，不覆盖原分支。
- 幂等：证据归档按 ID 去重、一次性事件有 `triggeredEventIds` 守卫。

## 6. 存档

- Zustand `persist`，key `phantom.save.v1`，写入 `localStorage`。
- `saveService` 暴露 `hasSave / readSaveMeta / clearSave`，供启动页「继续上次游戏」。
- 刷新只恢复既有状态，不发放行动点；`updatedAt` 用于展示存档时间。
- 版本号进入存档；Phase 5+ 增加迁移函数。

## 7. AI 安全（Phase 3 设计约束）

1. 浏览器只看到 `{ reply, intent, evidenceIds, emotion, eventRequests }`，看不到 prompt 与服务端配置。
2. 服务端以 Zod 校验结构；字段白名单、NPC 权限范围、当前阶段状态二次过滤。
3. 事件请求只输出「申请」，由 GameEngine 依据数据表匹配后执行。
4. 超时（默认 12s）与解析失败走本地规则回复；服务端与前端均不阻塞游戏。
5. `GET /api/ai/status` 只返回 `mode` 与模型名，不返回 base URL 或密钥。

## 8. UI 架构

- `PhantomShell` 使用 CSS Grid：`48px / 1fr / 36px` 行，`228px / 1fr / 328px` 列，底栏横跨。
- 视图注册表驱动侧栏；未开放视图显示带阶段标识的说明面板（如「模拟舱 · Phase 2」），不提供虚假操作。
- 设计令牌集中在 `tailwind.config.ts` 与 `src/index.css`；共享面板 / 标签 / 按钮组件避免样式漂移。
- 动效遵守克制原则；启动终端与反转故障动画独立组件，可跳过。

## 9. 阶段计划

| 阶段 | 范围 | 当前 |
| --- | --- | --- |
| P1 | 工程、启动页、身份页、OS 壳、类型与数据、存档基础 | 本轮交付 |
| P2 | 情报调查、证据关联、行动点、风险模拟 | 待验收后 |
| P3 | 5 名 NPC 对话、服务端 AI、校验与降级 | 计划 |
| P4 | 事件传播、身份反转、防御阶段、完整通关 | 计划 |
| P5 | 16 人格判定、6 结局、复盘、卡片导出 | 计划 |
| P6 | 回溯、平行世界对比、视觉打磨、E2E、部署 | 计划 |

## 10. 测试策略

- 单元（Vitest）：种子确定性、AP 非负、证据去重、日志完整性、人格向量累计、数据完整性（数量 / 唯一性 / 引用闭合 / 16 人格 / 6 结局）。
- 集成（Phase 3+）：NPC 校验器拒绝越权事件。
- E2E（Phase 6，Playwright）：启动 → 身份 → 动态 → 刷新续档 → 反转状态保留。
- 构建门禁：`npm run typecheck && vite build`。
