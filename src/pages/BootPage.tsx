import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Fingerprint,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { BootSequence } from '@/components/boot/BootSequence';
import { PhantomMark } from '@/components/boot/PhantomMark';
import { Button } from '@/components/ui/Button';
import { ModalShell } from '@/components/ui/Modal';
import { GAME_META } from '@/data/gameConfig';
import { readSaveMeta } from '@/services/saveService';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { formatSaveTime } from '@/utils/format';

function PortalAction({
  index,
  icon: Icon,
  title,
  en,
  description,
  onClick,
  disabled,
  hint,
  primary = false,
}: {
  index: string;
  icon: typeof Play;
  title: string;
  en: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative flex w-full items-center gap-4 border px-4 py-4 text-left transition-all duration-200',
        primary
          ? 'border-primary/45 bg-primary/[0.06] hover:bg-primary/[0.11]'
          : 'border-line/80 bg-surface-2/50 hover:border-secondary/50 hover:bg-surface-2/90',
        disabled && 'cursor-not-allowed opacity-45 hover:border-line/80 hover:bg-surface-2/50',
      )}
    >
      <span className="font-mono text-[10px] tracking-widest text-muted">{index}</span>
      <Icon
        size={17}
        className={cn(
          'shrink-0 transition-colors',
          primary ? 'text-primary' : 'text-secondary group-hover:text-ink',
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className={cn('text-sm font-medium', primary ? 'text-primary' : 'text-ink')}>
            {title}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{en}</span>
        </span>
        <span className="mt-1 block truncate text-[11px] text-secondary/80">
          {disabled ? hint ?? description : description}
        </span>
      </span>
      <ArrowRight
        size={14}
        className={cn(
          'shrink-0 text-muted transition-transform duration-200',
          !disabled && 'group-hover:translate-x-0.5 group-hover:text-primary',
        )}
      />
    </button>
  );
}

export default function BootPage() {
  const [booting, setBooting] = useState(() => {
    try {
      return sessionStorage.getItem('phantom.bootSeen') !== '1';
    } catch {
      return true;
    }
  });
  const [confirmNew, setConfirmNew] = useState(false);

  const player = useGameStore((state) => state.player);
  const continueGame = useGameStore((state) => state.continueGame);
  const goToIdentity = useGameStore((state) => state.goToIdentity);
  const openModal = useUiStore((state) => state.openModal);
  const resetUi = useUiStore((state) => state.resetUi);
  const pushToast = useUiStore((state) => state.pushToast);

  const saveMeta = useMemo(() => readSaveMeta(), []);
  const hasPlayer = Boolean(player);

  const finishBoot = () => {
    try {
      sessionStorage.setItem('phantom.bootSeen', '1');
    } catch {
      // 隐私模式下忽略
    }
    setBooting(false);
  };

  const handleStart = () => {
    if (hasPlayer) {
      setConfirmNew(true);
    } else {
      goToIdentity();
    }
  };

  const handleContinue = () => {
    if (!hasPlayer) return;
    continueGame();
    resetUi();
    pushToast({ title: '已恢复上次演练', description: '世界状态与证据库已载入。', tone: 'success' });
  };

  return (
    <>
      <AnimatePresence>{booting && <BootSequence onComplete={finishBoot} />}</AnimatePresence>

      <main className="relative flex min-h-full flex-col overflow-hidden">
        <div className="grid-field pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-40 top-1/2 hidden -translate-y-1/2 text-primary opacity-[0.055] xl:block">
          <PhantomMark size={640} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-6 py-6 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="border border-line/80 bg-surface-2/70 p-1.5 text-primary">
                <PhantomMark size={26} />
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest2 text-muted">
                  XINGHE UNIVERSITY · CSL SANDBOX
                </p>
                <p className="text-[11px] tracking-[0.14em] text-secondary">校园网络安全实验室</p>
              </div>
            </div>
            <div className="hidden items-center gap-6 font-mono text-[9px] uppercase tracking-[0.2em] text-muted sm:flex">
              <span>HACK4GOOD 2026</span>
              <span className="flex items-center gap-2 text-primary/80">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
                SANDBOX READY
              </span>
              <span>{GAME_META.version}</span>
            </div>
          </header>

          <div className="grid flex-1 grid-cols-1 items-center gap-10 py-10 lg:grid-cols-[1.06fr_.94fr] lg:gap-16 lg:py-14">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-[620px]"
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-primary/60" />
                <p className="eyebrow text-primary/90">chapter 01 / the trust fracture</p>
              </div>

              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.5em] text-secondary">
                PROJECT
              </p>
              <h1 className="mt-2 font-mono text-[clamp(2.7rem,6vw,4.6rem)] font-semibold leading-none tracking-[0.04em] text-ink text-shadow-cyan">
                PHANTOM<span className="text-primary">.</span>
              </h1>
              <div className="mt-5 flex items-center gap-4">
                <span className="h-px w-12 bg-line" />
                <h2 className="text-2xl font-light tracking-[0.28em] text-ink">破壁行动</h2>
              </div>

              <p className="mt-7 max-w-[520px] text-[13px] leading-[1.9] text-secondary">
                星河大学第十二届校园科技文化节开幕前，活动平台出现了一组无法同时成立的时间与来源。
                实验室邀请你以授权红队身份，进入隔离镜像调查裂缝。然后，权限会被收回。
              </p>

              <div className="mt-8 border-l border-primary/40 pl-4">
                <p className="text-[13px] leading-relaxed text-ink/90">
                  「信任不是被攻破的，是被一点点交付出去的。」
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                  —— Project Phantom 演练手册
                </p>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-primary/70" /> 虚构校园 · 隔离环境
                </span>
                <span className="flex items-center gap-2">
                  <Fingerprint size={13} className="text-primary/70" /> 双阶段身份反转
                </span>
                <span>约 10–15 分钟</span>
                <span>单人叙事模拟</span>
              </div>

              <div className="mt-9 hidden items-center gap-3 md:flex">
                {['INVESTIGATE', 'REVERSAL', 'DEFEND', 'REFLECT'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span
                      className={cn(
                        'font-mono text-[9px] tracking-[0.18em]',
                        index === 0 ? 'text-primary' : 'text-muted',
                      )}
                    >
                      0{index + 1} {step}
                    </span>
                    {index < 3 && <span className="h-px w-5 bg-line/80" />}
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
              className="w-full max-w-[440px] justify-self-end"
            >
              <div className="corner-frame border border-line bg-surface/75 shadow-panel">
                <div className="flex items-center justify-between border-b border-line/80 px-4 py-3">
                  <div>
                    <p className="eyebrow">access portal</p>
                    <p className="mt-1 text-xs text-ink">接入入口</p>
                  </div>
                  <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.14em] text-primary/85">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    READY
                  </span>
                </div>

                <div className="space-y-2 p-3">
                  <PortalAction
                    index="01"
                    icon={Play}
                    title="开始新演练"
                    en="START"
                    description="创建虚构身份，进入 PHANTOM OS 调查界面。"
                    onClick={handleStart}
                    primary
                  />
                  <PortalAction
                    index="02"
                    icon={RotateCcw}
                    title="继续上次演练"
                    en="CONTINUE"
                    description={
                      saveMeta
                        ? `${saveMeta.callsign} · ${formatSaveTime(saveMeta.updatedAt)} · 已归档 ${saveMeta.evidenceCount} 份材料`
                        : '本地未发现可恢复的演练存档。'
                    }
                    hint="暂无存档。完成身份装配后会自动建立本地存档。"
                    disabled={!hasPlayer}
                    onClick={handleContinue}
                  />
                  <PortalAction
                    index="03"
                    icon={BookOpen}
                    title="演练说明"
                    en="BRIEFING"
                    description="阅读虚构边界、行动点规则与操作目标。"
                    onClick={() => openModal('briefing')}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-line/80 bg-surface-2/50 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  <span>BUILD · TRUST_FRACTURE</span>
                  <span className="text-secondary/70">P1 / UI BASE</span>
                </div>
              </div>

              <p className="mt-4 text-center text-[10px] leading-relaxed text-muted">
                无需配置模型 API 也可完整体验演练流程。
                <br />
                你的选择只会写入此浏览器中的本地存档。
              </p>
            </motion.section>
          </div>

          <footer className="flex flex-col gap-2 border-t border-line/50 py-4 text-[10px] leading-relaxed text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>{GAME_META.fictiveNotice} 不引导输入任何真实个人资料或凭据。</p>
            <p className="font-mono uppercase tracking-[0.16em]">
              HACK4GOOD 2026 · 技术向善赛道 · {GAME_META.version}
            </p>
          </footer>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 border-b border-l border-line/30" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 border-r border-t border-line/30" />
      </main>

      <AnimatePresence>
        {confirmNew && (
          <ModalShell
            eyebrow="overwrite save"
            title="开始新的演练？"
            width="max-w-lg"
            onClose={() => setConfirmNew(false)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setConfirmNew(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setConfirmNew(false);
                    goToIdentity();
                  }}
                >
                  新建身份
                </Button>
              </>
            }
          >
            <p className="text-[12px] leading-relaxed text-secondary">
              检测到一份本地演练存档：
              <span className="text-ink">「{player?.callsign}」</span>
              {saveMeta ? `，最后记录于 ${formatSaveTime(saveMeta.updatedAt)}` : ''}。
              <br />
              新的身份装配完成后，这份存档会被覆盖。旧存档不会自动备份。
            </p>
          </ModalShell>
        )}
      </AnimatePresence>
    </>
  );
}
