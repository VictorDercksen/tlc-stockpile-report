import type { Stockpile, Route } from '../../api/types';
import { formatTonnes } from '../../utils/format';

type Props = { stockpiles: Stockpile[]; routes: Route[] };

type CellProps = {
  label: string;
  value: string;
  borderRight?: boolean;
  borderBottom?: boolean;
  alert?: boolean;
  delay?: string;
};

function KpiCell({ label, value, borderRight, borderBottom, alert, delay = '0s' }: CellProps) {
  const [num, unit] = value.split(' ');
  return (
    <div
      className="fade-up"
      style={{
        padding: '18px 16px 16px',
        borderRight: borderRight ? '1px solid var(--border)' : undefined,
        borderBottom: borderBottom ? '1px solid var(--border)' : undefined,
        animationDelay: delay,
      }}
    >
      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '9px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        color: 'var(--green)',
        opacity: 0.65,
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
      }}>
        {label}
        {alert && <span style={{ color: 'var(--red)', opacity: 1, fontSize: '10px' }}>⚠</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', lineHeight: 1 }}>
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700,
          fontSize: '38px',
          color: alert ? 'var(--red)' : 'var(--text)',
          letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {num}
        </span>
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '11px',
          color: 'var(--green)',
          marginBottom: '4px',
        }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

export function KpiStrip({ stockpiles, routes }: Props) {
  const totalInStockpile = stockpiles.reduce((s, x) => s + x.currentBalance, 0);
  const totalInTransit   = routes.reduce((s, r) => s + r.totalEnroute, 0);
  const totalReceived    = stockpiles.reduce((s, x) => s + x.totalReceived, 0);
  const totalLoaded      = stockpiles.reduce((s, x) => s + x.totalLoaded, 0);
  const hasNegative      = stockpiles.some(x => x.currentBalance < 0);

  return (
    <div style={{ borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <KpiCell label="In Stockpile" value={`${formatTonnes(totalInStockpile)} t`} borderRight borderBottom alert={hasNegative} delay="0s" />
      <KpiCell label="In Transit"   value={`${formatTonnes(totalInTransit)} t`}   borderBottom delay="0.07s" />
      <KpiCell label="Received"     value={`${formatTonnes(totalReceived)} t`}     borderRight  delay="0.14s" />
      <KpiCell label="Loaded"       value={`${formatTonnes(totalLoaded)} t`}                    delay="0.21s" />
    </div>
  );
}
