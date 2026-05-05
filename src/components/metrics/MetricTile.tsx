import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  icon?: ReactNode;
};

export function MetricTile({ label, value, unit = 't', sub, icon }: Props) {
  return (
    <div className="tlc-card" style={{ padding: '14px 16px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="tlc-label">{label}</div>
        {icon && <div style={{ color: 'var(--ink-3)' }}>{icon}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div className="num" style={{ fontSize: 24, fontWeight: 600, color: 'var(--ink)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {unit && <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{unit}</div>}
      </div>
      {sub && (
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>
      )}
    </div>
  );
}
