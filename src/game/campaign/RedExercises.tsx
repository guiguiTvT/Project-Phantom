import { Activity, Check, CirclePause, LockKeyhole, Radio, RotateCw, Shield, ShieldCheck, Zap } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { sfx } from '../audio/sound';
import { Action, Next, useLessMotion } from '../chapter/components';
import { CIRCUIT_TILES, DIRECTION_NAMES, INITIAL_TURNS, portsFor, SIGNALS, SIGNAL_WINDOW, SUGGESTED_TURNS, traceCircuit,
  type ExerciseAttempt, type Gate } from './exercises';
import { PlayPanel } from './SceneTools';

interface Controls {
  onClose: () => void;
  onSkip: () => void;
  onFinish: (attempt: ExerciseAttempt) => void;
}
const GATES = [
  { key: 'pass', label: '放行', icon: ShieldCheck, keyboard: '1' },
  { key: 'block', label: '截停', icon: Shield, keyboard: '2' },
  { key: 'hold', label: '留待核查', icon: CirclePause, keyboard: '3' },
] as const;

export function SignalDefense({ onClose, onSkip, onFinish }: Controls) {
  const reduced = useLessMotion();
  const [paced, setPaced] = useState(!reduced);
  const [live, setLive] = useState(false);
  const [atGate, setAtGate] = useState(false);
  const [routes, setRoutes] = useState<Gate[]>([]);
  const [answer, setAnswer] = useState<Gate>();
  const [error, setError] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const here = routes.length;
  const signal = SIGNALS[here];
  const finished = !signal;

  function decide(gate: Gate) {
    if (!live || !signal || answer) return;
    if (gate !== signal.decision) {
      sfx.wrong();
      setError(true);
      setAtGate(true);
      setStreak(0);
      return;
    }
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    setBest(Math.max(best, nextStreak));
    setAnswer(gate);
    sfx.collect();
  }
  const choice = useRef(decide);
  choice.current = decide;

  useEffect(() => {
    if (!live || finished || !paced || answer || atGate) return;
    const timeout = window.setTimeout(() => setAtGate(true), SIGNAL_WINDOW);
    return () => window.clearTimeout(timeout);
  }, [live, finished, paced, answer, atGate, here]);

  useEffect(() => {
    if (!answer) return;
    const timeout = window.setTimeout(() => {
      setRoutes((current) => [...current, answer]);
      setAnswer(undefined);
      setAtGate(false);
      setError(false);
    }, 1100);
    return () => window.clearTimeout(timeout);
  }, [answer]);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.repeat) return;
      const gate = GATES.find((gate) => gate.keyboard === event.key);
      if (gate) { event.preventDefault(); choice.current(gate.key); }
    }
    if (!live || finished) return;
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [live, finished]);

  const feedback = answer ? signal?.why : error ? `重新核对来源。${signal?.source}。`
    : atGate && paced ? '信号停在检查点了。按你自己的节奏处理。' : '核对这条信号的来源，再让它通过正确的闸口。';
  return <PlayPanel title="信号拦截" label="红客沙盘 · 报名流量回放" icon={<Radio size={23} aria-hidden="true" />} tone="dark" onClose={onClose}>
    <div className="c7-arcade-status">
      <span><Activity size={15} aria-hidden="true" /> 已处理 <strong>{here} / {SIGNALS.length}</strong></span>
      {best > 1 && <span><Zap size={14} aria-hidden="true" /> 最佳 {best} 连中</span>}
      <div role="progressbar" aria-label="已处理信号" aria-valuenow={here} aria-valuemin={0} aria-valuemax={SIGNALS.length}>
        {SIGNALS.map(({ id }, index) => <i key={id} data-done={index < here} />)}
      </div>
    </div>
    {!live || finished ? <div className="c7-arcade-intro">
      {finished ? <ShieldCheck size={43} aria-hidden="true" /> : <Radio size={43} aria-hidden="true" />}
      <strong>{finished ? '闸口复核完成' : '让可信信号通过'}</strong>
      <p>{finished ? '官方入口畅通。两条失效入口已截停，来电反馈留给后续核查。'
        : '放行已核验的入口，截停明确有问题的入口，依据不足就留下待查。'}</p>
      {!finished && paced && <small>信号抵达检查点会停住。你仍可继续判断。</small>}
    </div> : <div className="c7-signal" data-route={answer ?? 'inbound'}>
      <div className="c7-signal-runway" aria-hidden="true"><i /><i /><i />
        <span key={here} className={paced && !atGate && !answer ? 'c7-signal-orb c7-signal-orb--moving' : 'c7-signal-orb'}
          style={{ '--signal-time': `${SIGNAL_WINDOW}ms` } as CSSProperties}><Zap size={17} /></span><b />
      </div>
      <div className="c7-signal-readout"><code>{signal.id}</code><strong>{signal.name}</strong><p>{signal.source}</p></div>
    </div>}
    {live && !finished && <>
      <div className="c7-gates">{GATES.map(({ key, label, icon: Icon, keyboard }) =>
        <button key={key} type="button" data-gate={key} disabled={Boolean(answer)} onClick={() => decide(key)}>
          <Icon size={19} aria-hidden="true" />{label}<kbd>{keyboard}</kbd>
        </button>)}</div>
      <p className={`c7-play-feedback${answer ? ' c7-play-feedback--good' : ''}`} role="status">{feedback}</p>
    </>}
    <div className="c7-play-actions">
      {finished ? <Next onClick={() => { sfx.complete(); onFinish({ kind: 'signals', routes }); }}>带拦截记录回现场</Next> : <>
        {!live && <><Next onClick={() => { sfx.select(); setLive(true); }}>启动闸口</Next>
          <Action aria-pressed={!paced} onClick={() => setPaced(!paced)}>{paced ? '使用不限时模式' : '使用节奏模式'}</Action></>}
        <Action tone="quiet" onClick={onSkip}>暂离沙盘，继续剧情</Action>
      </>}
    </div>
  </PlayPanel>;
}

export function CircuitExercise({ onClose, onSkip, onFinish }: Controls) {
  const [turns, setTurns] = useState<number[]>([...INITIAL_TURNS]);
  const [result, setResult] = useState<ReturnType<typeof traceCircuit>>();
  const [hint, setHint] = useState<number>();
  const connected = Boolean(result?.connected);
  const needsChange = CIRCUIT_TILES.slice(0, 3).findIndex((_, index) => {
    const expected = portsFor(index, SUGGESTED_TURNS);
    return !portsFor(index, turns).every((port) => expected.includes(port));
  });
  function turn(index: number) {
    setTurns(turns.map((value, tile) => tile === index ? (value + 1) % 4 : value));
    setHint(undefined);
    setResult(undefined);
    sfx.select();
  }
  function test() {
    const next = traceCircuit(turns);
    setResult(next);
    setHint(undefined);
    if (next.connected) sfx.complete();
    else sfx.wrong();
  }
  return <PlayPanel title="资金断路板" label="红客沙盘 · 实习记录回放" icon={<Zap size={24} aria-hidden="true" />} tone="dark" onClose={onClose}>
    <p className="c7-play-instruction">点上排的线板旋转，接通 <strong>已收的 ¥20</strong> 到 <strong>本人账单</strong>。下方的待付资金保持隔离。</p>
    <div className="c7-circuit">
      {CIRCUIT_TILES.map(({ label }, index) => {
        const ports = portsFor(index, turns);
        const path = result?.path.indexOf(index) ?? -1;
        const lit = result?.stop === index && !connected ? 'blocked' : path >= 0 ? 'active' : hint === index ? 'hint' : '';
        const wires = ports.map((port) => <i key={port} className={`c7-wire c7-wire--${port}`} />);
        const style = { '--pulse-index': Math.max(0, path) } as CSSProperties;
        return index < 3 ? <button type="button" key={label} onClick={() => turn(index)} disabled={connected}
          className="c7-circuit-tile" data-status={lit} style={style}
          aria-label={`${label}，当前接向${ports.map((port) => DIRECTION_NAMES[port]).join('、')}，点击旋转`}>
          {wires}<span>{label}</span><RotateCw aria-hidden="true" size={14} />
        </button> : <div className="c7-circuit-tile c7-circuit-tile--fixed" data-status={lit} data-closed={index === 4} key={label} style={style}>
          {wires}<span>{label}</span><strong>{index === 3 ? '+ ¥20' : index === 4 ? <><LockKeyhole size={14} /> ¥300</> : '收款记录'}</strong>
        </div>;
      })}
    </div>
    <p className={`c7-play-feedback${connected ? ' c7-play-feedback--good' : ''}`} role="status">
      {connected ? <><Check size={17} aria-hidden="true" />沙盘信号通过。已收到的 20 元与后来要求支付的 300 元是两笔方向相反的钱。</>
        : result ? `信号停在「${CIRCUIT_TILES[result.stop].label}」。让相邻线板的端口对上再试。`
        : hint !== undefined ? `${CIRCUIT_TILES[hint].label}要接向${portsFor(hint, SUGGESTED_TURNS).map((port) => DIRECTION_NAMES[port]).join('和')}。`
        : '从左下角出发，经上排线板到达右下角。'}
    </p>
    <div className="c7-play-actions">{connected ? <Next onClick={() => onFinish({ kind: 'circuit', turns })}>带断路记录回现场</Next>
      : <><Next onClick={test}>发出测试信号</Next><Action onClick={() => { setResult(undefined); setHint(needsChange < 0 ? undefined : needsChange); }}>提示一块线板</Action>
        <Action tone="quiet" onClick={onSkip}>暂离沙盘，继续剧情</Action></>}</div>
  </PlayPanel>;
}
