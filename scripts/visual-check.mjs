import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const EDGE_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const EDGE = EDGE_CANDIDATES.find((item) => existsSync(item));
if (!EDGE) throw new Error('No Chromium browser found for visual check');

const PORT = 9333;
const APP = 'http://localhost:5173/';
const OUT = path.resolve('docs/screenshots');
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const hit = args.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const ROUTES = argValue('routes', '1,2,3').split(',').map((item) => item.trim()).filter(Boolean);
const VIEWPORTS = argValue('viewports', 'desktop,mobile')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = path.join(process.env.TEMP ?? 'C:/Temp', `phantom-vn-edge-${Date.now()}`);
const startTime = Date.now();

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-features=msEdgeSyncPromo,msEdgeFirstRunExperience',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function waitForEndpoint() {
  for (let i = 0; i < 80; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return;
    } catch {
      // retry
    }
    await sleep(250);
  }
  throw new Error('CDP endpoint did not start');
}

let ws;
let seq = 0;
const pending = new Map();
let consoleEvents = [];

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.text +
        ' ' +
        (result.exceptionDetails.exception?.description ?? result.exceptionDetails.exception?.value ?? ''),
    );
  }
  return result.result.value;
}

async function clickByText(text, { optional = false } = {}) {
  const result = await evaluate(`(() => {
    const norm = (value) => (value || '').replace(/\\s+/g, '');
    const target = norm(${JSON.stringify(text)});
    const elements = [...document.querySelectorAll('button,[role="button"],a')];
    const matches = elements.filter((item) => norm(item.textContent).includes(target));
    const enabled = matches.filter((item) => !item.disabled);
    const element = enabled[0];
    if (!element) {
      if (${optional}) return { ok: true, skipped: true };
      return {
        ok: false,
        disabled: matches.map((item) => item.textContent.trim().slice(0, 40)),
        visible: elements
          .filter((item) => !item.disabled)
          .map((item) => item.textContent.trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 30),
      };
    }
    element.click();
    return { ok: true, hit: element.textContent.trim().slice(0, 60) };
  })()`);
  if (!result.ok) throw new Error(`click "${text}" failed; visible: ${JSON.stringify(result.visible)}`);
  await sleep(140);
  return result;
}

async function clickAria(prefix, { optional = false } = {}) {
  const result = await evaluate(`(() => {
    const element = [...document.querySelectorAll('[aria-label]')].find((item) =>
      item.getAttribute('aria-label').startsWith(${JSON.stringify(prefix)}),
    );
    if (!element) {
      if (${optional}) return { ok: true, skipped: true };
      return { ok: false, visible: [...document.querySelectorAll('[aria-label]')].map((item) => item.getAttribute('aria-label')).slice(0, 30) };
    }
    element.click();
    return { ok: true };
  })()`);
  if (!result.ok) throw new Error(`aria "${prefix}" failed; visible: ${JSON.stringify(result.visible)}`);
  await sleep(140);
  return result;
}

async function pressSpace() {
  await evaluate(`(() => {
    document.body.dispatchEvent(new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      bubbles: true,
      cancelable: true,
    }));
  })()`);
  await sleep(90);
}

async function advance(times = 1) {
  for (let i = 0; i < times; i += 1) {
    await pressSpace();
    await pressSpace();
    await sleep(520);
  }
}

async function shot(name, fullPage = false) {
  const params = { format: 'png' };
  if (fullPage) {
    const metrics = await send('Page.getLayoutMetrics');
    const size = metrics.cssContentSize;
    params.captureBeyondViewport = true;
    params.clip = { x: 0, y: 0, width: size.width, height: size.height, scale: 1 };
  }
  const { data } = await send('Page.captureScreenshot', params);
  writeFileSync(path.join(OUT, name), Buffer.from(data, 'base64'));
  console.log('saved', name);
}

async function navigate(url) {
  await send('Page.navigate', { url });
  await sleep(1400);
}

async function layout(label) {
  const result = await evaluate(`(() => {
    const scenario = document.body.innerText;
    const codeEl = [...document.querySelectorAll('span')].find((el) =>
      String(el.className || '').includes('font-mono') && String(el.className || '').includes('text-[26px]'),
    );
    return {
      label: ${JSON.stringify(label)},
      width: window.innerWidth,
      height: window.innerHeight,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollHeight: document.documentElement.scrollHeight,
      heading: document.querySelector('h1')?.textContent?.trim().slice(0, 80) ?? null,
      personaCode: codeEl?.textContent?.trim() ?? null,
      endingReached: scenario.includes('暂定 Phantom Type'),
      bodyExcerpt: scenario.replace(/\\s+/g, ' ').slice(0, 280),
      buttons: [...document.querySelectorAll('button')]
        .filter((el) => !el.disabled)
        .map((el) => el.textContent.trim().slice(0, 30))
        .filter(Boolean)
        .slice(0, 24),
    };
  })()`);
  return result;
}

async function collectHotspots() {
  for (const ariaLabel of ['调查桌上的手机', '调查开着的电脑', '调查公告板']) {
    await clickAria(ariaLabel);
    await sleep(750);
    await clickAria('关闭材料');
    await sleep(420);
  }
  await clickByText('找人问问');
  await sleep(800);
}

async function talkTo(name, { verify = false, exit = 'hub' } = {}) {
  await clickByText(name);
  await sleep(900);
  await advance(3);

  if (verify) {
    await clickByText('追问');
    await sleep(950);
    await advance(1);
    await sleep(350);
  }

  if (exit === 'testimony') {
    await clickByText('去质询');
    await sleep(900);
  } else {
    await clickByText('换个人');
    await sleep(650);
  }
}

async function presentEvidence(fragment) {
  await clickByText('出示证据');
  await sleep(600);
  await clickByText(fragment);
  await sleep(1100);
  await clickByText('收下这条裂缝', { optional: true });
  await sleep(650);
}

async function runRoute(route, viewport) {
  const mobile = viewport === 'mobile';
  const prefix = `r${route}-${viewport}`;
  const report = {
    route,
    viewport,
    consoleEvents: [],
    layouts: [],
    checks: [],
    screenshots: [],
    error: null,
  };
  consoleEvents = [];

  await send('Emulation.setDeviceMetricsOverride', {
    width: mobile ? 390 : viewport === 'wide' ? 1920 : 1440,
    height: mobile ? 844 : viewport === 'wide' ? 1080 : 900,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
  });
  await navigate(APP);
  await evaluate('localStorage.clear()');
  await navigate(APP);
  await sleep(500);

  try {
    const cover = await layout('cover');
    report.layouts.push(cover);
    await shot(`${prefix}-01-cover.png`, mobile);
    report.screenshots.push(`${prefix}-01-cover.png`);

    await clickByText('进入故事');
    await sleep(400);
    await advance(3);
    await sleep(700);

    const investigation = await layout('investigation');
    report.layouts.push(investigation);
    await shot(`${prefix}-02-investigation.png`);
    report.screenshots.push(`${prefix}-02-investigation.png`);

    await collectHotspots();
    const hub = await layout('npc-hub');
    report.layouts.push(hub);
    await shot(`${prefix}-03-npc-hub.png`);
    report.screenshots.push(`${prefix}-03-npc-hub.png`);

    if (route === '1') {
      await clickByText('林夏');
      await sleep(900);
      await advance(3);
      await clickByText('自由提问');
      await sleep(350);
      await clickByText('为什么转发？');
      await sleep(250);
      await clickAria('发送提问');
      await sleep(1600);
      const freeformText = await evaluate('document.body.innerText');
      report.checks.push({
        name: 'npc-freeform-reply',
        ok: freeformText.includes('群里说比官网快'),
      });
      const freeformLayout = await layout('npc-freeform');
      report.layouts.push(freeformLayout);
      await shot(`${prefix}-03b-npc-freeform.png`);
      report.screenshots.push(`${prefix}-03b-npc-freeform.png`);
      await clickByText('换个人');
      await sleep(700);
    }

    if (route === '1') {
      await talkTo('林夏', { exit: 'hub' });
      await talkTo('顾老师', { exit: 'hub' });
      await talkTo('周宁', { verify: true, exit: 'testimony' });
    } else if (route === '2') {
      await talkTo('林夏', { exit: 'hub' });
      await talkTo('顾老师', { exit: 'hub' });
      await talkTo('许言', { verify: true, exit: 'testimony' });
    } else {
      await talkTo('林夏', { exit: 'testimony' });
    }

    const testimony = await layout(`testimony-${route}`);
    report.layouts.push(testimony);
    await shot(`${prefix}-04-testimony.png`, mobile);
    report.screenshots.push(`${prefix}-04-testimony.png`);

    await presentEvidence('社团群里的');
    const afterFirst = await layout('first-contradiction');
    report.layouts.push(afterFirst);
    await shot(`${prefix}-05-contradiction.png`);
    report.screenshots.push(`${prefix}-05-contradiction.png`);

    if (route === '1') {
      await clickAria('下一句陈述');
      await sleep(400);
      await clickAria('下一句陈述');
      await sleep(450);
      await presentEvidence('官方报名通知');
    }

    await clickByText('进入模拟');
    await sleep(900);
    const simulation = await layout('simulation');
    report.layouts.push(simulation);
    await shot(`${prefix}-06-simulation.png`, mobile);
    report.screenshots.push(`${prefix}-06-simulation.png`);

    await clickByText('运行推演');
    await sleep(2700);
    await shot(`${prefix}-07-simulation-output.png`);
    report.screenshots.push(`${prefix}-07-simulation-output.png`);

    await clickByText('结束推演');
    await sleep(900);
    const reversal = await layout('reversal');
    report.layouts.push(reversal);
    await shot(`${prefix}-08-reversal-start.png`);
    report.screenshots.push(`${prefix}-08-reversal-start.png`);

    if (route === '3') {
      await clickByText('跳过过渡');
      await sleep(1000);
    } else {
      await clickByText('确认权限交接');
      await sleep(850);
      await shot(`${prefix}-09-reversal-lost.png`);
      report.screenshots.push(`${prefix}-09-reversal-lost.png`);
      await clickByText('继续');
      await sleep(850);
      await clickByText('继续');
      await sleep(850);
      const lastFrame = await layout('reversal-last');
      report.layouts.push(lastFrame);
      await shot(`${prefix}-10-now-your-turn.png`);
      report.screenshots.push(`${prefix}-10-now-your-turn.png`);
      await clickByText('以学生身份继续');
      await sleep(900);
    }

    const defense = await layout('defense-1');
    report.layouts.push(defense);
    await shot(`${prefix}-11-defense.png`, mobile);
    report.screenshots.push(`${prefix}-11-defense.png`);

    const choices =
      route === '1'
        ? [
            ['暂停第三方入口', '继续下一项'],
            ['先和许言对口径', '继续下一项'],
            ['重做报名与核验', '进入临时结算'],
          ]
        : route === '2'
          ? [
              ['暂停第三方入口', '继续下一项'],
              ['先和许言对口径', '继续下一项'],
              ['只修过期链接', '进入临时结算'],
            ]
          : [
              ['暂停第三方入口', '继续下一项'],
              ['要求公开道歉', '继续下一项'],
              ['重做报名与核验', '进入临时结算'],
            ];

    for (let index = 0; index < choices.length; index += 1) {
      const [choice, nextLabel] = choices[index];
      await clickByText(choice);
      await sleep(900);
      await shot(`${prefix}-12-defense-${index + 1}-feedback.png`);
      report.screenshots.push(`${prefix}-12-defense-${index + 1}-feedback.png`);
      await clickByText(nextLabel);
      await sleep(1100);
    }

    await sleep(700);
    const complete = await layout('complete');
    report.layouts.push(complete);
    await shot(`${prefix}-13-complete.png`, true);
    report.screenshots.push(`${prefix}-13-complete.png`);

    report.consoleEvents = [...consoleEvents];
    report.checks.push({ name: 'ending-reached', ok: complete.endingReached });
    report.checks.push({
      name: 'no-horizontal-overflow',
      ok: report.layouts.every((item) => item.overflowX !== true),
      detail: report.layouts.filter((item) => item.overflowX).map((item) => item.label),
    });
    report.checks.push({
      name: 'no-console-errors',
      ok: consoleEvents.length === 0,
      detail: consoleEvents,
    });

    const expected =
      route === '1'
        ? { ending: '破晓', persona: 'ECPS' }
        : route === '2'
          ? { ending: '共识', persona: 'ECPS' }
          : { ending: '孤岛', persona: 'ECPS' };
    report.expected = expected;
    report.checks.push({
      name: 'route-ending',
      ok: String(complete.heading ?? '').includes(expected.ending),
      detail: complete.heading,
    });
    report.checks.push({
      name: 'persona-visible',
      ok: Boolean(complete.personaCode),
      detail: complete.personaCode,
    });
  } catch (error) {
    report.error = error.message;
    report.consoleEvents = [...consoleEvents];
    await shot(`${prefix}-99-failure.png`, true).catch(() => undefined);
  }

  console.log(
    'route summary',
    JSON.stringify({
      route,
      viewport,
      error: report.error,
      checks: report.checks,
      final: report.layouts.at(-1) ?? null,
      console: report.consoleEvents,
    }),
  );
  return report;
}

async function main() {
  await waitForEndpoint();
  const created = await (
    await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })
  ).json();

  ws = new WebSocket(created.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = () => reject(new Error('CDP socket failed'));
  });
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const task = pending.get(message.id);
      pending.delete(message.id);
      message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      consoleEvents.push(`exception: ${details.text} ${details.exception?.description ?? ''}`.slice(0, 400));
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      consoleEvents.push(
        `console.error: ${message.params.args
          .map((arg) => arg.value ?? arg.description ?? '')
          .join(' ')}`.slice(0, 400),
      );
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const reports = [];
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      console.log(`\n=== route ${route} / ${viewport} ===`);
      reports.push(await runRoute(route, viewport));
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    durationSeconds: Math.round((Date.now() - startTime) / 1000),
    routes: ROUTES,
    viewports: VIEWPORTS,
    reports,
  };
  writeFileSync(path.join(OUT, 'phase2-visual-report.json'), JSON.stringify(summary, null, 2));
  const failed = reports.filter(
    (item) => item.error || item.checks.some((check) => !check.ok),
  );
  console.log(`\n${reports.length - failed.length}/${reports.length} runs passed`);
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('visual check failed:', error.message);
    console.error('console events:', JSON.stringify(consoleEvents, null, 2));
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      ws?.close();
    } catch {
      // ignore
    }
    edge.kill();
  });
