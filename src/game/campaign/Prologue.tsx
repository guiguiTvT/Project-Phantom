import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { NovelScene, SceneAction } from '../chapter/NovelScene';
import { ASSETS } from '../data/assets';
import { sfx } from '../audio/sound';
import { CAMPAIGN_CASES } from './cases';
import { hasMet, openingBeat, type Campaign, type Command } from './engine';
import { NOTICE_COMPARISON, NOTICE_FIELDS, OPENING_AREA, OPENING_FILES } from './investigation';
import { FieldCompare, Introduction, SearchScene } from './SceneTools';

export function Prologue({ run, act }: { run: Campaign; act: (command: Command) => void }) {
  const beat = openingBeat(run);
  const [comparing, setComparing] = useState(false);
  const seen = run.cases.festival.seen;
  if (beat === 'arrival') {
    if (!hasMet(run, 'linxia')) return <Introduction person="linxia" location={OPENING_AREA.location} background={OPENING_AREA.background}
      onMeet={() => act({ type: 'meet', person: 'linxia' })} />;
    return <NovelScene focus background={ASSETS.activityRoom} location="科技文化节 · 活动室" time="彩排前"
      framing="right" portrait="linxia" line={{ voice: 'linxia', mood: 'nervous', text: '沈一，等等。周宁说他填完表了，名字却没进名单。群里那条报名消息刚又被顶上来，要不要一起看看？',
        emphasis: ['填完表了，名字却没进名单'] }}
      actions={<SceneAction onClick={() => { sfx.select(); act({ type: 'advance' }); }}><Mail size={16} aria-hidden="true" />看看活动室</SceneAction>} />;
  }
  if (beat === 'search') return <SearchScene area={OPENING_AREA} seen={seen} required={OPENING_FILES} materials={CAMPAIGN_CASES.festival.files}
    line={{ voice: 'linxia', text: '墙上有学校的公告，群消息在我手机里。桌边还有值班签到夹。你想从哪儿找起？' }}
    portrait="linxia" alternate="找到学校公告和群消息" onFind={(record) => act({ type: 'explore', record })}
    onLeave={() => { act({ type: 'advance' }); setComparing(true); }} forward="把两份报名通知摆在一起" />;
  if (beat === 'compare') return <>
    <NovelScene focus background={ASSETS.activityRoom} location={OPENING_AREA.location} portrait="linxia" framing="right"
      line={{ voice: 'linxia', text: '它们写的是同一个活动。我当时就是看见这行，顺手转发了。你看看还有哪里不一样。' }}
      actions={<SceneAction onClick={() => setComparing(true)}>对照两份通知</SceneAction>} />
    {comparing && <FieldCompare cards={NOTICE_COMPARISON} wanted={NOTICE_FIELDS} title="同一个活动，两份通知"
      instruction="点出两份通知上可以决定同学在哪儿报名的字段。"
      lesson="两个入口对不上。先按住转发，带上原消息找值班老师。"
      suggest="活动名相同。看看两份通知的报名入口。" lead
      onClose={() => setComparing(false)} onFinish={(fields, lead) => { act({ type: 'noticePair', fields, lead }); setComparing(false); }} />}
  </>;
  if (!hasMet(run, 'gu')) return <Introduction person="gu" background={ASSETS.serviceHall} location="信息中心 · 值班室"
    onMeet={() => act({ type: 'meet', person: 'gu' })} />;
  return <NovelScene focus background={ASSETS.serviceHall} location="信息中心 · 值班室" portrait="gu" framing="right"
    line={{ voice: 'gu', text: '你们找到了两条不同的入口，林夏先按住群转发。沈一，愿意继续查吗？我可以给你临时红客权限，在副本里核对报名记录。',
      emphasis: ['临时红客权限', '在副本里'] }}
    cue={{ label: '顾老师的授权', text: '可核对校内记录与操作隔离沙盘', tone: 'good' }}
    decoration={<div className="c7-access-badge" aria-hidden="true"><ShieldCheck size={33} /><span>校园安全演练</span><strong>临时通行证</strong></div>}
    actions={<SceneAction onClick={() => { sfx.complete(); act({ type: 'authorize' }); }}><KeyRound size={17} aria-hidden="true" />领取授权，进值班室调查</SceneAction>} />;
}
