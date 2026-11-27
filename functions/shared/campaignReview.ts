import { CAMPAIGN_SCOPES, type CampaignScope } from './campaignDialogue.ts';

const RECORD_KINDS = ['fixed', 'isolated', 'pending', 'normal', 'cooperation', 'spread'] as const;
type RecordKind = typeof RECORD_KINDS[number];
export type ReviewId = `${CampaignScope}-${RecordKind}` | 'rule';

export interface CampaignReviewInput {
  scope: 'campaign';
  ending: string;
  causes: ReviewId[];
}

const CASE_NAMES: Record<CampaignScope, string> = { festival: '文化节报名', job: '远程实习', camera: '相机争议', voice: '熟人语音' };
const RECORD_MEANINGS: Record<RecordKind, string> = {
  fixed: '负责人发出具体整改的执行回执', isolated: '继续损失或传播的路径已受控，整改仍待确认',
  pending: '处置回执缺失，事情留在待办', normal: '核验过的正常路径可用或事务已安全结束',
  cooperation: '相关人完成实际协作并明确接手', spread: '剧情中发生额外转发或有新的当事人受到影响',
};
const KNOWN_IDS: ReviewId[] = [...CAMPAIGN_SCOPES.flatMap((scope) => RECORD_KINDS.map((kind) => `${scope}-${kind}` as const)), 'rule'];

export function readCampaignReview(raw: unknown, endings: readonly string[]): CampaignReviewInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Partial<CampaignReviewInput>;
  if (value.scope !== 'campaign' || !value.ending || !endings.includes(value.ending)
    || !Array.isArray(value.causes) || !value.causes.length || value.causes.length > KNOWN_IDS.length
    || new Set(value.causes).size !== value.causes.length || !value.causes.every((id) => KNOWN_IDS.includes(id))) return null;
  return { scope: 'campaign', ending: value.ending, causes: value.causes };
}

export function campaignReviewContext(input: CampaignReviewInput) {
  return JSON.stringify({ ending: input.ending, events: input.causes.map((id) => {
    if (id === 'rule') return { id, text: '有负责人签收的新规则已经生效' };
    const [scope, kind] = id.split('-') as [CampaignScope, RecordKind];
    return { id, text: `${CASE_NAMES[scope]}。${RECORD_MEANINGS[kind]}。` };
  }) });
}
