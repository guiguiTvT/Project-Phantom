import type { ReviewId } from '../../../functions/shared/campaignReview';
import { CAMPAIGN_CASES } from './cases';
import { endingFor, type Campaign } from './engine';
import { CASE_IDS } from './types';

export const STORY_SPREAD = {
  festival: '交接时，另一位同学把尚未更正的错误报名推荐转到了新群。',
  job: '交接时，有新同学从仍在流传的招募信息提交了材料。',
  voice: '收尾时，周宁报告也收到了同样的冒名消息。',
} as const;

export function reviewRecords(run: Campaign) {
  const records: { id: ReviewId; title: string; text: string }[] = [];
  for (const id of CASE_IDS) {
    const { world } = run.cases[id];
    const { title, result } = CAMPAIGN_CASES[id];
    const status = world.fixed ? 'fixed' : world.safe ? 'isolated' : 'pending';
    records.push({ id: `${id}-${status}`, title, text: world.fixed ? result.repaired : world.safe ? result.isolated : result.pending });
    if (world.normal) records.push({ id: `${id}-normal`, title: '可信路径', text: result.normal });
    if (world.cooperation) {
      const receipt = world.receipts.find((item) => item.id.endsWith('协作'));
      records.push({ id: `${id}-cooperation`, title: '有人接手', text: receipt?.text ?? result.cooperation });
    }
    if (id !== 'camera' && run.spread.includes(id)) records.push({ id: `${id}-spread`, title: '实际新增影响', text: STORY_SPREAD[id] });
  }
  if (run.rule) records.push({ id: 'rule', title: '新规则生效', text: run.rule.receipt.text });
  const priority = {
    ending_domino: ['spread', 'pending'],
    ending_isolation: ['isolated', 'fixed'],
    ending_dawn: ['fixed', 'normal'],
    ending_rebuild: ['rule', 'fixed'],
    ending_consensus: ['cooperation', 'isolated'],
    ending_unresolved: ['pending', 'isolated'],
  }[endingFor(run)];
  const rank = (id: ReviewId) => {
    const index = priority.indexOf(id.split('-').at(-1) ?? '');
    return index < 0 ? priority.length : index;
  };
  return records.sort((left, right) => rank(left.id) - rank(right.id));
}
