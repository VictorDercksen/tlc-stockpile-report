import type { Stockpile, Route } from '../../api/types';
import { NODE_META } from '../../utils/nodeMetadata';
import { fmtNum, fmtSigned } from '../../utils/format';
import { useDashboard } from '../../state/dashboardContext';

type Props = { stockpiles: Stockpile[]; routes: Route[] };

export function BalanceBars({ stockpiles, routes }: Props) {
  const { selectedStockpile, selectedRoute, select } = useDashboard();
  const hasSelection = !!(selectedStockpile || selectedRoute);

  const routeStockpiles = selectedRoute
    ? (() => { const r = routes.find(r => r.id === selectedRoute); return r ? [r.loading.name, r.offloading.name] : []; })()
    : [];

  const max = Math.max(
    ...stockpiles.map(s => Math.max(s.currentBalance + s.receivingEnroute, s.openingBalance, 0)),
    1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {stockpiles.map(s => {
        const meta = NODE_META[s.name];
        const isPort = meta?.type === 'port';
        const cur = Math.max(0, s.currentBalance);
        const op = Math.max(0, s.openingBalance);
        const projected = cur + (s.receivingEnroute ?? 0);
        const delta = s.currentBalance - s.openingBalance;
        const isSelected = selectedStockpile === s.name || routeStockpiles.includes(s.name);
        const isDimmed = hasSelection && !isSelected;
        const barColor = isPort ? 'var(--brand)' : 'var(--ink)';

        return (
          <div
            key={s.name}
            onClick={() => select(s.name)}
            style={{
              cursor: 'pointer',
              opacity: isDimmed ? 0.3 : 1,
              transition: 'opacity 0.2s',
              borderRadius: 4,
              padding: '2px 0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: barColor, flexShrink: 0 }} />
                {meta?.short ?? s.name.replace(/_/g, ' ')}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div className="num" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>
                  {fmtNum(cur)} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 10.5 }}>t</span>
                </div>
                {s.receivingEnroute > 0 && (
                  <div className="num" style={{ fontSize: 10.5, color: 'var(--brand-dark)', fontWeight: 600 }}>
                    → {fmtNum(projected)} t
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative', height: 8, background: 'var(--line-2)', borderRadius: 3, overflow: 'hidden' }}>
              {/* Projected bar (current + receiving enroute) */}
              {s.receivingEnroute > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${Math.min(100, (projected / max) * 100)}%`,
                  background: barColor,
                  opacity: 0.22,
                  borderRadius: 3,
                }} />
              )}
              {/* Opening tick */}
              <div style={{
                position: 'absolute', left: `${(op / max) * 100}%`, top: -2, bottom: -2,
                width: 1.5, background: 'var(--ink-3)', opacity: 0.5,
              }} />
              {/* Current balance bar */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${Math.min(100, (cur / max) * 100)}%`,
                background: barColor,
                borderRadius: 3,
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 10, color: 'var(--muted)' }}>
              <span>opening {fmtNum(op)}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {s.receivingEnroute > 0 && (
                  <span style={{ color: 'var(--brand-dark)' }}>+{fmtNum(s.receivingEnroute)} inbound</span>
                )}
                <span style={{ color: delta >= 0 ? 'var(--brand-dark)' : 'var(--danger)', fontWeight: 600 }}>
                  {fmtSigned(delta)} t
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
