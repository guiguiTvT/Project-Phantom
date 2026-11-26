# 开发进度 · Project Phantom：破壁行动

> 更新时间：2026-11-26 · 版本：`0.2.0-phase1`
> 当前阶段：**Phase 1 引导式剧情重构**
> 状态：重构完成并通过本地验证，等待验收。Phase 2 尚未开始。

---

## 1. 本轮实际完成的验证

以下结论均来自本机实际执行。

| 项目 | 命令 / 方式 | 结果 |
| --- | --- | --- |
| 类型检查 | `npm run typecheck` | 通过（`tsconfig.json` 与 `tsconfig.server.json` 均无错误） |
| 单元测试 | `npm test` | **3 个测试文件、42 项全部通过**（699 ms） |
| 生产构建 | `npm run build` | 成功，1972 modules，3.60 s |
| 产物体积 | `dist/assets/` | JS 374.69 kB（gzip 118.19 kB）、CSS 46.42 kB（gzip 9.18 kB） |
| 敏感信息扫描 | 对 `dist / src / server` 检索 Key 值与 `sk-*` | 仅命中 `server` 中的 `process.env.LLM_*` 变量名；`dist` 无任何密钥 |
| 宽屏闭环 | Headless Edge + CDP，1440×900 | 三栏栅格 `282px / 760px / 334px`；真实鼠标拖拽把 E2 放入情报板；错误假设内联反馈；正确假设完成；控制台 error 为 0 |
| 视觉走查 | 1440×900 截图（授权书 / 简报 / 调查台 / 抽屉 / 就绪态 / 假设错误 / 完成态） | 层级、留白、卡片感、引导高亮符合预期；修正两处文案 |
| 窄视口 | 内置浏览器（约 718 CSS px 宽） | 单列堆叠布局可用，引导按钮可完成前两步 |

> 宽屏验证使用临时 CDP 脚本驱动真实 `Input.dispatchMouseEvent`，脚本与截图均为临时文件，验证后已删除。
> 1920×1080 尚未单独做像素级走查；`xl` 断点以上布局共用同一套三栏栅格。

---

## 2. 本轮交付的文件

### 新增页面

- `src/pages/AuthorizationPage.tsx`：演练授权书（背景、三条边界、存档续接 / 重新开始）
- `src/pages/BriefingPage.tsx`：任务简报（时间线、本轮目标、三件可做的事、开始调查）
- `src/pages/OSPage.tsx`（重写）：三栏调查台与全部对话框编排

### 案件组件（`src/components/case/`）

- `CaseHeader.tsx`：案件号、状态、AI 模式、AP、返回简报
- `TaskPanel.tsx`：当前任务、行动点、3 条待办、四步引导卡
- `EvidenceCard.tsx`：可拖拽的关键材料卡，含引导高亮与「放入情报板」
- `EvidenceDrawer.tsx`：材料详情抽屉（关键问题、摘要、正文、关联）
- `IntelBoard.tsx`：3 格拖放情报板、矛盾提示、假设入口
- `ContactRail.tsx`：周宁 / 林夏、提示卡、最近消息、系统提示
- `SignalStream.tsx`：三条现场动态及关联材料入口
- `HypothesisDialog.tsx`：三选一假设与错误反馈
- `CompletionDialog.tsx`：调查完成摘要（线索、联系、剩余 AP、下一步）
- `CaseDialog.tsx`、`labels.ts`

### 逻辑与数据

- `src/data/investigation.ts`：CASE_META、3 张关键材料、四步引导、3 个假设、联系提示、就绪与引导判定
- `src/engine/InvestigationEngine.ts`：阅读 / 拖入 / 联系 / 假设四条纯函数动作
- `src/stores/gameStore.ts`：新增 beginBriefing / beginInvestigation / resumeInvestigation / restartCase / viewCaseEvidence / pinCaseEvidence / contactCaseNpc / submitCaseHypothesis
- `src/services/saveService.ts`：SaveMeta 增加已读数、情报板数、联系、完成、进度
- `src/data/feed.ts`：补充与本案相关的动态（共 19 条）
- `src/data/gameConfig.ts`：版本 `0.2.0-phase1`、`phantom.save.v2`、`SAVE_VERSION 2`
- `src/index.css`、`tailwind.config.ts`：`case-card` / `case-inset` / `interactive-card` / `guide-strong` / `drop-active` / `cta` 与呼吸高亮
- `src/App.tsx`：三页路由（授权书 / 简报 / 调查台）

### 测试

- `tests/investigation.test.ts`（15 项）：阅读幂等、拖入 0 AP、去重、周宁扣 1 AP 且仅一次、林夏 0 AP、AP 不足拦截、假设门槛、错误反馈、正确完成与日志、引导序号
- `tests/gameEngine.test.ts`（13 项）、`tests/data.integrity.test.ts`（14 项）保持通过

---

## 3. 新的玩家闭环

1. 授权书 → 签署授权 → 任务简报 → 开始调查
2. 引导卡第一步：打开 E2（阅读不扣行动点）
3. 引导卡第二步：联系周宁（程序扣 1 AP，得到来源核对提示，并写入最近消息）
4. 引导卡第三步：拖拽或点击把 E2 / E7 放入情报板（0 AP），出现矛盾提示
5. 条件满足后出现「写下我的初步假设」→ 选择解释
6. 正确假设 → 记录、写日志、显示「调查阶段完成，等待进入验证阶段」

引导序号由 `getGuideStepIndex` 从已读 / 情报板 / 联系 / 完成四项状态推导，刷新与读档后自动定位。

---

## 4. 状态与规则（当前实现）

- **行动点**：红队 12；阅读、拖入、假设均 0 AP；联系周宁 1 AP、林夏 0 AP；扣除发生在 `InvestigationEngine`，页面不能直接改写。
- **情报板**：最多 3 条；重复放入与未知材料被拒绝；放入会推进回合并写日志。
- **假设**：需同时满足「已读 E2」「已联系周宁」「情报板 ≥ 2 条」；错误项返回反馈且不修改状态。
- **存档**：键 `phantom.save.v2`，版本 2；`screen` 不持久化；授权书根据元信息显示进度。
- **世界状态**：仍为静态初值，等验证阶段接入。

---

## 5. 如何启动

```bash
npm install
npm run dev        # 前端 5173 + API 8787
```

- 不配置模型即可完整游玩（本地演示模式）。
- 生产构建：`npm run build`；测试：`npm test`。

---

## 6. 已发现的问题与限制

1. **验证阶段未实现**：完成态停在「等待进入验证阶段」，这是明确的占位，不是假入口。
2. **1920×1080 未单独验收**：1440×900 与窄屏已验证，1920 使用同一三栏栅格，仍需一次真实窗口走查。
3. **无 Playwright E2E**：本轮使用临时 CDP 脚本实测真实拖拽与闭环，尚未沉淀为可重复的 E2E 用例。
4. **NPC 对话仍是预设提示**：未接模型，不生成自由文本；服务端只提供状态接口。
5. **世界状态静态**：反转与防御阶段需要的共享状态尚未被本轮动作改写。
6. **存档迁移为空实现**：v1 → v2 不做迁移，旧版本存档视为不存在。
7. **构建体积**：JS 375 kB（gzip 118 kB），低于 Vite 500 kB 提示阈值。

---

## 7. 下一阶段建议（待验收后开始）

目标：把「验证阶段」做成真实的第二幕入口，仍不接模型。

1. **验证阶段页面**：接收初步假设，陈列待核验材料，明确阶段切换与进度。
2. **核验引擎**：基于来源 / 时间 / 权限的确定性判定，1 AP / 次，结果写入日志。
3. **事件引擎**：按回合触发 `EVENTS` 中的延迟与后续事件，更新共享世界状态。
4. **存档升级**：`phantom.save.v3` 与迁移函数。
5. **测试**：核验判定、阶段门槛、事件一次性 / 延迟、存档迁移。
6. **可重复 E2E**：将本轮 CDP 闭环脚本沉淀为 Playwright 用例。

Phase 2 **不包含**：NPC 自由对话（P3）、完整反转与防御（P4）、结算与分享卡（P5）、回放（P6）。

---

## 8. 验收对照（本轮重构）

| 要求 | 当前状态 |
| --- | --- |
| 不吓人、5 秒内知道点哪里 | ✅ 授权书与简报各只有一个主按钮；调查台引导卡高亮 |
| 1 分钟内完成第一个动作 | ✅ 引导第一步即「打开 E2」 |
| 无需讲解完成最小闭环 | ✅ 四步引导 + 就绪门槛 + 完成弹窗 |
| 核心对象是卡片 | ✅ 材料卡、任务卡、联系卡、动态卡 |
| 文本密度降低 | ✅ 卡片化 + 短句 + 摘要 / 正文分层 |
| 每个按钮真实生效 | ✅ 阅读、联系、拖入、假设、重开、续接均有实测 |
| 项目可运行 | ✅ typecheck / test / build 通过 |
| 安全边界 | ✅ 无密钥进前端；虚构声明贯穿三页；操作只影响沙箱状态 |
