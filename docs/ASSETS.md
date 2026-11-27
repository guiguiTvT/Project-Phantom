# 美术资产清单 · Project Phantom V5

> 更新时间：2026-11-27 · Phase 3 美术补齐已接入，Phase 4 未改动素材（版本 `0.5.0-vn-phase4`）
> 本文件记录**实际使用的本地素材**、生成方式与提示词，不再保留「待补齐」占位条目。
> 所有素材均为原创生成，不包含任何参考作品的品牌、角色、立绘、图标、音效或界面拼接。

---

## 1. 统一风格与色板

| 项目 | 值 |
| --- | --- |
| 画风 | 日式赛璐璐动画质感（cel-shaded anime），校园悬疑，电影感构图 |
| 暖白 | `#F5F1E8` |
| 深蓝灰 | `#263344` |
| 青绿 | `#7C9B95` |
| 暖橙 | `#D5A478` |
| 警示红 | `#AD6267` |
| 光线 | 黄昏 / 暖色窗光；红队视角偏冷，学生视角偏暖 |
| 人格插画 | 深墨蓝底 + 单一主题色辉光；人物剪影 + 几何符印 |
| 禁止 | 赛博终端风、霓虹、网格线、线框图、图标或色块代替插画 |

素材全部放在 `public/assets/`，页面只引用本地相对路径，不做远程热链。

---

## 2. 当前已接入素材（共 56 个文件）

### 2.1 背景（4 张，1792×1024 WebP）

| 文件 | 体积 | 用途 |
| --- | --- | --- |
| `backgrounds/cover-campus-dusk.webp` | 324 KB | 游戏封面：黄昏校园主楼与广场 |
| `backgrounds/activity-room.webp` | 215 KB | 第一章活动室：长桌、笔记本、手机、公告板；调查热区与质询、模拟、反转均使用 |
| `backgrounds/dorm-night.webp` | 109 KB | 防御阶段：宿舍夜景，书桌与台灯 |
| `backgrounds/service-hall.webp` | 185 KB | 防御阶段：校园服务中心 |

### 2.2 立绘（5 名 NPC × 4 表情，透明 PNG，合计约 13 MB）

五种表情统一为 `neutral / happy / confused / nervous`，同一姿势、同一服装、同一光源，便于交叉淡化。

| 角色 | 文件前缀 | 表情与用途 |
| --- | --- | --- |
| 林夏 | `characters/linxia-*.png` | 平静 / 轻松 / 迟疑 / 不安（质询与矛盾演出） |
| 周宁 | `characters/zhouning-*.png` | 平静 / 轻松 / 迟疑 / 不安 |
| 陈老师 | `characters/chen-*.png` | 平静 / 轻松 / 迟疑 / 不安 |
| 许言 | `characters/xuyan-*.png` | 平静 / 轻松 / 迟疑 / 不安 |
| 顾老师 | `characters/gu-*.png` | 平静 / 轻松 / 迟疑 / 不安 |

单张约 380×1280、555–775 KB。人物完整站在画面下缘，头部约占画面上 1/5。

### 2.3 证据插画（8 张，1024×768 WebP）

| 文件 | 体积 | 对应证据 |
| --- | --- | --- |
| `evidence/e1-official-notice.webp` | 124 KB | E1 官方报名通知 |
| `evidence/e2-forwarded-notice.webp` | 84 KB | E2 社团群「更方便」转发通知 |
| `evidence/e3-service-log.webp` | 83 KB | E3 活动平台服务记录 |
| `evidence/e4-fake-chat.webp` | 38 KB | E4「陈老师」私聊截图（伪造） |
| `evidence/e5-privacy-popup.webp` | 67 KB | E5 报名页隐私弹窗 |
| `evidence/e6-old-form.webp` | 93 KB | E6 旧版报名表 |
| `evidence/e7-approval-notice.webp` | 95 KB | E7 顾老师审批说明 |
| `evidence/e8-classmate-chat.webp` | 53 KB | E8 同学私聊记录 |

E1–E8 全部可收集，但一章不要求全收集；证据包只显示已发现项。

### 2.4 结局 CG（6 张，1792×1024 WebP）

在 `CompleteScene` 中作为结局主插画展示（16:9，圆角，懒加载），位于结局摘要与信号标签之后。

| 文件 | 体积 | 结局 | 画面 |
| --- | --- | --- | --- |
| `endings/01-dawn.webp` | 148 KB | 破晓 Dawn | 清晨操场，五名学生并肩，公告板恢复 |
| `endings/02-consensus.webp` | 227 KB | 共识 Consensus | 活动室围桌讨论，便签墙，暖色窗光 |
| `endings/03-rebuild.webp` | 155 KB | 新秩序 Rebuild | 走廊白板上的新核验流程，秩序感 |
| `endings/04-isolation.webp` | 54 KB | 孤岛 Isolation | 单人宿舍，门链，窗外热闹 |
| `endings/05-domino.webp` | 113 KB | 多米诺 Domino | 连续弹出的通知与走廊奔跑剪影 |
| `endings/06-unresolved.webp` | 100 KB | 未完待续 Unresolved | 黄昏空教室，未关的电脑屏幕 |

### 2.5 反转 CG（2 张，1792×1024 WebP）

作为 `REVERSAL_FRAMES` 的帧背景接入，文字卡片叠加在压暗的画面上。

| 文件 | 体积 | 使用帧 |
| --- | --- | --- |
| `cg/reversal-atrium.webp` | 113 KB | 帧 0–1：推演结束、权限收回；中庭全息面板正在熄灭 |
| `cg/reversal-corridor.webp` | 50 KB | 帧 2–3：校园通知、轮到你了；夜色走廊与空椅 |

### 2.6 16 型人格插画（16 张，1024×1024 WebP）

目录 `personality/`，文件名使用小写四字母代号；在 `CompleteScene` 中作为人格缩略图展示，替代缺省排版。

| 代号 | 名称 | 文件 | 体积 |
| --- | --- | --- | --- |
| ECPS | 守望者 | `personality/ecps.webp` | 22 KB |
| ECPR | 庇护者 | `personality/ecpr.webp` | 45 KB |
| ECFS | 架构师 | `personality/ecfs.webp` | 30 KB |
| ECFR | 协调者 | `personality/ecfr.webp` | 28 KB |
| EAPS | 幽灵 | `personality/eaps.webp` | 66 KB |
| EAPR | 追踪者 | `personality/eapr.webp` | 26 KB |
| EAFS | 工程师 | `personality/eafs.webp` | 27 KB |
| EAFR | 指挥官 | `personality/eafr.webp` | 45 KB |
| ICPS | 哨兵 | `personality/icps.webp` | 31 KB |
| ICPR | 守护者 | `personality/icpr.webp` | 41 KB |
| ICFS | 策略家 | `personality/icfs.webp` | 24 KB |
| ICFR | 调停者 | `personality/icfr.webp` | 51 KB |
| IAPS | 探索者 | `personality/iaps.webp` | 35 KB |
| IAPR | 观察者 | `personality/iapr.webp` | 42 KB |
| IAFS | 开拓者 | `personality/iafs.webp` | 63 KB |
| IAFR | 连接者 | `personality/iafr.webp` | 45 KB |

统一构图：深墨蓝底、单主题色辉光、学生剪影、头顶几何符印（eye / shield / circuit / orbit / bridge / prism），按姿态与符印区分，不使用头像贴纸、分级、奖杯或百分比。

### 生成与处理流程

1. 图像生成工具输出 1024×1024 / 1536×1024 / 1792×1024 原图，统一存入 `vibe_images/`；
2. 立绘使用纯色背景生成，再由 `scripts/build-assets.mjs` 做 chroma-key 抠图、去色边、裁切与缩放，输出透明 PNG；
3. 背景、证据、结局、反转与人格图压缩为 WebP（背景 / 结局 / 反转限宽 1800，人格 1024，质量 86），统一置于 `public/assets/`；
4. `tests/vn-flow.test.ts` 校验背景、立绘、证据、反转 CG、结局 CG 与 16 张人格插画均存在且大于 1 KB，缺失即测试失败；
5. 结算页图片使用 `loading="lazy"` 与中文 `alt`。

### 构图约定

- **背景**：16:9（1792×1024），主体偏右，左侧留出对话框 / 陈述卡空间；场景热区坐标以百分比存储，与画面中的手机、笔记本、公告板对齐。
- **立绘**：透明底，四种表情共用同一姿势与服装，仅眉、眼、嘴、头部角度变化。
- **证据图**：1024×768，正面平视，无人物手部遮挡，保留可读的虚构文字；不使用真实学校、真实平台界面。
- **结局 / 反转 CG**：1792×1024，电影感宽构图，不出现真实平台界面或可复用话术；反转帧画面整体压暗，保证文字卡可读。
- **人格插画**：1024×1024，居中剪影与符印，四周留白；16 张共用同一画风与色板结构，仅主题色与符印不同。

---

## 3. 生成记录与提示词

以下为 Phase 3 实际使用的提示词结构，便于后续替换或追加时保持一致性。

### 3.1 反转 CG

```text
Cinematic wide shot, cel-shaded anime, campus activity room at night,
half the lights out, an empty chair pulled away from a desk, cold blue shadows,
a warm doorway far in the background, no characters' faces visible,
sense of losing observer status, quiet unease, no text, 1792x1024
```

第二条以「夜色走廊 + 空椅 + 尽头冷光」替换场景，其余约束相同。

### 3.2 结局 CG

逐结局描述场景与情绪（操场晨雾 / 围桌便签 / 白板流程 / 门链宿舍 / 通知连锁 / 黄昏空教室），共用约束：

```text
cel-shaded anime, cinematic 1792x1024, campus setting,
[结局场景与情绪], warm dusk or cold night lighting,
no real platform UI, no readable personal data, no text watermark
```

### 3.3 人格插画

```text
Personality result card illustration, cel-shaded anime, deep ink-navy background,
single anonymous student silhouette, one motif emblem floating behind the head
drawn in fine glowing lines, [motif: eye / shield / circuit / orbit / bridge / prism],
[主题色辉光], generous negative space, no text, no charts, no ranking imagery, 1024x1024
```

为保持 16 张成组，统一使用「人物剪影 + 单一符印」结构；姿态、发型与服装轮廓略有差异，避免完全复制。

### 3.4 可选补充（仍未生成，不影响当前流程）

- 转场静帧：`cg/blackout.webp`（黑场 + 微光），1024×576；
- 图书馆一角：`backgrounds/library-corner.webp`，用于后续与同学核对信息；
- 音频：当前使用 Web Audio 合成短音（点击 / 翻页 / 收集 / 错误 / 矛盾 / 完成），无外部音频文件；后续若替换为录音，必须为原创或明确授权，并提供静音开关。

---

## 4. 素材覆盖与当前影响

- 第一章六段流程（序章 → 调查 → 人物 → 质询 → 模拟 → 反转 → 防御 → 结算）所需的背景、5 名角色立绘与 8 张证据插画全部接入，**不存在用图标或色块顶替插画的情况**。
- 反转 4 帧已使用专属 CG（`cg/reversal-atrium` / `cg/reversal-corridor`），文字卡叠加在压暗画面上。
- 结算页已使用 6 张结局 CG 与 16 张人格插画；结局主图 16:9，人格图为 80–96px 缩略图，均来自本地 WebP。
- 缺失素材清单已清空；3.4 中的可选补充不阻塞流程，也不提供假入口。
- 资产命名与路径集中在 `src/game/data/assets.ts`，新增素材只需追加一行并补充对应测试断言。
