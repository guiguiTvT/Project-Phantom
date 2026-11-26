import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Fingerprint, LockKeyhole, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { PhantomMark } from '@/components/boot/PhantomMark';
import { GAME_META } from '@/data/gameConfig';
import { readSaveMeta } from '@/services/saveService';
import { useGameStore } from '@/stores/gameStore';

const BOUNDARIES = [
  {
    icon: LockKeyhole,
    title: '隔离沙箱',
    body: '所有操作只影响虚拟校园，不连接任何真实系统。',
  },
  {
    icon: Fingerprint,
    title: '虚构身份',
    body: '人物、账号与公告均为虚构，不影射真实个人。',
  },
  {
    icon: ShieldCheck,
    title: '不采真实信息',
    body: '不需要真实姓名、账号或任何敏感个人信息。',
  },
];

export default function AuthorizationPage() {
  const [save] = useState(() => readSaveMeta());
  const beginBriefing = useGameStore((state) => state.beginBriefing);
  const resumeInvestigation = useGameStore((state) => state.resumeInvestigation);
  const restartCase = useGameStore((state) => state.restartCase);

  const resumable = Boolean(save);

  return (
    <motion.div
      className="relative flex min-h-full items-center justify-center overflow-hidden px-5 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-1/2 hidden -translate-y-1/2 text-primary/[0.07] lg:block"
      >
        <PhantomMark size={460} />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-primary/[0.05] blur-[110px]"
      />

      <div className="relative w-full max-w-[680px]">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-primary">
              <PhantomMark size={34} />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.24em] text-secondary">
                {GAME_META.title}
              </p>
              <p className="text-sm tracking-[0.22em] text-ink">{GAME_META.subtitle}</p>
            </div>
          </div>
          <span className="chip border-primary/25 bg-primary/[0.06] text-primary">
            <Sparkles size={11} />
            {GAME_META.edition}
          </span>
        </div>

        <motion.section
          className="case-card relative overflow-hidden p-7 sm:p-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <p className="eyebrow">演练授权书 · SANDBOX CONSENT</p>
          <h1 className="mt-4 text-[28px] font-light leading-tight tracking-wide text-ink sm:text-[34px]">
            你即将进入一座
            <span className="text-primary">虚构的校园</span>
          </h1>
          <p className="mt-3 max-w-[52ch] text-[14px] leading-7 text-secondary">
            文化节开幕前两天，社团群里转来一条「补录」通知。
            它看起来很急、很像真的——直到有人发现，官方公告里根本没有这个东西。
            你将以安全观察员的身份，进入隔离沙箱，把矛盾找出来。
          </p>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
            {BOUNDARIES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="case-inset p-3.5">
                  <Icon size={15} className="text-primary/80" />
                  <p className="mt-2.5 text-[12px] font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-secondary/80">{item.body}</p>
                </div>
              );
            })}
          </div>

          {resumable && save && (
            <div className="mt-6 flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/[0.045] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary/80">
                  上次调查 · {save.callsign}
                </p>
                <p className="mt-1 text-[12px] text-secondary">
                  {save.completed
                    ? '调查阶段已完成，可以回去回顾当时的判断。'
                    : `已读 ${save.viewedCount} 份材料 · 情报板 ${save.pinnedCount} 条 · 进度 ${save.progress}/3`}
                </p>
              </div>
              <span className="chip shrink-0 border-primary/25 text-primary">存档可用</span>
            </div>
          )}

          <div className="mt-7">
            {resumable ? (
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button type="button" onClick={resumeInvestigation} className="cta flex-1">
                  继续上次调查
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={restartCase}
                  className="btn btn-ghost h-[52px] shrink-0 px-5"
                  title="清空当前调查进度，从任务简报重新开始"
                >
                  <RotateCcw size={14} />
                  重新开始
                </button>
              </div>
            ) : (
              <button type="button" onClick={beginBriefing} className="cta w-full">
                签署授权 · 查看任务简报
                <ArrowRight size={17} />
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
            本演练仅用于安全教育。你不需要、也不应输入任何真实的个人敏感信息。
          </p>
        </motion.section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
          <span>{GAME_META.fictiveNotice}</span>
          <span>PHANTOM OS {GAME_META.version} · LOCAL DEMO</span>
        </div>
      </div>
    </motion.div>
  );
}
