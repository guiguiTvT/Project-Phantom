import { useEffect } from 'react';
import { clsx } from 'clsx';
import { ArrowRight, BadgeCheck, Bell, LockKeyhole, ShieldOff, SkipForward } from 'lucide-react';
import { sfx } from '../audio/sound';
import { REVERSAL_FRAMES } from '../data/story';
import { useVnSettings } from '../store/settingsStore';
import { useVnStore } from '../store/vnStore';
import { useVnUi } from '../store/uiStore';
import { StageFrame } from '../ui/StageFrame';
import { VnButton } from '../ui/VnButton';

export function ReversalScene() {
  const reversalIndex = useVnStore((state) => state.reversalIndex);
  const npcDoneIds = useVnStore((state) => state.npcDoneIds);
  const contradictions = useVnStore((state) => state.contradictions);
  const simulationResult = useVnStore((state) => state.simulationResult);
  const advanceReversal = useVnStore((state) => state.advanceReversal);
  const skipReversal = useVnStore((state) => state.skipReversal);
  const showNotice = useVnUi((state) => state.showNotice);
  const reduceMotion = useVnSettings((state) => state.reduceMotion);

  const frame = REVERSAL_FRAMES[Math.min(reversalIndex, REVERSAL_FRAMES.length - 1)];
  const last = reversalIndex >= REVERSAL_FRAMES.length - 1;
  const lost = frame.permission === 'lost';

  useEffect(() => {
    if (frame.permission === 'lost') sfx.wrong();
    else if (frame.permission === 'active') sfx.select();
    else sfx.flip();
  }, [frame.id, frame.permission]);

  const next = () => {
    const result = advanceReversal();
    if (!result.ok) showNotice(result.message);
  };

  const skip = () => {
    const result = skipReversal();
    if (result.ok) sfx.select();
    else showNotice(result.message);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select')) return;
      event.preventDefault();
      next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const reactions = [
    npcDoneIds.includes('linxia')
      ? '林夏：转发记录我留着，需要可以给你。'
      : '林夏：群里还在问链接，我没接话。',
    npcDoneIds.includes('chen')
      ? '陈老师：后台归教务，我只能看公告。'
      : '陈老师：后天开幕，先稳住现场。',
  ];
  const verified = simulationResult?.verified ?? false;

  return (
    <div className="vn-frame px-3 pb-5 pt-3 sm:px-6 sm:pt-5">
      <StageFrame
        bg={frame.bg}
        className="min-h-[520px] w-full sm:min-h-[560px]"
        bgClassName={clsx(
          'brightness-[0.46]',
          frame.permission === 'active' ? 'saturate-[0.9]' : 'saturate-[0.4]',
        )}
      >
        <div className="relative flex min-h-[520px] flex-col justify-between px-4 py-4 sm:min-h-[560px] sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] tracking-[0.14em] transition',
                  lost || !frame.permission
                    ? 'border-vn-alert/50 bg-vn-alert/12 text-[#F0C3C7]'
                    : 'border-vn-sage/45 bg-vn-sage/10 text-vn-sage',
                )}
              >
                {lost || !frame.permission ? <ShieldOff className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
                {lost ? '权限已收回' : frame.permission === 'active' ? '红队权限 · ACTIVE' : '学生身份'}
              </span>
              <span className="font-mono text-[9px] tracking-[0.18em] text-vn-paper/40">{frame.time}</span>
            </div>
            <button
              type="button"
              onClick={skip}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-vn-night/40 px-2.5 py-1 text-[9px] tracking-[0.1em] text-vn-paper/50 backdrop-blur-sm transition hover:text-vn-paper"
            >
              <SkipForward className="h-3 w-3" />
              跳过过渡
            </button>
          </div>

          <div className="mx-auto w-full max-w-[560px] py-6 text-center sm:py-8">
            <div
              className={clsx(
                'relative mx-auto w-full rounded-2xl border p-5 backdrop-blur-md sm:p-6',
                lost
                  ? 'border-vn-alert/40 bg-vn-night/72'
                  : 'border-white/18 bg-vn-night/62',
              )}
            >
              {lost && !reduceMotion && (
                <span className="pointer-events-none absolute inset-0 animate-vn-flash rounded-2xl bg-vn-alert/20" />
              )}
              <div className="relative">
                <div className="flex items-center justify-center gap-2 text-[9px] tracking-[0.3em] text-vn-amber/80">
                  <span className="h-px w-6 bg-vn-amber/45" />
                  {frame.kicker}
                  <span className="h-px w-6 bg-vn-amber/45" />
                </div>
                <h1
                  className={clsx(
                    'mx-auto mt-3 max-w-[440px] text-[26px] font-black leading-tight tracking-[0.04em] text-vn-paper sm:text-[34px]',
                    lost && 'animate-vn-stamp',
                  )}
                >
                  {frame.title}
                </h1>
                <p className="mx-auto mt-3 max-w-[420px] text-[12px] leading-6 text-vn-paper/65 sm:text-[13px]">
                  {frame.body}
                </p>

                {lost && (
                  <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-vn-alert/45 bg-vn-alert/10 px-3 py-1.5 text-[10px] tracking-[0.12em] text-[#F0C3C7]">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    凭据失效 · 权限已断开
                  </div>
                )}

                {frame.notification && (
                  <div className="mx-auto mt-4 flex max-w-[400px] items-start gap-2.5 rounded-xl border border-vn-amber/30 bg-vn-paper/[0.06] px-3 py-2.5 text-left">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vn-amber/15 text-vn-amber">
                      <Bell className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-vn-paper/90">{frame.notification.from}</span>
                        {frame.notification.time && (
                          <span className="font-mono text-[8px] text-vn-paper/35">{frame.notification.time}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] leading-5 text-vn-paper/60">{frame.notification.text}</p>
                    </div>
                  </div>
                )}

                {last && (
                  <div className="mx-auto mt-4 max-w-[430px] space-y-1.5 text-left">
                    <div className="text-[9px] tracking-[0.18em] text-vn-paper/35">你离开后的群聊</div>
                    {reactions.map((line) => (
                      <p key={line} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] leading-5 text-vn-paper/60">
                        {line}
                      </p>
                    ))}
                    <p className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] leading-5 text-vn-paper/60">
                      顾老师：权限没了，只能按校园流程走。
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] text-vn-paper/45">
                        {verified ? '已确认风险保留' : '未确认项待核对'}
                      </span>
                      {contradictions.length > 0 && (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] text-vn-paper/45">
                          {contradictions.length} 条矛盾记录
                        </span>
                      )}
                      {npcDoneIds.length > 0 && (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] text-vn-paper/45">
                          {npcDoneIds.length} 位相关者记录
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5">
              {REVERSAL_FRAMES.map((item, index) => (
                <span
                  key={item.id}
                  className={clsx(
                    'h-1.5 rounded-full transition-all',
                    index === reversalIndex
                      ? 'w-6 bg-vn-amber'
                      : index < reversalIndex
                        ? 'w-1.5 bg-vn-paper/45'
                        : 'w-1.5 bg-vn-paper/15',
                  )}
                />
              ))}
            </div>
            <VnButton variant={last ? 'amber' : 'darkGhost'} onClick={next}>
              {last ? '以学生身份继续' : reversalIndex === 0 ? '确认权限交接' : '继续'}
              <ArrowRight className="h-3 w-3" />
            </VnButton>
            <p className="text-[9px] tracking-[0.1em] text-vn-paper/30">
              空格继续 · 记录保留
            </p>
          </div>
        </div>
      </StageFrame>
    </div>
  );
}
