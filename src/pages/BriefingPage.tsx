import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock3, FileSearch, Target } from 'lucide-react';
import { PhantomMark } from '@/components/boot/PhantomMark';
import { Button } from '@/components/ui/Button';
import { CASE_META } from '@/data/investigation';
import { GAME_META } from '@/data/gameConfig';
import { useGameStore } from '@/stores/gameStore';

const TIMELINE = [
  {
    time: '18:05',
    tone: 'warning' as const,
    title: '一张「陈老师」的私聊截图',
    body: '对方用私人账号催你点开补录链接，还叮嘱「先别在群里说」。',
  },
  {
    time: '18:20',
    tone: 'danger' as const,
    title: '社团群转来「今晚截止」的通知',
    body: '发送账号没有历史记录，小程序名字和官方只差一个字。',
  },
  {
    time: '19:10',
    tone: 'primary' as const,
    title: '顾老师发布官方审批说明',
    body: '教务处在公告里写明：没有审批任何补录入口，截止时间已延长到 11-27。',
  },
];

export default function BriefingPage() {
  const beginInvestigation = useGameStore((state) => state.beginInvestigation);
  const backToAuthorization = useGameStore((state) => state.backToAuthorization);

  return (
    <div className="min-h-full overflow-y-auto px-5 py-7 sm:py-9">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={backToAuthorization}
            className="inline-flex items-center gap-2 rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} />
            返回授权书
          </button>
          <div className="flex items-center gap-2.5 text-primary/80">
            <PhantomMark size={22} />
            <span className="font-mono text-[9px] tracking-[0.22em] text-muted">
              {GAME_META.title} · {GAME_META.chapter}
            </span>
          </div>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="chip border-primary/30 bg-primary/[0.07] text-primary">
              {CASE_META.caseNo}
            </span>
            <span className="chip">第 1 天 · 19:20</span>
            <span className="chip">调查阶段</span>
          </div>
          <h1 className="mt-4 text-[30px] font-light leading-tight tracking-wide text-ink sm:text-[38px]">
            {CASE_META.title}
          </h1>
          <p className="mt-3 max-w-[62ch] text-[14px] leading-7 text-secondary">
            {CASE_META.subtitle}
          </p>
        </motion.header>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <section className="case-card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-medium tracking-wide text-ink">发生了什么</h2>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  tonight · 3 signals
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {TIMELINE.map((item) => (
                  <div key={item.time} className="flex gap-3.5">
                    <div className="flex w-11 shrink-0 flex-col items-center">
                      <span className="font-mono text-[11px] text-secondary">{item.time}</span>
                      <span className="mt-2 h-full w-px flex-1 bg-white/[0.07]" />
                    </div>
                    <div className="case-inset mb-1 flex-1 p-3.5">
                      <p
                        className={
                          item.tone === 'danger'
                            ? 'text-[13px] font-medium text-danger/90'
                            : item.tone === 'warning'
                              ? 'text-[13px] font-medium text-warning/90'
                              : 'text-[13px] font-medium text-primary/90'
                        }
                      >
                        {item.title}
                      </p>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-secondary/85">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-primary">
                <Target size={15} />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em]">本轮目标</p>
              </div>
              <p className="mt-3 text-[14px] leading-7 text-ink/90">{CASE_META.objective}</p>
            </section>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
          >
            <section className="case-card p-5 sm:p-6">
              <h2 className="text-[15px] font-medium tracking-wide text-ink">你可以先做三件事</h2>
              <div className="mt-4 space-y-2.5">
                {CASE_META.firstActions.map((action) => (
                  <div
                    key={action.index}
                    className="flex gap-3.5 rounded-xl border border-white/[0.05] bg-surface-2/45 p-3.5"
                  >
                    <span className="font-mono text-[11px] text-primary/70">{action.index}</span>
                    <div>
                      <p className="text-[13px] font-medium text-ink/90">{action.title}</p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-secondary/80">
                        {action.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="case-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">
                  <Clock3 size={11} />
                  {CASE_META.estimatedMinutes}
                </span>
                <span className="chip">
                  <FileSearch size={11} />
                  3 份关键材料
                </span>
              </div>
              <button type="button" onClick={beginInvestigation} className="cta mt-5 w-full">
                开始调查
                <ArrowRight size={17} />
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                进入后，左侧会提示你第一步该做什么。所有操作只影响这个虚构沙箱。
              </p>
              <div className="mt-4 border-t border-white/[0.06] pt-3">
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={backToAuthorization}
                  leading={<ArrowLeft size={12} />}
                  className="w-full justify-start px-0"
                >
                  先看看演练边界
                </Button>
              </div>
            </section>
          </motion.div>
        </div>

        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
          {GAME_META.fictiveNotice}
        </p>
      </div>
    </div>
  );
}
