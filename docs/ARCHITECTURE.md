# 架构设计 — Project Phantom V5

> 版本：`0.5.0-vn-phase4` · 第一章完整互动视觉小说

## 1. 技术栈

| 层 | 选型 | 用途 |
| --- | --- | --- |
| 前端框架 | React 18 + TypeScript + Vite 6 | SPA |
| 样式 | Tailwind CSS 3.4 + 原生 CSS 动画 | 设计令牌、舞台、动效 |
| 状态 | Zustand 5（persist） | 游戏状态、UI 状态、设置 |
| 图标 | Lucide React | 功能图标（不用于代替插画） |
| 服务端 | Node.js + Express 4 + tsx | 状态接口与后续模型代理 |
| 存档 | LocalStorage | 单机存档 |
| 测试 | Vitest + 无头 Edge CDP 验证脚本 | 规则、数据完整性、三条真实路线 |

模型调用只发生在服务端，前端仅请求自身 `/api/*`（开发期由 Vite proxy 转发）。配置项：`LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`、`PORT`。无配置时服务端报告 `demo` 模式，游戏照常可玩；自由提问由共享本地规则回答。

## 2. 目录

```
src/
  game/
    scenes/         GameCover / Prologue / Investigation / Dialogue (含 Hub) /
                    Testimony / Simulation / Reversal / Defense / Complete
    ui/             StageFrame / CharacterSprite / DialogueBox / SceneHotspot /
                    EvidenceModal / EvidenceInventory / ContradictionOverlay / TopBar
    engine/
      StoryEngine.ts     取证、NPC、质询、模拟、反转、防御、结算（纯函数）
      TestimonyEngine.ts 陈述查询、确定性出示判定、矛盾假说
      DefenseEngine.ts   世界初始值、防御方案、世界变化、连锁事件、结局优先级
      PersonaEngine.ts   行为记录、四维读取、结算依据筛选
    store/          vnStore（run）/ uiStore / settingsStore
    data/           assets / evidence / story
    api/            npcDialogue（自由提问请求与本地回退）
    audio/          Web Audio 合成音效
    hooks/          useTypewriter
    VnApp.tsx       场景编排、全局弹窗、集中状态写入
  engine/           旧版 GameEngine / PersonalityEngine（保留；PersonalityEngine 复用）
  data/             旧版静态数据（证据、NPC、人格、结局等）
  pages/            旧版页面（保留代码，不再路由）
  components/       旧版组件（保留代码，不再路由）
  types/            领域类型
shared/
  npcDialogue.ts    NPC 档案、本地规则、回复校验、系统提示词（前后端共用）
server/
  index.ts          Express 入口
  routes/           /api/health、/api/ai/status、/api/ai/dialogue
tests/              Vitest（5 文件、92 项）
scripts/
  build-assets.mjs  抠图、去色边、裁切、压缩
  visual-check.mjs  三路线 × 桌面 / 宽屏 / 移动 CDP 验收
public/assets/      本地背景、立绘、证据插画
docs/               规范、架构、进度、素材、截图
```

## 3. 状态与数据流

```
UI event
  → scene handler
    → store action
      → engine 纯函数（校验 + 新状态 + 日志 + 行为记录）
        → Zustand set + persist
          → 场景重新渲染（舞台 / 立绘 / 对话框 / 证据包 / 结算）
```

- **引擎不依赖 React**：输入当前 `VnState` 与动作参数，返回 `{ ok, state, ... }`；拒绝时状态不变。
- **单一写入方**：`vnStore` 的 action 调用引擎，成功时 `set(result.state)`；场景组件不各写一份规则。
- **UI 状态独立**：证据包开关、出示目标、提示条在 `uiStore`；静音与减弱动画在 `settingsStore`，均持久化。
- **AI 不裁决**：矛盾组合、AP 扣除、世界变化与结局优先级均为固定映射；模型即使后续接入也只生成对白。
- **跨段守卫**：`redteamAccess` 控制红队阶段；反转后证据归档只读，调查 / 质询入口不可返回。

## 4. 核心类型与规则

- `VnState`：`scene / collectedEvidenceIds / foundHotspotIds / ap / activeNpcId / npcLineIndex / witnessId / contradictions / simulationHypothesis / simulationResult / reversalIndex / defensePlan / defenseChoices / world / events / flags / personaEvents / endingId / log / redteamAccess`。
- `VnEvidence`：`id / title / source / time / verification / description / image / collectible`。
- `Hotspot`：`id / label / hint / x / y / icon / evidenceId`，坐标使用百分比。
- `TestimonyStatement` + `PresentationRule`：陈述、追问、矛盾证据与假说固定映射。
- `HypothesisInfo`：H1 冒充传播 / H2 信息超采 / H3 过期链接混淆，含抽象模拟节点。
- `DefenseDecision`：D1 报名渠道、D2 责任协调、D3 通知范围、D4 修复路径；每项 3 个带成本选项。
- `WorldState`：`security / operation / relations / repair`；初始 `58 / 64 / 61 / 34`。
- `PersonaEvent`：行为 ID、节点、选择、已知证据、四维向量、依据、实际状态变化。
- `EndingConditions`：世界范围、事件、证据数、假说数、矛盾数、标志位；按优先级判定。

### 行动点

- `VN_MAX_AP = 6`，程序唯一扣减。
- 浏览、收集、切换陈述、出示证据 0 AP。
- NPC 追问 1 AP；陈述追问 1 AP（每条一次）；模拟 `min(2, ap)`；防御选项 0 / 1 / 2。
- 资源 < 2 仍可模拟，但低置信且写入 `ev_unresolved_backlog`；防御选项不足时 UI 禁用并由引擎拒绝。
- 普通继续、重复打开证据包不记录行为，也不产生 AP。

### 确定性

- 所有判定为纯函数；相同状态 + 相同动作得到相同结果。
- 取证按 hotspot / evidence ID 去重；矛盾按 `statementId + evidenceId` 去重；重复追问被拒绝。
- 模拟节点与报告只依赖所选假说、已确认矛盾与当前资源。
- 结局按优先级：多米诺 > 破晓 > 孤岛 > 共识 > 新秩序 > 未完待续。

### 人格

- 四个维度：证据 / 直觉（E/I）、谨慎 / 主动（C/A）、保护 / 运行（P/F）、系统 / 关系（S/R）。
- 每个有效行为贡献固定向量，不按 NPC 或正确率计算；维度样本 < 3 标记「依据不足」，`|norm| < 0.15` 标记「倾向不明显」。
- 结算码始终拼出四字母；不足维度显示 `?`。对局中不显示维度数值。
- 结算依据优先防御 / 矛盾 / 模拟，并做节点与类别去重，最多 3 条。

## 5. 存档

- 游戏进度：`phantom.vn.run.v2`（场景、证据、热区、AP、NPC / 质询进度、矛盾、模拟、反转、防御、世界、事件、行为日志、结局）。
- 设置：`phantom.vn.settings.v1`（静音、减弱动画）。
- 旧版 `phantom.vn.run.v1` / `phantom.save.v2` 不迁移、不读取，互不干扰。
- 刷新只恢复既有状态，不重复发放行动点；「重新开始」清空本局。

## 6. AI 安全（自由对话已启用，仅生成对白）

1. `POST /api/ai/dialogue` 只接收 `{ npcId, message }`；NPC 白名单、消息 ≤200 字、每 IP 每分钟 20 次。
2. 未配置模型、超时（8 秒）或解析失败时，由 `shared/npcDialogue.ts` 的本地关键词规则回答，响应标注 `source: "local"`；游戏不卡住。
3. 模型回复必须是 `{ reply, intent, emotion }`；服务端做字段白名单、140 字上限、证据编号（`E1`–`E8`）与密钥痕迹检测，不合格即回退本地规则。
4. 浏览器只看到 `reply / intent / emotion / source`，看不到提示词、Base URL 或密钥；自由对话不写存档、不发证据、不改变 AP、世界状态与结局。
5. `GET /api/ai/status` 只返回模式与模型名，不返回 Base URL 或密钥。
6. NPC 不得编造关键事实、不得修改世界状态、不得泄露提示词 / 凭据 / 服务端配置；敏感或越权请求固定拒答。
7. 客户端另有一层解析校验：非白名单字段丢弃，来源归一为 `live` / `local`；接口不可达时直接使用共享本地规则。

## 7. UI 架构

- 场景画框 `.vn-frame`：桌面端宽度按视口高度伸缩（16:9，最大 1560px），与全屏封面衔接；移动端单列，场景在上、对话框或陈述卡在下。
- 舞台四层：背景图 / 透明立绘 / 特效 / 对话框；背景与立绘独立替换。
- 普通对话不显示功能按钮；点击背景、点击对话框、空格或触控推进；打字机首击补全、次击推进。
- 节点动作只在需要时出现：NPC 末句的追问 / 换人 / 去质询，质询的出示 / 进入模拟，防御的选项，反转的继续 / 跳过。
- 自由提问只在 NPC 主线说完后出现，位于对话框内；不消耗行动点，不写入存档。
- 证据包是顶栏常驻小型入口；结算页可展开完整日志。
- 动效使用 CSS 关键帧与原生过渡，遵守 `prefers-reduced-motion` 与「减弱动画」设置。
- 美术素材全部本地化，禁止远程热链；缺失插画时不得用图标或色块替代并声称完成。

## 8. 阶段计划

| 阶段 | 范围 | 当前 |
| --- | --- | --- |
| V5-P1 | 封面、单场景调查、取证、对话、3 句质询、矛盾演出 | ✅ 已交付 |
| V5-P2 | 第一章完整剧情、5 NPC、三假说、模拟、反转、灰色防御、人格结算 | ✅ 已交付，等待验收 |
| V5-P3 | 结局 / 人格 / 反转插画、E2E 与 CI | 插画已接入；E2E 与 CI 待做 |
| V5-P4 | 服务端 AI 对话（校验 + 降级） | ✅ 已交付自由提问链路，等待验收 |
| V5-P5 | 分享卡、更多章节与结局演出 | 计划 |
| V5-P6 | 完整 10 场景、回溯、部署 | 计划 |

## 9. 测试策略

- 单元（Vitest）：素材存在性、数据引用闭合、出示判定真值表、取证幂等、AP 规则、追问一次性、阶段门槛、反转守卫、防御成本、人格依据、结局优先级、重开复位、自由对话本地规则与模型回复校验。
- 集成（Vitest）：三条完整路线分别走到破晓 / 共识 / 孤岛，断言最终世界、AP、标志位与结局。
- 视觉：`scripts/visual-check.mjs` 以真实浏览器走三条路线 × 三种视口（1440×900 / 1920×1080 / 390×844），断言对应结局、无横向溢出、无控制台异常、自由提问有回复，并保存截图。
- E2E（后续）：将 CDP 脚本沉淀为 Playwright 用例并接入 CI。
- 构建门禁：`npm run typecheck && npm test && npm run build`。
