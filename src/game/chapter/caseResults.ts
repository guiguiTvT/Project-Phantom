import { PERSONALITY_BY_CODE } from '@/data/personalities';
import type { PersonalityCode } from '@/types/personality';
import { DECISIONS, RISKS, type EndingId, type RiskId } from './caseFile';
import type { CaseEvent, CaseState } from './caseEngine';
import type { CauseId } from '../../../functions/shared/chapterAi';

export interface Cause {
  id: CauseId;
  text: string;
  events: CaseEvent[];
}

export function explainEnding(state: CaseState, ending: EndingId): string {
  const { pending, paused, policy, rosterAt } = state.world;
  const resolved = rosterAt ? `你们在 ${rosterAt} 核对了本届名单，三条风险的后续发生途径均已阻断。` : '';
  switch (ending) {
    case 'ending_dawn': return `${resolved} 陈老师和许言接手后续协作，顾老师已落实长期管理规则。`;
    case 'ending_rebuild': return `${resolved} 正式复核补齐了管理规则，后续配合由现行流程接手。`;
    case 'ending_consensus': return `${resolved} 本次依靠已有证据和人物协作完成，长期规则仍需跟进。`;
    case 'ending_isolation': return `结束时报名仍全面暂停，正常报名和名单交付都有待恢复。${pending.length ? `底层还有 ${pending.length} 项风险待处理。` : `三条风险均已阻断，${policy ? '制度已落实。' : '等待安排恢复。'}`}`;
    case 'ending_domino': return `校园渠道仍开放，有 ${pending.length} 项风险待处理。全体提醒尚未发布，群外同学可能继续收到这些入口。`;
    case 'ending_unresolved': return pending.length ? `仍有 ${pending.length} 项风险留在待处理清单。${paused ? '报名暂时暂停。' : '官方入口开放，本届名单仍待确认。'}` : '本次风险已被阻断。请查看回执，确认后续由谁接手。';
  }
}

function riskNames(ids: RiskId[]): string { return ids.map((id) => RISKS[id].name).join('、'); }

export function buildCauses(state: CaseState): Cause[] {
  const receipts = state.receipts;
  const causes: Cause[] = [];
  const receiptEvent = (id: string) => state.events.find((event) => event.receipt === id);
  const add = (id: CauseId, text: string, events: (CaseEvent | undefined)[]) => {
    const records = events.filter((event): event is CaseEvent => Boolean(event));
    if (records.length) causes.push({ id, text, events: records });
  };

  const targeted = receipts.find((receipt) => receipt.id === 'R1-B');
  if (targeted) {
    const verified = targeted.blocked.includes('H1') ? state.events.find((event) => event.contact === 'chen') : undefined;
    const tests = state.events.filter((event) => event.risk && targeted.blocked.includes(event.risk) && event.status === 'confirmed');
    const identity = verified ? `${verified.preset ? '演示记录' : '你'}通过通讯录独立核实了教师身份。` : '';
    add('targeted', `${identity}顾老师依据已确认的调查记录定向处理了${riskNames(targeted.blocked)}，当时官方入口仍开放。`, [verified, ...tests, receiptEvent(targeted.id)]);
  }

  const notify = receipts.find((receipt) => receipt.round === 2);
  if (notify?.option === 'B') add('notify', state.world.coverage === 'records'
    ? '你向顾老师核实了影响范围，定向通知覆盖到相关报名记录。陈老师和许言接手后续核对。'
    : '陈老师和许言接手通知与核对，活动群已收到提醒。群外转发仍需跟进。',
  [state.events.find((event) => event.contact === 'gu'), receiptEvent(notify.id)]);
  if (notify?.option === 'A') add('notify', '你申请发布全体提醒，顾老师发布公告，许言集中接到报名咨询。', [receiptEvent(notify.id)]);

  const repair = receipts.find((receipt) => receipt.round === 3);
  if (repair?.option === 'A') add('formal', '你提交正式事件单。顾老师 13:00 完成复核并落实规则，12:00 的志愿者分组需要另行安排。', [state.events.find((event) => event.kind === 'accepted'), receiptEvent(repair.id)]);
  if (repair?.option === 'B') add('cooperate', repair.blocked.includes('H3')
    ? '你选择协作修复，许言撤下旧表单并安排补登记。顾老师在已有调查依据上处理其他项目。'
    : '你选择协作修复，许言确认旧表单已经撤下并安排补登记。长期制度调整留到后续。', [receiptEvent(repair.id)]);

  const fourth = receipts.find((receipt) => receipt.round === 4);
  if (state.world.paused) add('paused', '最终回执保留全面暂停。暂停隔离新增访问，正常报名和名单交付也暂缓。', [fourth && receiptEvent(fourth.id)]);
  else if (state.world.pending.length) add('pending', `${riskNames(state.world.pending)}仍待处理。恢复轮维持了现有渠道，名单尚未交付。`, [repair && receiptEvent(repair.id), fourth && receiptEvent(fourth.id)]);
  else if (state.world.rosterAt) add('roster', `你按复核结果处理官方报名。顾老师在 ${state.world.rosterAt} 核对并交付了本届名单。`, [fourth && receiptEvent(fourth.id)]);

  const priority: CauseId[] = ['targeted', 'formal', 'cooperate', 'paused', 'pending', 'roster', 'notify'];
  return causes.sort((left, right) => priority.indexOf(left.id) - priority.indexOf(right.id));
}

const DIMENSIONS = [
  { name: '信息处理', left: 'E', right: 'I', labels: ['先核实', '先推断'] },
  { name: '行动节奏', left: 'C', right: 'A', labels: ['先控制再推进', '在依据上推进'] },
  { name: '优先目标', left: 'P', right: 'F', labels: ['先减少暴露', '先维持运行'] },
  { name: '处理方式', left: 'S', right: 'R', labels: ['依靠正式规则', '依靠人物协作'] },
] as const;

const OPTION_SIGNALS: Record<string, string> = {
  'R1-A': 'CP', 'R1-B': 'AF', 'R1-C': 'C',
  'R2-A': 'PS', 'R2-B': 'FR',
  'R3-A': 'CS', 'R3-B': 'AR', 'R3-C': 'C',
  'R4-A': 'AF', 'R4-B': 'CP',
};

export function actionStyle(state: CaseState) {
  const observations: Array<{ signals: string; title: string; event: CaseEvent }> = [];
  for (const event of state.events) {
    if (event.preset) continue;
    if (event.kind === 'verify' || event.kind === 'simulate') {
      const signals = event.kind === 'verify' || event.status === 'confirmed' ? 'E' : 'I';
      observations.push({ signals, title: event.title, event });
    }
    if (event.receipt) {
      const receipt = state.receipts.find((item) => item.id === event.receipt);
      const signals = OPTION_SIGNALS[event.receipt];
      if (receipt && signals) {
        const option = DECISIONS[receipt.round].options.find((item) => item.id === receipt.option);
        if (option) observations.push({ signals, title: option.title, event });
      }
    }
  }
  const dimensions = DIMENSIONS.map(({ name, left, right, labels }) => {
    const a = observations.filter((item) => item.signals.includes(left));
    const b = observations.filter((item) => item.signals.includes(right));
    const total = a.length + b.length;
    const letter = total < 2 || a.length === b.length ? '' : a.length > b.length ? left : right;
    return { name, letter, label: total < 2 ? '依据不足' : a.length === b.length ? '混合倾向' : labels[letter === left ? 0 : 1],
      evidence: [...a, ...b].map((item) => item.title) };
  });
  const combined = dimensions.map((item) => item.letter).join('');
  const code = combined.length === 4 ? combined as PersonalityCode : undefined;
  return { dimensions, code, name: code ? PERSONALITY_BY_CODE[code].nameCn : '行动记录', observations };
}
