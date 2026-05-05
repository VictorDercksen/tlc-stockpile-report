import type { Route, Stockpile } from '../../api/types';
import { NODE_META } from '../../utils/nodeMetadata';

type Props = { stockpiles: Stockpile[]; routes: Route[]; height?: number };

type NodeRect = { x: number; y: number; h: number };

const COL_TYPES = ['mine', 'siding', 'port'] as const;
const W = 680;
const PAD = { l: 130, r: 130, t: 24, b: 24 };

export function FlowSankey({ stockpiles, routes, height = 260 }: Props) {
  const h = height;
  const innerW = W - PAD.l - PAD.r;
  const innerH = h - PAD.t - PAD.b;
  const colX = { mine: PAD.l, siding: PAD.l + innerW / 2, port: PAD.l + innerW };

  function flowVal(name: string): number {
    const out = routes.filter(r => r.loading.name === name).reduce((a, r) => a + r.totalEnroute + r.totalPlanned, 0);
    const inn = routes.filter(r => r.offloading.name === name).reduce((a, r) => a + r.totalEnroute + r.totalPlanned, 0);
    return Math.max(out, inn, 50);
  }

  const byCol: Record<string, Stockpile[]> = { mine: [], siding: [], port: [] };
  stockpiles.forEach(s => {
    const t = NODE_META[s.name]?.type;
    if (t && byCol[t]) byCol[t].push(s);
  });

  const nodeH: Record<string, NodeRect> = {};
  COL_TYPES.forEach(col => {
    const list = byCol[col];
    const total = list.reduce((a, s) => a + flowVal(s.name), 0) || 1;
    const gap = 12;
    const usable = innerH - gap * Math.max(0, list.length - 1);
    let y = PAD.t;
    list.forEach(s => {
      const nh = Math.max(14, (flowVal(s.name) / total) * usable);
      nodeH[s.name] = { x: colX[col], y, h: nh };
      y += nh + gap;
    });
  });

  const links = routes.map(r => {
    const a = nodeH[r.loading.name];
    const b = nodeH[r.offloading.name];
    if (!a || !b) return null;
    const x1 = a.x + 8, x2 = b.x - 8;
    const y1 = a.y + a.h / 2, y2 = b.y + b.h / 2;
    const cx = (x2 - x1) * 0.5;
    const isPort = r.offloading.name === 'MATOLA_PORT';
    const sw = Math.max(2, (r.totalEnroute + r.totalPlanned) * 0.05);
    return {
      d: `M ${x1} ${y1} C ${x1 + cx} ${y1}, ${x2 - cx} ${y2}, ${x2} ${y2}`,
      sw,
      color: isPort ? '#00b67a' : '#0a0e0c',
    };
  }).filter((l): l is NonNullable<typeof l> => l !== null);

  return (
    <svg viewBox={`0 0 ${W} ${h}`} width="100%" height={h} style={{ overflow: 'visible' }}>
      {/* Column labels */}
      {([['mine', 'MINES'], ['siding', 'SIDINGS'], ['port', 'PORT']] as const).map(([col, label]) => (
        <text key={col} x={colX[col]} y={12} fill="var(--muted)" fontSize="10" letterSpacing="0.08em" textAnchor="middle" fontWeight="600">
          {label}
        </text>
      ))}

      {/* Links */}
      {links.map((l, i) => (
        <path key={i} d={l.d} fill="none" stroke={l.color} strokeOpacity="0.18" strokeWidth={l.sw} strokeLinecap="round" />
      ))}

      {/* Nodes */}
      {Object.entries(nodeH).map(([name, n]) => {
        const meta = NODE_META[name];
        const c = meta?.type === 'port' ? '#00b67a' : meta?.type === 'mine' ? '#0a0e0c' : '#5b625e';
        const isMine = meta?.type === 'mine';
        return (
          <g key={name}>
            <rect x={n.x - 4} y={n.y} width={8} height={n.h} fill={c} rx={2} />
            <text
              x={isMine ? n.x - 12 : n.x + 12}
              y={n.y + n.h / 2}
              fill="var(--ink-2)"
              fontSize="10.5"
              dominantBaseline="middle"
              textAnchor={isMine ? 'end' : 'start'}
              fontWeight="500"
            >
              {meta?.short ?? name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
