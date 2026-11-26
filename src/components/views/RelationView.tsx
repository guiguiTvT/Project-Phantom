import { memo, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowUpRight, Move, Network } from 'lucide-react';
import { SigilAvatar } from '@/components/ui/SigilAvatar';
import { Button } from '@/components/ui/Button';
import { InlineTag, WorkspaceHeader } from '@/components/ui/WorkspaceHeader';
import { COLLEGES, NPC_MOOD_META } from '@/data/gameConfig';
import { NPCS, NPC_BY_ID, RELATION_EDGES } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import type { GraphEdge } from '@/types';

type PhantomNodeData = {
  name: string;
  role: string;
  avatarId: string;
  accent: string;
  mood?: string;
  moodLabel?: string;
  isPlayer?: boolean;
};

type PhantomNode = Node<PhantomNodeData, 'phantom'>;

const MOOD_DOT: Record<string, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const PhantomNodeCard = memo(({ data, selected }: NodeProps<PhantomNode>) => {
  return (
    <div
      className={cn(
        'w-[188px] border bg-surface/95 px-3 py-2.5 transition-colors',
        data.isPlayer ? 'border-primary/60' : 'border-line/90',
        selected && 'border-primary',
      )}
      style={{ boxShadow: selected ? '0 0 0 1px rgba(82,214,208,.25)' : undefined }}
    >
      <Handle type="target" position={Position.Top} className="!border-primary/60" />
      <div className="flex items-center gap-2.5">
        <SigilAvatar avatarId={data.avatarId} size={32} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className={cn('text-[12px]', data.isPlayer ? 'text-primary' : 'text-ink')}>
              {data.name}
            </span>
            {data.isPlayer && (
              <span className="font-mono text-[7px] uppercase tracking-[0.1em] text-primary/70">
                you
              </span>
            )}
          </div>
          <p className="truncate text-[9px] text-secondary/80">{data.role}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-line/50 pt-1.5">
        <span className="flex items-center gap-1.5 font-mono text-[8px] text-muted">
          <span className={cn('h-1 w-1 rounded-full', MOOD_DOT[data.mood ?? 'secondary'] ?? 'bg-secondary')} />
          {data.moodLabel ?? '在线'}
        </span>
        <span className="font-mono text-[7px] uppercase tracking-[0.1em] text-muted/60">
          {data.isPlayer ? 'operator' : 'contact'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-primary/60" />
    </div>
  );
});
PhantomNodeCard.displayName = 'PhantomNodeCard';

const nodeTypes = { phantom: PhantomNodeCard };

const EDGE_STYLE: Record<GraphEdge['strength'], { stroke: string; width: number; dash?: string }> = {
  strong: { stroke: 'rgba(82,214,208,0.45)', width: 1.4 },
  normal: { stroke: 'rgba(138,156,181,0.4)', width: 1 },
  faint: { stroke: 'rgba(95,113,136,0.5)', width: 1, dash: '4 4' },
};

function buildNodes(playerName: string, playerAvatar: string, playerCollege: string): PhantomNode[] {
  const npcPositions: Record<string, { x: number; y: number }> = {
    npc_chen: { x: 400, y: 20 },
    npc_gu: { x: 730, y: 100 },
    npc_xuyan: { x: 760, y: 330 },
    npc_linxia: { x: 190, y: 100 },
    npc_zhouning: { x: 90, y: 320 },
  };

  const npcNodes: PhantomNode[] = NPCS.map((npc) => {
    const mood = NPC_MOOD_META[npc.currentMood];
    return {
      id: npc.id,
      type: 'phantom',
      position: npcPositions[npc.id] ?? { x: 0, y: 0 },
      data: {
        name: npc.name,
        role: `${npc.org} · ${npc.role.split(' · ')[1] ?? ''}`,
        avatarId: npc.avatarId,
        accent: npc.accent,
        mood: mood.tone,
        moodLabel: mood.label,
      },
    };
  });

  return [
    ...npcNodes,
    {
      id: 'player',
      type: 'phantom',
      position: { x: 410, y: 380 },
      data: {
        name: playerName,
        role: `${playerCollege} · 红队测试员`,
        avatarId: playerAvatar,
        accent: '#52D6D0',
        mood: 'primary',
        moodLabel: '授权中',
        isPlayer: true,
      },
    },
  ];
}

function buildEdges(): Edge[] {
  return RELATION_EDGES.map((edge) => {
    const style = EDGE_STYLE[edge.strength];
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'default',
      animated: edge.strength === 'strong',
      style: {
        stroke: style.stroke,
        strokeWidth: style.width,
        strokeDasharray: style.dash,
      },
      labelStyle: { fill: '#8A9CB5', fontSize: 9 },
      labelBgStyle: { fill: '#0B1018', fillOpacity: 0.85 },
      labelBgPadding: [4, 2] as [number, number],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: style.stroke,
        width: 12,
        height: 12,
      },
    };
  });
}

export default function RelationView() {
  const player = useGameStore((state) => state.player);
  const updateDossier = useUiStore((state) => state.openDossier);
  const [selectedId, setSelectedId] = useState<string>('npc_chen');
  const collegeName = COLLEGES.find((item) => item.id === player?.college)?.name ?? '未登记学院';

  const initialNodes = useMemo(
    () => buildNodes(player?.callsign ?? 'OPERATOR', player?.avatarId ?? 'sigil-01', collegeName),
    [player?.callsign, player?.avatarId, collegeName],
  );
  const [nodes, , onNodesChange] = useNodesState<PhantomNode>(initialNodes);
  const edges = useMemo(() => buildEdges(), []);

  const npc = selectedId === 'player' ? null : NPC_BY_ID[selectedId];
  const mood = npc ? NPC_MOOD_META[npc.currentMood] : null;

  return (
    <div className="flex min-h-full flex-col">
      <WorkspaceHeader
        eyebrow="act i / social graph"
        title="人物关系图"
        meta={<InlineTag tone="primary">RELATIONS</InlineTag>}
        description="关系图只显示公开可观察的连接，不代表信任程度或信息可靠性。拖拽节点整理视图，点击节点查看档案。"
        actions={
          <>
            <InlineTag>5 名联系人</InlineTag>
            <InlineTag>9 条关系</InlineTag>
            <Button size="sm" variant="ghost" onClick={() => setSelectedId('player')}>
              定位自己
            </Button>
          </>
        }
      />

      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="relative h-[480px] min-w-0 border-b border-line/50 bg-surface-2/30 xl:h-[calc(100vh-200px)] xl:border-b-0 xl:border-r">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodeClick={(_event, node) => setSelectedId(node.id)}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            minZoom={0.4}
            maxZoom={1.4}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#29394d" />
            <MiniMap
              pannable
              zoomable
              nodeColor={(node) => (node.id === 'player' ? '#52D6D0' : '#29394D')}
              maskColor="rgba(11,16,24,0.7)"
              style={{ width: 120, height: 80 }}
            />
            <Controls showInteractive={false} />
          </ReactFlow>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 border border-line/60 bg-background/80 px-2.5 py-2 font-mono text-[8px] text-muted">
            <span className="flex items-center gap-2">
              <span className="h-px w-5 bg-primary/60" /> 强关系
            </span>
            <span className="flex items-center gap-2">
              <span className="h-px w-5 bg-secondary/50" /> 一般关系
            </span>
            <span className="flex items-center gap-2">
              <span className="h-px w-5 border-t border-dashed border-muted" /> 弱连接
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-muted/70">
            <Move size={10} /> drag to rearrange
          </div>
        </div>

        <aside className="min-w-0 border-line/50 bg-surface-2/20">
          <div className="border-b border-line/50 px-4 py-3">
            <p className="eyebrow">profile</p>
            <p className="mt-1 text-[12px] text-ink">节点档案</p>
          </div>

          {selectedId === 'player' && player && (
            <div className="p-4">
              <div className="flex items-center gap-3">
                <SigilAvatar avatarId={player.avatarId} size={48} />
                <div>
                  <p className="text-base text-primary">{player.callsign}</p>
                  <p className="text-[10px] text-secondary">{collegeName}</p>
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">OPERATOR</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="data-row">
                  <span className="text-[10px] text-muted">授权</span>
                  <span className="text-right text-[10px] text-secondary">隔离环境红队</span>
                </div>
                <div className="data-row">
                  <span className="text-[10px] text-muted">利益标签</span>
                  <span className="text-right text-[10px] text-secondary">
                    {player.interests.join(' · ') || '未选择'}
                  </span>
                </div>
                <div className="data-row border-b-0">
                  <span className="text-[10px] text-muted">可见性</span>
                  <span className="text-right text-[10px] text-secondary">关系图仅本次会话可见</span>
                </div>
              </div>
              <p className="mt-4 border border-line/50 bg-surface/40 px-3 py-2.5 text-[9px] leading-relaxed text-muted">
                你的节点由测试授权建立。反转后，这层全局视角会被收回。
              </p>
            </div>
          )}

          {npc && mood && (
            <div className="p-4">
              <div className="flex items-center gap-3">
                <SigilAvatar avatarId={npc.avatarId} size={48} name={npc.name} />
                <div className="min-w-0">
                  <p className="text-base text-ink">{npc.name}</p>
                  <p className="truncate text-[10px] text-secondary">{npc.role}</p>
                  <span className="mt-1 flex items-center gap-1.5 font-mono text-[8px] text-muted">
                    <span className={cn('h-1 w-1 rounded-full', MOOD_DOT[mood.tone])} />
                    当前情绪 · {mood.label}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">当前任务</p>
                <p className="mt-1 text-[10px] leading-relaxed text-secondary/90">{npc.currentTask}</p>
              </div>

              <div className="mt-3">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">性格</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {npc.personality.map((trait) => (
                    <span key={trait} className="tag">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">公开连接</p>
                <div className="mt-1.5 space-y-1">
                  {npc.relationships.map((relation) => (
                    <div key={relation.npcId} className="flex items-center justify-between border-b border-line/30 py-1">
                      <span className="text-[10px] text-secondary">{NPC_BY_ID[relation.npcId]?.name}</span>
                      <span className="font-mono text-[8px] text-muted">{relation.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full"
                onClick={() => updateDossier(npc.id)}
                trailing={<ArrowUpRight size={12} />}
              >
                查看完整档案
              </Button>
            </div>
          )}

          <div className="mx-4 mb-4 flex items-start gap-2 border border-line/40 bg-surface/30 px-3 py-2.5">
            <Network size={12} className="mt-0.5 shrink-0 text-muted" />
            <p className="text-[9px] leading-relaxed text-muted">
              关系图数据来自公开观察与虚构档案。信任值不会在此直接显示，也不会由 AI 自动改写。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
