import { ArrowRight, Play, Timer } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { ASSETS } from '../data/assets';
import type { Mode } from './caseFile';
import type { CaseState } from './caseEngine';
import { useCaseSession, type QuizAnswer, type QuizGroup } from './caseStore';
import { Action, Badge, Brand, Modal, Next, Settings } from './components';
import { ScriptScene } from './NovelScene';
import { PROLOGUE, QUICK_PROLOGUE } from './script';
import { QUESTIONS } from './questions';

export function Opening({ run, outdated, onStart, onResume }: {
  run: CaseState | null; outdated: boolean; onStart: (mode: Mode, quiz: boolean) => void; onResume: () => void;
}) {
  const [quiz, setQuiz] = useState(false);
  return <main className="pp-cover" style={{ '--pp-art': `url(${ASSETS.cover})` } as CSSProperties}>
    <div className="pp-cover-frame">
      <header className="pp-cover-header"><Brand /><div className="pp-cover-tools"><span>Hack4Good · 技术向善</span><Settings /></div></header>
      <div className="pp-cover-body">
        <div className="pp-cover-kicker"><span /> 第一章 · 信任裂缝</div>
        <h1>破壁<span>行动</span></h1>
        <div className="pp-cover-english">PROJECT PHANTOM</div>
        <p className="pp-cover-story">「我昨晚就报了名。你看，截图还在。」<br />周宁指着那份刚贴出来的名单。上面没有他。</p>
        <p className="pp-cover-goal">科技文化节今晚开幕。离志愿者分组，还有三个小时。</p>
        {run && <Next className="pp-continue" onClick={onResume}>继续故事 <span>{run.time}</span></Next>}
        <div className="pp-mode-grid">
          <button className="pp-mode pp-mode--full" onClick={() => onStart('full', quiz)}>
            <Play size={19} aria-hidden="true" /><span><strong>进入故事</strong><small>完整体验 · 10–15 分钟</small></span><ArrowRight size={17} aria-hidden="true" />
          </button>
          <button className="pp-mode" onClick={() => onStart('quick', quiz)}>
            <Timer size={19} aria-hidden="true" /><span><strong>快速体验</strong><small>约 3 分钟</small></span><ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
        <details className="nv-cover-options"><summary>体验选项</summary><label className="pp-quiz-opt"><input type="checkbox" checked={quiz} onChange={(event) => setQuiz(event.target.checked)} /> 参加 3 题体验记录<span>（可选，仅保存在本机）</span></label></details>
        {outdated && <p className="pp-cover-note">检测到旧版或无法读取的存档，请开始一局新的调查。</p>}
      </div>
      <footer className="pp-cover-foot"><span>澄川大学 · 科技文化节</span><span>虚构校园演练 · 无需注册</span></footer>
    </div>
  </main>;
}

export function Quiz({ group, kind, onFinish, onSkip }: { group: QuizGroup; kind: 'pre' | 'post'; onFinish: (answers: QuizAnswer[]) => void; onSkip?: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const question = QUESTIONS[group][index];
  const chosen = answers[index];
  return <section className="pp-panel pp-quiz" aria-label={kind === 'pre' ? '入场情境题' : '离场情境题'}>
    <div className="pp-panel-head"><h2>{kind === 'pre' ? '入场情境题' : '离场情境题'}</h2><Badge>第 {index + 1} / 3 题</Badge></div>
    <fieldset>
      <legend>{question.prompt}</legend>
      {question.options.map((option, optionIndex) => <label key={option} className={`pp-choice${chosen === optionIndex ? ' is-selected' : ''}`}>
        <input type="radio" name={`quiz-${kind}-${index}`} checked={chosen === optionIndex} onChange={() => setAnswers((previous) => {
          const updated = [...previous]; updated[index] = optionIndex as QuizAnswer; return updated;
        })} /><span>{option}</span>
      </label>)}
    </fieldset>
    <div className="pp-action-row pp-action-row--split">
      <div className="pp-quiz-nav">
        {index > 0 && <Action tone="quiet" onClick={() => setIndex(index - 1)}>上一题</Action>}
        {onSkip && <Action tone="quiet" onClick={onSkip}>跳过情境题</Action>}
      </div>
      <Next disabled={chosen === undefined} onClick={() => index < 2 ? setIndex(index + 1) : onFinish(answers)}>{index < 2 ? '下一题' : '保存本组答案'}</Next>
    </div>
  </section>;
}

export function Briefing({ run }: { run: CaseState }) {
  const act = useCaseSession((state) => state.act);
  const quiz = useCaseSession((state) => state.quizzes.runs[run.id]);
  const recordQuiz = useCaseSession((state) => state.recordQuiz);
  const closeQuiz = () => recordQuiz('pre', null);
  return <>
    <ScriptScene background={ASSETS.activityRoom} location="序章 · 文化节开幕日" time="09:00"
      lines={run.mode === 'quick' ? QUICK_PROLOGUE : PROLOGUE}
      finishLabel="查看现场" onFinish={() => act({ type: 'enter' })} />
    {quiz && !quiz.pre && !quiz.preSkipped && <Modal title="开场前" onClose={closeQuiz} wide>
      <Quiz group={quiz.preGroup} kind="pre" onFinish={(answers) => recordQuiz('pre', answers)} onSkip={closeQuiz} />
    </Modal>}
  </>;
}
