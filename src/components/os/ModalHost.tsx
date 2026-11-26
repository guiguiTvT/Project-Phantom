import { AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { Button } from '@/components/ui/Button';
import { ModalShell } from '@/components/ui/Modal';
import { InlineTag } from '@/components/ui/WorkspaceHeader';
import {
  COLLEGES,
  DEMO_NOTICES,
  GAME_META,
  NPC_MOOD_META,
  PHASE_META,
  SAVE_KEY,
} from '@/data/gameConfig';
import { NPCS, NPC_BY_ID } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import { formatSaveTime, formatStamp, worldBand } from '@/utils/format';
import type { WorldState } from '@/types';

function BriefingModal() {
  const closeModal = useUiStore((state) => state.closeModal);

  return (
    <ModalShell
      eyebrow="briefing / field manual"
      title="演练说明"
      width="max-w-3xl"
      onClose={closeModal}
      footer={
        <>
          <span className="mr-auto font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
            {GAME_META.version} · phase 1 build
          </span>
          <Button variant="primary" onClick={closeModal}>
            我已了解
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <section>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/75">01 / premise</p>
          <p className="mt-2 text-[12px] leading-[1.9] text-secondary">
            星河大学科技文化节开幕前，活动平台的公开信息出现互相冲突的时间与来源。校园网络安全实验室邀请你
            以授权红队身份进入隔离镜像，调查「信任裂缝」。随后，你的观察权限会被收回，你将以普通学生身份
            面对前半段行为留下的世界状态。
          </p>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="border border-line/60 bg-surface-2/40 p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-primary">ACT I · PHANTOM</p>
            <p className="mt-2 text-[11px] leading-relaxed text-secondary/90">
              浏览动态、归档材料、查看档案与关系图、核验时间线。红队阶段初始行动点 12。
              风险模拟舱将在 Phase 2 开放。
            </p>
          </div>
          <div className="border border-line/60 bg-surface-2/40 p-4">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-warning">ACT II · STUDENT</p>
            <p className="mt-2 text-[11px] leading-relaxed text-secondary/90">
              完成至少 2 次有效风险验证并主动结束，或耗尽行动点后触发反转。防御阶段初始行动点 10，
              需要在多个同时发生的校园事务中分配资源。
            </p>
          </div>
        </div>

        <section>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/75">02 / action points</p>
          <div className="mt-2 border border-line/60">
            {[
              ['浏览公开信息 / 整理证据', '0 AP'],
              ['向 NPC 发起有效调查', '1 AP'],
              ['独立核验信息', '1 AP'],
              ['执行风险模拟', '2 AP'],
              ['提交阶段性报告', '1 AP'],
              ['防御协调行动', '1–2 AP'],
            ].map(([label, cost]) => (
              <div key={label} className="flex items-center justify-between border-b border-line/40 px-3 py-2 last:border-b-0">
                <span className="text-[10px] text-secondary">{label}</span>
                <span className="font-mono text-[10px] text-primary/80">{cost}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-relaxed text-muted">
            行动点由规则引擎扣除，模型无权修改。不足时仍可浏览信息、查看日志并进入下一阶段。
          </p>
        </section>

        <section>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-primary/75">03 / phantom type</p>
          <p className="mt-2 text-[11px] leading-[1.9] text-secondary">
            结算时，系统依据你在本局中的真实行为日志，给出四维行为倾向与一种 Phantom Type
            （共 16 种）。过程中不会显示你正在获得哪种人格属性，也没有额外问卷。
            这是游戏行为画像，不是经过心理学验证的人格测评，四种类型之间没有等级高低。
          </p>
        </section>

        <section className="border border-warning/30 bg-warning/[0.04] p-4">
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-warning">04 / boundaries</p>
          <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-secondary/90">
            <li>所有校园、人物、账号与权限均为虚构，不连接真实校园系统或社交账号。</li>
            <li>演练不会要求你输入任何真实个人资料、密码或验证码。</li>
            <li>红队内容仅用于隔离环境中的抽象风险推演，不提供现实可用的诈骗、冒充或凭据操作。</li>
            <li>分享卡片不会包含聊天内容、真实身份、敏感数据或 API 配置。</li>
          </ul>
        </section>

        <section className="border border-line/60 bg-surface-2/40 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-muted">build status</span>
            <InlineTag tone="primary">P1 live</InlineTag>
            <InlineTag tone="warning">P2 simulation</InlineTag>
            <InlineTag tone="warning">P3 dialogue</InlineTag>
            <InlineTag tone="warning">P4 reversal</InlineTag>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted">
            当前构建已完成启动页、身份装配、动态墙、证据归档、关系图与本地存档。带阶段标识的模块会展示
            明确的未启用状态，不提供虚假操作。
          </p>
        </section>
      </div>
    </ModalShell>
  );
}

function DossierModal() {
  const npcId = useUiStore((state) => state.dossierNpcId);
  const closeModal = useUiStore((state) => state.closeModal);
  const player = useGameStore((state) => state.player);
  const phase = useGameStore((state) => state.phase);
  const actionPoints = useGameStore((state) => state.actionPoints);
  const maxActionPoints = useGameStore((state) => state.maxActionPoints);
  const evidenceCount = useGameStore((state) => state.collectedEvidenceIds.length);
  const logCount = useGameStore((state) => state.log.length);
  const startedAt = useGameStore((state) => state.startedAt);
  const updatedAt = useGameStore((state) => state.updatedAt);

  const npc = npcId ? NPC_BY_ID[npcId] : null;

  if (!npc) {
    const college = COLLEGES.find((item) => item.id === player?.college);
    return (
      <ModalShell
        eyebrow="operator dossier"
        title={player ? `操作员 · ${player.callsign}` : '未知操作员'}
        width="max-w-xl"
        onClose={closeModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              关闭
            </Button>
            <Button variant="primary" onClick={() => useUiStore.getState().openModal('return-title')}>
              返回标题
            </Button>
          </>
        }
      >
        {player ? (
          <div>
            <div className="flex items-start gap-4">
              <SigilAvatar avatarId={player.avatarId} size={64} />
              <div className="min-w-0">
                <p className="text-xl font-light tracking-[0.08em] text-ink">{player.callsign}</p>
                <p className="mt-1 text-[11px] text-secondary">
                  {college?.name ?? player.college} · {college?.en ?? ''}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {player.interests.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="data-row">
                <span className="text-[10px] text-muted">授权</span>
                <span className="text-[10px] text-secondary">{player.clearance}</span>
              </div>
              <div className="data-row">
                <span className="text-[10px] text-muted">当前阶段</span>
                <span className="font-mono text-[10px] text-primary">
                  {PHASE_META[phase].label} · {PHASE_META[phase].sub}
                </span>
              </div>
              <div className="data-row">
                <span className="text-[10px] text-muted">行动点</span>
                <span className="font-mono text-[10px] text-primary">
                  {actionPoints} / {maxActionPoints}
                </span>
              </div>
              <div className="data-row">
                <span className="text-[10px] text-muted">证据 / 日志</span>
                <span className="font-mono text-[10px] text-secondary">
                  {evidenceCount} / {logCount}
                </span>
              </div>
              <div className="data-row">
                <span className="text-[10px] text-muted">开始时间</span>
                <span className="font-mono text-[10px] text-secondary">{formatSaveTime(startedAt)}</span>
              </div>
              <div className="data-row border-b-0">
                <span className="text-[10px] text-muted">最后写入</span>
                <span className="font-mono text-[10px] text-secondary">{formatSaveTime(updatedAt)}</span>
              </div>
            </div>

            <p className="mt-4 border border-line/50 bg-surface-2/40 px-3 py-2.5 text-[9px] leading-relaxed text-muted">
              此身份完全由虚构预设生成，不包含真实姓名、学号或联系方式。存档写入本地存储键
              <span className="font-mono text-secondary/80"> {SAVE_KEY}</span>。
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-secondary">未找到操作员身份。</p>
        )}
      </ModalShell>
    );
  }

  const mood = NPC_MOOD_META[npc.currentMood];

  return (
    <ModalShell
      eyebrow={`contact dossier / ${npc.id}`}
      title={`${npc.name} · ${npc.codename}`}
      width="max-w-2xl"
      onClose={closeModal}
      footer={
        <>
          <span className="mr-auto flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            <MessageSquare size={11} className="text-primary/60" />
            自由对话将在 Phase 3 接通
          </span>
          <Button variant="ghost" onClick={closeModal}>
            关闭档案
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-start gap-4">
        <SigilAvatar avatarId={npc.avatarId} size={64} name={npc.name} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-ink">{npc.role}</p>
          <p className="mt-0.5 text-[10px] text-secondary">{npc.org}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 border border-line/70 px-1.5 py-0.5 font-mono text-[8px] text-secondary">
              <span
                className={cn(
                  'h-1 w-1 rounded-full',
                  mood.tone === 'primary'
                    ? 'bg-primary'
                    : mood.tone === 'warning'
                      ? 'bg-warning'
                      : mood.tone === 'danger'
                        ? 'bg-danger'
                        : 'bg-secondary',
                )}
              />
              当前情绪 · {mood.label}
            </span>
            {npc.personality.map((trait) => (
              <span key={trait} className="tag">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 border-l border-primary/30 pl-3 text-[11px] leading-[1.9] text-secondary/90">
        {npc.bio}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="border border-line/60 bg-surface-2/40 p-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">当前任务</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-secondary/90">{npc.currentTask}</p>
        </div>
        <div className="border border-line/60 bg-surface-2/40 p-3">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">表达风格</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-secondary/90">{npc.voice}</p>
        </div>
      </div>

      <section className="mt-4">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
          权限内已知信息 · {npc.knownFacts.length}
        </p>
        <div className="mt-2 space-y-1.5">
          {npc.knownFacts.map((fact, index) => (
            <div key={fact} className="flex gap-2.5 border border-line/40 bg-surface/30 px-3 py-2">
              <span className="font-mono text-[8px] text-primary/60">{String(index + 1).padStart(2, '0')}</span>
              <p className="text-[10px] leading-relaxed text-secondary/90">{fact}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-muted">
          以上内容是该角色在其权限范围内可以谈论的事实。NPC 不会编造新的关键事实，也不能修改游戏状态。
        </p>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">可谈论范围</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {npc.permissions.map((permission) => (
              <span key={permission} className="tag">
                {permission}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">关系</p>
          <div className="mt-1.5 space-y-1">
            {npc.relationships.map((relation) => (
              <div key={relation.npcId} className="flex items-center justify-between border-b border-line/30 py-0.5">
                <span className="text-[10px] text-secondary">{NPC_BY_ID[relation.npcId]?.name}</span>
                <span className="font-mono text-[8px] text-muted">{relation.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-muted/60">
        conversation history · {npc.conversationHistory.length} entries / memory · 本次演练待写入
      </p>
    </ModalShell>
  );
}

function LogModal() {
  const log = useGameStore((state) => state.log);
  const closeModal = useUiStore((state) => state.closeModal);
  const entries = [...log].reverse();

  return (
    <ModalShell
      eyebrow="system log"
      title="系统日志"
      width="max-w-2xl"
      onClose={closeModal}
      footer={
        <>
          <span className="mr-auto font-mono text-[8px] uppercase tracking-[0.12em] text-muted">
            engine-written · {log.length} entries
          </span>
          <Button variant="primary" onClick={closeModal}>
            关闭
          </Button>
        </>
      }
    >
      {entries.length === 0 ? (
        <p className="py-8 text-center text-[11px] text-muted">尚无日志。</p>
      ) : (
        <div>
          {entries.map((entry) => (
            <div key={entry.id} className="flex gap-3 border-b border-line/40 py-2.5 last:border-b-0">
              <div className="w-16 shrink-0">
                <p className="font-mono text-[8px] tabular-nums text-muted">{formatStamp(entry.at)}</p>
                <p className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-muted/60">
                  T{entry.turn}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-ink/90">{entry.actionLabel}</span>
                  {entry.apDelta !== 0 && (
                    <span className="font-mono text-[8px] text-warning">AP {entry.apDelta}</span>
                  )}
                  {entry.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="font-mono text-[7px] text-muted">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="mt-0.5 text-[10px] leading-relaxed text-secondary/80">{entry.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-[9px] leading-relaxed text-muted">
        日志由确定性规则引擎写入，AI NPC 无权修改。结算时的行为依据只会引用这里的真实记录。
      </p>
    </ModalShell>
  );
}

function ReturnTitleModal() {
  const closeModal = useUiStore((state) => state.closeModal);
  const pushToast = useUiStore((state) => state.pushToast);
  const backToBoot = useGameStore((state) => state.backToBoot);
  const updatedAt = useGameStore((state) => state.updatedAt);
  const hasPlayer = useGameStore((state) => Boolean(state.player));

  return (
    <ModalShell
      eyebrow="session control"
      title="返回标题页？"
      width="max-w-md"
      onClose={closeModal}
      footer={
        <>
          <Button variant="ghost" onClick={closeModal}>
            继续演练
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (hasPlayer) {
                pushToast({
                  title: '进度已自动保存',
                  description: '可从标题页选择「继续上次演练」。',
                  tone: 'success',
                });
              }
              backToBoot();
              closeModal();
            }}
          >
            返回标题
          </Button>
        </>
      }
    >
      <p className="text-[11px] leading-[1.9] text-secondary">
        返回标题不会清除当前存档。世界状态、证据库、日志与人格累计值会保留在本地。
      </p>
      <div className="mt-3 border border-line/60 bg-surface-2/40 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted">最后写入</span>
          <span className="font-mono text-[10px] text-secondary">{formatSaveTime(updatedAt)}</span>
        </div>
      </div>
    </ModalShell>
  );
}

function ContactsModal() {
  const closeModal = useUiStore((state) => state.closeModal);
  const openDossier = useUiStore((state) => state.openDossier);
  const openModal = useUiStore((state) => state.openModal);
  const world = useGameStore((state) => state.world);
  const keys: (keyof WorldState)[] = ['security', 'operation', 'relations', 'repair'];

  return (
    <ModalShell
      eyebrow="contacts & notices"
      title="通讯录与通知"
      width="max-w-lg"
      onClose={closeModal}
      footer={
        <>
          <Button variant="ghost" onClick={() => openModal('log')}>
            系统日志
          </Button>
          <Button variant="primary" onClick={closeModal}>
            关闭
          </Button>
        </>
      }
    >
      <div>
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">contacts</p>
        <div className="mt-2 space-y-1">
          {NPCS.map((npc) => {
            const mood = NPC_MOOD_META[npc.currentMood];
            return (
              <button
                key={npc.id}
                type="button"
                onClick={() => openDossier(npc.id)}
                className="flex w-full items-center gap-3 border border-line/50 bg-surface/30 px-3 py-2 text-left transition-colors hover:border-primary/35"
              >
                <SigilAvatar avatarId={npc.avatarId} size={30} name={npc.name} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] text-ink">{npc.name}</span>
                  <span className="block truncate text-[9px] text-muted">{npc.role}</span>
                </span>
                <span className="font-mono text-[8px] text-secondary">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">notices</p>
        <div className="mt-2 space-y-1.5">
          {DEMO_NOTICES.map((notice) => (
            <div key={notice.id} className="border border-line/50 bg-surface/30 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ink/90">{notice.title}</span>
                <span className="font-mono text-[8px] text-muted">{notice.at}</span>
              </div>
              <p className="mt-1 text-[9px] leading-relaxed text-secondary/80">{notice.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">campus status</p>
        <div className="mt-2 grid grid-cols-2 gap-px border border-line/50 bg-line/30">
          {keys.map((key) => {
            const band = worldBand(key, world[key]);
            return (
              <div key={key} className="bg-surface-2/70 px-3 py-2">
                <p className="text-[9px] text-muted">{band.label}</p>
                <p className="mt-0.5 text-[10px] text-ink/90">{band.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

export default function ModalHost() {
  const modal = useUiStore((state) => state.modal);

  return (
    <AnimatePresence>
      {modal === 'briefing' && <BriefingModal key="briefing" />}
      {modal === 'dossier' && <DossierModal key="dossier" />}
      {modal === 'log' && <LogModal key="log" />}
      {modal === 'return-title' && <ReturnTitleModal key="return-title" />}
      {modal === 'contacts' && <ContactsModal key="contacts" />}
    </AnimatePresence>
  );
}
