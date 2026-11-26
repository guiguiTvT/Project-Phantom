import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dices,
  Lock,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PhantomMark } from '@/components/boot/PhantomMark';
import { Button } from '@/components/ui/Button';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import {
  AVATAR_IDS,
  CALLSIGNS,
  CLEARANCE_LABEL,
  COLLEGES,
  GAME_META,
  INITIAL_AP_REDTEAM,
  INTEREST_TAGS,
} from '@/data/gameConfig';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { CollegeId } from '@/types';
import { cn } from '@/utils/cn';

function SectionTitle({ index, en, title }: { index: string; en: string; title: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3">
      <span className="font-mono text-[9px] tracking-widest text-primary/75">{index}</span>
      <h2 className="text-sm font-medium tracking-wide text-ink">{title}</h2>
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">{en}</span>
    </div>
  );
}

function Barcode() {
  const widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 2, 1, 3, 1, 2];
  let offset = 0;
  return (
    <svg viewBox="0 0 120 24" className="h-6 w-full text-secondary/50" aria-hidden="true">
      {widths.map((width, index) => {
        const x = offset;
        offset += width + 2.5;
        return <rect key={index} x={x} y={0} width={width} height={24} fill="currentColor" opacity={index % 3 === 0 ? 0.85 : 0.35} />;
      })}
    </svg>
  );
}

export default function IdentityPage() {
  const [callsign, setCallsign] = useState(CALLSIGNS[1]);
  const [avatarId, setAvatarId] = useState(AVATAR_IDS[2]);
  const [college, setCollege] = useState<CollegeId>(COLLEGES[0].id);
  const [interests, setInterests] = useState<string[]>([INTEREST_TAGS[3], INTEREST_TAGS[1]]);

  const goToBoot = useGameStore((state) => state.backToBoot);
  const startGame = useGameStore((state) => state.startGame);
  const resetUi = useUiStore((state) => state.resetUi);
  const pushToast = useUiStore((state) => state.pushToast);

  const selectedCollege = COLLEGES.find((item) => item.id === college) ?? COLLEGES[0];
  const valid = Boolean(callsign && avatarId && college && interests.length > 0);

  const toggleInterest = (tag: string) => {
    setInterests((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= 3) return current;
      return [...current, tag];
    });
  };

  const randomize = () => {
    const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
    setCallsign(pick(CALLSIGNS));
    setAvatarId(pick(AVATAR_IDS));
    setCollege(pick(COLLEGES).id);
    const shuffled = [...INTEREST_TAGS].sort(() => Math.random() - 0.5).slice(0, 2);
    setInterests(shuffled);
  };

  const handleStart = () => {
    if (!valid) return;
    startGame({
      callsign,
      avatarId,
      college,
      interests,
      clearance: CLEARANCE_LABEL,
    });
    resetUi();
    pushToast({
      title: '身份装配完成',
      description: 'PHANTOM OS 已挂载。红队行动点：12。',
      tone: 'success',
    });
  };

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line/70 bg-background/85 px-5 py-3 backdrop-blur-sm lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={goToBoot}
            className="flex items-center gap-2 border border-transparent px-1 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-secondary transition-colors hover:text-ink"
          >
            <ArrowLeft size={14} />
            返回标题
          </button>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <PhantomMark size={20} className="text-primary" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-secondary">IDENTITY FORGE</span>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {[
            { index: '01', label: '身份装配', active: true },
            { index: '02', label: '环境接入', active: false },
            { index: '03', label: '演练开始', active: false },
          ].map((step, index) => (
            <div key={step.index} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex items-center gap-2 font-mono text-[9px] tracking-[0.14em]',
                  step.active ? 'text-primary' : 'text-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center border text-[8px]',
                    step.active ? 'border-primary/60 bg-primary/10' : 'border-line',
                  )}
                >
                  {step.index}
                </span>
                {step.label}
              </span>
              {index < 2 && <span className="h-px w-6 bg-line/70" />}
            </div>
          ))}
        </div>

        <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          <Lock size={11} className="text-primary/70" />
          LOCAL ONLY
        </span>
      </header>

      <main className="mx-auto grid w-full max-w-[1280px] flex-1 grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="min-w-0"
        >
          <div className="mb-7">
            <p className="eyebrow text-primary/80">step 01 / identity forge</p>
            <h1 className="mt-2 text-2xl font-light tracking-[0.06em] text-ink">装配你的虚拟身份</h1>
            <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-secondary">
              本次演练不收集任何真实姓名、学号、联系方式或照片。以下内容全部来自虚构预设，
              只在本浏览器中生效。
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-end justify-between">
                <SectionTitle index="A" en="callsign" title="代号" />
                <button
                  type="button"
                  onClick={randomize}
                  className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-primary"
                >
                  <Dices size={12} />
                  随机装配
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {CALLSIGNS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCallsign(item)}
                    className={cn(
                      'border px-4 py-2 text-[12px] tracking-[0.08em] transition-colors',
                      callsign === item
                        ? 'border-primary/60 bg-primary/10 text-primary'
                        : 'border-line/80 bg-surface-2/40 text-secondary hover:border-secondary/50 hover:text-ink',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle index="B" en="sigil" title="身份符印" />
              <div className="flex flex-wrap gap-2">
                {AVATAR_IDS.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatarId(item)}
                    aria-label={`选择符印 ${index + 1}`}
                    className={cn(
                      'relative border p-1 transition-colors',
                      avatarId === item
                        ? 'border-primary/70 bg-primary/[0.07]'
                        : 'border-line/80 hover:border-secondary/50',
                    )}
                  >
                    <SigilAvatar avatarId={item} size={52} />
                    {avatarId === item && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center bg-primary text-background">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted">
                几何符印为原创矢量图形，不代表任何真实人物或面部特征。
              </p>
            </section>

            <section>
              <SectionTitle index="C" en="college" title="学院" />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {COLLEGES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCollege(item.id)}
                    className={cn(
                      'flex items-start gap-3 border px-3.5 py-3 text-left transition-colors',
                      college === item.id
                        ? 'border-primary/55 bg-primary/[0.06]'
                        : 'border-line/80 bg-surface-2/30 hover:border-secondary/45',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-[13px]',
                        college === item.id
                          ? 'border-primary/50 text-primary'
                          : 'border-line text-secondary',
                      )}
                    >
                      {item.glyph}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            'text-[12px]',
                            college === item.id ? 'text-primary' : 'text-ink',
                          )}
                        >
                          {item.name}
                        </span>
                        <span className="font-mono text-[8px] tracking-[0.12em] text-muted">
                          {item.en}
                        </span>
                      </span>
                      <span className="mt-1 block text-[10px] leading-relaxed text-secondary/80">
                        {item.hint}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between">
                <SectionTitle index="D" en="interests" title="兴趣标签" />
                <span className="mb-3 font-mono text-[9px] tracking-[0.1em] text-muted">
                  {interests.length}/3
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map((tag) => {
                  const active = interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={cn(
                        'border px-3 py-1.5 text-[11px] transition-colors',
                        active
                          ? 'border-secondary/70 bg-secondary/10 text-ink'
                          : 'border-line/70 text-secondary hover:border-secondary/40 hover:text-ink',
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] text-muted">
                标签会出现在你的虚拟档案与后续人物关系中，不影响行动点。
              </p>
            </section>

            <div className="flex items-start gap-3 border border-line/70 bg-surface-2/40 px-4 py-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary/80" />
              <p className="text-[10px] leading-relaxed text-secondary/90">
                红队授权仅作用于本次虚构演练的隔离镜像。你无法访问真实校园系统，
                也不会被要求提供真实密码、验证码或身份信息。
              </p>
            </div>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="min-w-0 lg:sticky lg:top-20 lg:self-start"
        >
          <div className="corner-frame border border-line bg-surface/75 shadow-panel">
            <div className="flex items-center justify-between border-b border-line/80 px-4 py-3">
              <span className="eyebrow">phantom access id</span>
              <span className="font-mono text-[9px] tracking-[0.16em] text-muted">RT-07 / ISSUED</span>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="border border-line/80 p-1">
                  <SigilAvatar avatarId={avatarId} size={78} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">callsign</p>
                  <p className="mt-1 text-2xl font-light tracking-[0.12em] text-ink">{callsign}</p>
                  <p className="mt-1 text-[11px] text-secondary">{selectedCollege.name}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">
                    {selectedCollege.en}
                  </p>
                </div>
                <Sparkles size={14} className="mt-1 shrink-0 text-primary/60" />
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {interests.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
                {interests.length === 0 && (
                  <span className="tag text-muted/70">尚未选择兴趣标签</span>
                )}
              </div>

              <div className="mt-5 border-t border-line/60 pt-4">
                <div className="data-row">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                    授权范围
                  </span>
                  <span className="text-right text-[10px] text-secondary">{CLEARANCE_LABEL}</span>
                </div>
                <div className="data-row">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                    初始行动点
                  </span>
                  <span className="font-mono text-[12px] text-primary">{INITIAL_AP_REDTEAM} AP</span>
                </div>
                <div className="data-row">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                    世界状态
                  </span>
                  <span className="text-[10px] text-secondary">共享 · 反转后保留</span>
                </div>
                <div className="data-row border-b-0">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                    存档位置
                  </span>
                  <span className="text-[10px] text-secondary">本地浏览器</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <Barcode />
                <ScanLine size={16} className="shrink-0 text-secondary/60" />
              </div>
            </div>

            <div className="border-t border-line/80 p-4">
              <Button
                variant="primary"
                className="w-full"
                disabled={!valid}
                onClick={handleStart}
                leading={<Sparkles size={14} />}
                trailing={<ArrowRight size={14} />}
              >
                接入 PHANTOM OS
              </Button>
              <p className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-muted">
                visual id · fictional · not a real credential
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] text-muted">
            <button
              type="button"
              onClick={goToBoot}
              className="transition-colors hover:text-ink"
            >
              ‹ 放弃装配，返回标题
            </button>
            <span className="font-mono tracking-[0.12em]">{GAME_META.version}</span>
          </div>
        </motion.aside>
      </main>
    </div>
  );
}
