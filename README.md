# 破壁行动 · Project Phantom

《破壁行动》是一款校园反诈剧情游戏。志愿者沈一和林夏从两张互相矛盾的报名通知查起，受邀在信息中心短期协助调查。交回临时权限后，沈一回宿舍面对自己的相机订单和一条熟悉的语音。故事以四案的实际处置回执结算。

项目面向 2026 Qoder 高校创造力大赛 Hack4Good 技术向善赛道。澄川大学及游戏中的角色、入口和记录均为虚构。 [天池赛事介绍](https://tianchi.aliyun.com/competition/entrance/532536/introduction?lang=en-us)

## 本地运行

需要 Node.js 20+ 和 npm。安装锁定的依赖并启动 Vite 和 Express。

```bash
npm ci
npm run dev
```

在封面选择「走进活动室」。对白、当前目标与推进按钮集中在画面下方。可调查物件带有图标，点亮后会收入随身笔记。所有场景使用同一全屏舞台，长记录用按钮翻页。四案进度保存在当前浏览器。 [打开本地游戏](http://localhost:5173/)

使用 `npm test` 检查规则与回退。`npm run build` 先检查类型，再生成 `dist/`。可用 `npm run preview` 试玩该构建。

## 四案主线

1. 在活动室自己选择先翻手机、公告还是签到夹。圈出两个报名入口后，找顾老师领取临时授权。值班室有审批夹、登记终端和其他可查物件。
2. 前两案分别玩信号拦截和资金断路板。信号拦截支持点击和数字键 1、2、3，也可用不限时模式。断路板通过点击旋转线板接通确认过的款项。
3. 回到宿舍后，玩家从书桌查订单与账单，在两张图上圈出重复流水，再从原有通讯录核验熟人语音。遇到缺少依据的判断可以保留疑点继续。
4. 四案结束后可进行两次跟进。六个结局由执行回执和实际后果判定。行动风格独立使用本局 12 次选择，复盘可以重走指定案件。

`src/game/campaign/cases.ts` 编排四案，`investigation.ts` 定义可查物件和对照字段，`exercises.ts` 定义两个沙盘的判定。校园场景、人物立绘和结局插画沿用原版。`docs/` 中的架构、进度和截图对应初版。

## 人物追问与复盘

无模型配置也可以通关，人物会显示「预置剧情回复」，本局因果复盘仍按实际日志生成。可在本机创建 `.env`，按 `.env.example` 设置兼容 Chat Completions 的 `LLM_BASE_URL`、`LLM_API_KEY` 和 `LLM_MODEL`，重启本地服务即可联调。

模型根据当前案件、可见证据和人物记忆选择回复要点，复盘从本局已有回执和实际影响中挑选关键节点。核验结果、处置和结局由游戏规则生成。自由对话只在打开的对话窗口中保留。

## Qoder Sites 构建

- **静态试玩版**。默认 `npm run build`，将 `dist/` 作为网站目录。使用预置人物对白，四案均可通关。
- **启用实时回复的版本**。将公开构建变量 `VITE_CASE_LIVE_AI` 设为 `true` 后运行 `npm run build`。在 Qoder Sites 中使用 `dist/` 作为网站目录，`functions/` 作为 Edge Function 目录，逻辑名称为 `app`。三个 `LLM_` 配置通过 Sites Secrets 设置。该版本仍可在模型不可用时完成主线。 [Qoder Sites 文档](https://docs.qoder.com/zh/cli/sites)

部署联调可请求 `/functions/v1/app/api/health`，再用一个人物自由追问和一次结案复盘验证实际回复。所有玩家访问同源函数，密钥保留在服务端。比赛要求评委可以公开访问 Qoder Sites 作品。 [天池参赛要求](https://tianchi.aliyun.com/competition/entrance/532536/introduction?lang=en-us)
