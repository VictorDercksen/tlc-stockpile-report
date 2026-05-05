import type { ReactNode } from 'react';

type Props = { children: ReactNode; sub?: string; right?: ReactNode };

export function SectionTitle({ children, sub, right }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.005em' }}>
          {children}
        </div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}
