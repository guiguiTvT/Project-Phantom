import { ArrowRight, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { sfx } from '../audio/sound';
import { ASSETS } from '../data/assets';
import { CASE_META } from '../data/evidence';
import { useVnSettings } from '../store/settingsStore';
import { useVnStore } from '../store/vnStore';

export function GameCover() {
  const startCase = useVnStore((state) => state.startCase);
  const muted = useVnSettings((state) => state.muted);
  const setMuted = useVnSettings((state) => state.setMuted);
  const reduceMotion = useVnSettings((state) => state.reduceMotion);
  const setReduceMotion = useVnSettings((state) => state.setReduceMotion);

  const start = () => {
    sfx.select();
    startCase();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden bg-vn-night">
      <img
        src={ASSETS.cover}
        alt="黄昏中的校园，文化节帐篷与公告板"
        className="absolute inset-0 h-full w-full object-cover object-[60%_42%] sm:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-vn-night via-vn-night/75 to-vn-night/10 sm:via-vn-night/60 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-vn-night via-vn-night/20 to-vn-night/40" />
      <div className="vn-grain absolute inset-0 opacity-30" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <div className="flex items-center gap-3">
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rotate-45 rounded-[3px] border border-vn-amber/80" />
            <span className="h-1.5 w-1.5 rotate-45 bg-vn-amber" />
          </span>
          <div className="leading-tight">
            <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-vn-paper/50">Project Phantom</div>
            <div className="text-[12px] tracking-[0.22em] text-vn-paper/85">破壁行动</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-white/15 bg-vn-night/40 px-3 py-1.5 text-[10px] tracking-[0.18em] text-vn-paper/60 backdrop-blur-sm sm:inline">
            {CASE_META.chapter} · {CASE_META.title}
          </span>
          <button
            type="button"
            onClick={() => setReduceMotion(!reduceMotion)}
            aria-label={reduceMotion ? '开启动态效果' : '减少动态效果'}
            aria-pressed={reduceMotion}
            title={reduceMotion ? '开启动态效果' : '减少动态效果'}
            className="rounded-full border border-white/15 bg-vn-night/40 p-2 text-vn-paper/70 backdrop-blur-sm transition hover:text-vn-paper"
          >
            <Sparkles className={reduceMotion ? 'h-4 w-4 opacity-40' : 'h-4 w-4'} />
          </button>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? '开启音效' : '关闭音效'}
            className="rounded-full border border-white/15 bg-vn-night/40 p-2 text-vn-paper/70 backdrop-blur-sm transition hover:text-vn-paper"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-1 items-end px-5 pb-12 pt-24 sm:items-center sm:px-8 sm:pb-20">
        <div className="max-w-[560px] animate-vn-rise">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.34em] text-vn-amber">
            <span className="h-px w-8 bg-vn-amber/60" />
            互动推理 · 第一章
          </div>

          <h1 className="mt-4 text-[58px] font-black leading-[0.95] tracking-[0.05em] text-vn-paper drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)] sm:text-[82px]">
            破壁<span className="text-vn-amber">行动</span>
          </h1>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.44em] text-vn-paper/40">
            Project Phantom
          </div>

          <p className="mt-6 max-w-[430px] text-[14px] leading-7 text-vn-paper/85 sm:text-[15px] sm:leading-8">
            文化节开幕前 48 小时，活动室的桌上多了一张「更方便」的报名通知。
            <br className="hidden sm:block" />
            先以红队身份找出裂缝，再以普通学生身份处置后果。
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-[10px] tracking-[0.08em] text-vn-paper/60">
            {['现场调查', '质询与推演', '身份反转', '本地演示'].map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-vn-night/40 px-3 py-1 backdrop-blur-sm">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={start}
              className="group flex items-center gap-3 rounded-full bg-vn-amber px-7 py-3.5 text-[14px] font-semibold tracking-[0.12em] text-[#2E2318] shadow-vnAmber transition hover:bg-[#E4B991] active:scale-[0.99]"
            >
              进入故事
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="text-[10px] leading-4 text-vn-paper/40">
              以获授权的红队测试员进入
              <br />
              点击调查，逐句核对
            </span>
          </div>

          <p className="mt-8 max-w-[420px] text-[10px] leading-5 text-vn-paper/35">
            故事中的学校、人物、账号与系统均为虚构。红队推演只在隔离沙盒中进行，不连接任何真实校园服务。
          </p>
        </div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between border-t border-white/10 px-5 py-3 text-[9px] tracking-[0.2em] text-vn-paper/35 sm:px-8">
        <span>{CASE_META.caseNo} · {CASE_META.timeLabel}</span>
        <span className="hidden sm:inline">红队测试员 · 本地互动演示</span>
      </footer>
    </div>
  );
}
