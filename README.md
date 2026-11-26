# Project Phantom：破壁行动

> 沉浸式校园社交工程攻防模拟 · Hack4Good 2026「技术向善」赛道
> 当前版本：`0.2.0-phase1`（引导式剧情重构版，Phase 2 未开始）

一场分为两幕的虚构校园演练：你先是拥有全局观察权限的授权红队，调查活动平台里互相冲突的时间与来源；随后权限被收回，你以普通学生身份，面对前半段行为留下的共享世界状态。

所有校园、人物、账号与权限均为虚构。本项目不连接任何真实校园系统或社交账号，也不会要求输入真实姓名、学号、密码或验证码。

---

## 快速开始

环境要求：Node.js 20+（开发时使用 Node.js 24），npm 10+。

```bash
npm install
npm run dev
```

- 前端（Vite）：<http://localhost:5173>
- 本地 API（Express）：<http://localhost:8787>

`npm run dev` 会同时启动两者。无需任何模型配置即可完整浏览当前阶段。

### 模型配置（可选，Phase 3 才使用）

服务端从环境变量读取模型配置，**不会下发到浏览器**：

```bash
cp .env.example .env
```

`.env` 中至少包含：

```dotenv
LLM_BASE_URL=https://your-provider.example/v1
LLM_API_KEY=
LLM_MODEL=
PORT=8787
```

- 未配置时，`GET /api/ai/status` 返回 `mode: "demo"`，游戏正常进入本地演示模式。
- `GET /api/ai/status` 只返回模式、模型名与运行时长，不返回 Base URL 或 Key。
- 服务端不绑定特定厂商；任何兼容 Chat Completions 风格的服务均可通过这三个变量接入。
- 不要把 `.env` 提交到版本库；`.gitignore` 已忽略。

---

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 同时启动 Vite 与 API（开发模式） |
| `npm run dev:web` | 只启动前端 |
| `npm run dev:server` | 只启动 API（tsx watch） |
| `npm run typecheck` | 前端 + 服务端 TypeScript 检查 |
| `npm test` | Vitest 单元 / 数据完整性测试 |
| `npm run test:watch` | Vitest 监听模式 |
| `npm run build` | 类型检查 + 生产构建，输出 `dist/` |
| `npm run preview` | 预览构建产物（静态；API 需另行启动或由部署环境托管） |

最近一次实际验证结果见 [`docs/PROGRESS.md`](docs/PROGRESS.md)：42 项测试通过，构建成功，1440×900 下完整调查闭环实测通过。

---

## 当前已实现（Phase 1 · 引导式版本）

游戏不再进入旧版“后台式”界面，而是走一条按剧情推进的最小闭环：

1. **演练授权书**：说明项目、隔离沙箱与善意授权，一句话背景，一个主按钮；有存档时提供“继续上次调查”。
2. **任务简报**：交代冲突背景（18:05 私聊截图 / 18:20 限时通知 / 19:10 官方公告）、本轮目标、“你可以先做三件事”与【开始调查】。
3. **三栏调查台**（≥1280px）：
   - 左：当前任务、目标、行动点、3 条待办与分步引导卡（唯一主按钮）；
   - 中：3 张关键材料卡（E2 / E4 / E7）、情报板（3 格拖放位）、现场动态；
   - 右：周宁（推荐先问）、林夏、最近消息与系统提示。
4. **四步引导**：打开 E2 → 联系周宁（1 AP）→ 拖两条线索进情报板 → 写下初步假设；引导序号完全由调查状态推导，不硬编码跳转。
5. **形成假设**：从 3 个选项中选择，错误项给出针对性反馈且不扣点；正确项记录假设、写日志并显示“调查阶段完成，等待进入验证阶段”。
6. **存档与重开**：`phantom.save.v2` 保存材料已读、情报板、联系记录与完成状态；授权书可继续或重开本案。
7. **无模型演示模式**：未配置模型时明确显示“本地演示模式”，完整流程不依赖任何外部服务。

尚未实现：验证阶段、NPC 自由对话（服务端校验）、身份反转、防御控制台、6 结局结算、回放与分享卡。

---

## 目录结构

```text
.
├─ docs/
│  ├─ PROJECT_SPEC.md      # 产品规范：数据量、流程、边界
│  ├─ ARCHITECTURE.md      # 分层架构、状态模型、API 设计
│  └─ PROGRESS.md          # 实际验证记录、已知问题、Phase 2 计划
├─ server/
│  ├─ index.ts             # Express 入口
│  └─ routes/status.ts     # /api/health、/api/ai/status
├─ src/
│  ├─ components/
│  │  ├─ case/             # CaseHeader、EvidenceCard/Drawer、IntelBoard、
│  │  │                    # ContactRail、SignalStream、TaskPanel、各类对话框
│  │  └─ ui/               # PhantomMark、SigilAvatar、Toast 等
│  ├─ data/                # 动态、证据、NPC、事件、人格、结局、行动、
│  │                       # investigation（案件材料 / 引导 / 假设 / 联系提示）
│  ├─ engine/              # GameEngine、InvestigationEngine、PersonalityEngine（纯函数）
│  ├─ hooks/               # useAiStatus
│  ├─ pages/               # Authorization / Briefing / OS
│  ├─ services/            # saveService（存档元信息）
│  ├─ stores/              # Zustand gameStore / uiStore
│  ├─ types/               # 领域类型
│  └─ utils/               # 确定性随机、格式化、cn
├─ tests/                  # Vitest
└─ .env.example
```

## 架构要点

- **确定性规则引擎**：`src/engine` 不依赖 React；阅读、拖放、联系、假设判定与 AP 扣除全部由 `InvestigationEngine` 完成，页面只派发动作。
- **引导由状态推导**：引导序号来自 `getGuideStepIndex(已读 / 情报板 / 已联系 / 完成)`，刷新或读档后自动回到正确步骤。
- **单一持久化写入方**：Zustand `persist` 将游戏状态写入 `localStorage`，键为 `phantom.save.v2`；`screen` 不入档，刷新后从授权书续接。
- **阶段权限投影**：红队专属材料在防御阶段对引擎与 UI 同时不可见，而不是仅前端隐藏。
- **无模型可运行**：模型只用于后续 NPC 对话；缺失配置时明确降级为 demo，不影响调查流程。
- **虚构隔离**：演练数据全部来自静态预设；不发起真实外部请求，不生成现实可用的攻击步骤或凭据。

安全与合规设计详见 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

---

## 测试

```bash
npm test
```

当前 3 个测试文件、42 项测试：数据完整性与引用闭合（动态 / 材料 / NPC / 事件 / 16 型人格 / 6 结局）、GameEngine（初始化、种子确定性、AP 守卫、归档幂等、人格累计、日志、世界夹紧）、InvestigationEngine（阅读幂等、拖入不扣点、情报板去重、联系周宁扣 1 AP 且仅一次、行动点不足拦截、假设条件门槛、错误假设反馈、正确假设完成与日志、引导序号推导）。

后续计划：Phase 2 增加核验与模拟引擎测试；Phase 6 增加 Playwright 端到端测试。

---

## 部署说明

```bash
npm run build
```

`dist/` 为纯静态前端，可部署到任意静态托管；`server/` 为独立 Node 服务，用于状态查询与后续 NPC 对话。生产环境需自行配置反向代理将 `/api` 指向服务端，并通过环境变量注入模型配置。**不要**把模型 Key 写入前端构建变量或提交到仓库。

当前 `npm run preview` 只预览静态产物，不会自动代理 `/api`；页面仍可运行，AI 状态会显示离线 / demo。

---

## 边界与声明

- 本项目是虚构的攻防教育模拟，不针对任何真实个人、组织或系统。
- 红队内容仅用于隔离沙箱中的抽象风险推演，不提供现实可复用的诈骗、冒充或凭据获取方法。
- 分享卡片（Phase 5）将不包含聊天内容、真实身份、敏感数据或 API 配置。
- 游戏内人格类型是基于行为日志的游戏化画像，不是经过心理学验证的测评，四种维度之间没有高低之分。

---

## 开发阶段

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| P1 | 工程、授权书 / 简报、三栏调查台、引导闭环、假设与存档 | ✅ 已交付（0.2.0 引导式重构） |
| P2 | 验证阶段、核验、事件引擎 | 待验收后开始 |
| P3 | NPC 自由对话（服务端校验 + 无模型回退） | 计划中 |
| P4 | 身份反转、共享世界状态、防御阶段 | 计划中 |
| P5 | 人格结算、6 结局、结果页与 PNG 分享卡 | 计划中 |
| P6 | 回放、平行世界对比、Playwright E2E | 计划中 |

Hack4Good 2026 · 技术向善 · `0.2.0-phase1`
