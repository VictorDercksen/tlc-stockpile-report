import type { Route } from '../../api/types';
import { fmtNum } from '../../utils/format';
import { useDashboard } from '../../state/dashboardContext';

type Props = { routes: Route[] };

const COL = '1fr 70px 70px 60px';

export function RouteTable({ routes }: Props) {
  const { selectedStockpile, selectedRoute, select } = useDashboard();
  const hasSelection = !!(selectedStockpile || selectedRoute);

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: COL,
        gap: 8, padding: '6px 4px',
        fontSize: 10, color: 'var(--muted)', fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase' as const,
        borderBottom: '1px solid var(--line)',
      }}>
        <div>Route</div>
        <div style={{ textAlign: 'right' }}>En-route</div>
        <div style={{ textAlign: 'right' }}>Planned</div>
        <div style={{ textAlign: 'right' }}>Status</div>
      </div>

      {routes.map((r, i) => {
        const active = r.totalEnroute > 0 || r.totalPlanned > 0;
        const isPort = r.offloading.name === 'MATOLA_PORT';
        const label = r.id.replace(/_/g, ' ').replace('->', '→');
        const isSelected = selectedRoute === r.id;
        const isRelatedToStockpile = selectedStockpile && (r.loading.name === selectedStockpile || r.offloading.name === selectedStockpile);
        const isDimmed = hasSelection && !isSelected && !isRelatedToStockpile;

        return (
          <div
            key={i}
            onClick={() => select(null, r.id)}
            style={{
              display: 'grid', gridTemplateColumns: COL,
              gap: 8, padding: '8px 4px', fontSize: 12, color: 'var(--ink-2)',
              borderBottom: '1px solid var(--line-2)', alignItems: 'center',
              cursor: 'pointer',
              opacity: isDimmed ? 0.3 : 1,
              transition: 'opacity 0.2s',
              background: isSelected ? 'var(--brand-soft)' : 'transparent',
              borderRadius: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: isPort ? 'var(--brand)' : 'var(--ink)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>
                {label}
              </span>
            </div>
            <div className="num" style={{ textAlign: 'right', fontWeight: 600 }}>{fmtNum(r.totalEnroute)}</div>
            <div className="num" style={{ textAlign: 'right' }}>{fmtNum(r.totalPlanned)}</div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 999,
                background: active ? 'var(--brand-soft)' : 'var(--line-2)',
                color: active ? 'var(--brand-dark)' : 'var(--muted)',
              }}>
                {active ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
