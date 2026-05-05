import type { Route } from '../../api/types';

type Props = { value: string; onChange: (v: string) => void; routes: Route[] };

const PRESETS = [
  { id: 'all',         label: 'All' },
  { id: 'mine-siding', label: 'Mine → Siding' },
  { id: 'to-port',     label: 'To Port' },
  { id: 'active',      label: 'Active only' },
  { id: 'none',        label: 'None' },
] as const;

export function RouteFilterToggle({ value, onChange }: Props) {
  return (
    <div style={{ position: 'relative', display: 'flex', gap: 6, alignItems: 'center' }}>
      {/* Segmented presets */}
      <div style={{ display: 'flex', background: 'var(--line-2)', borderRadius: 6, padding: 2 }}>
        {PRESETS.map(p => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              style={{
                fontSize: 10.5, fontWeight: 600,
                color: active ? '#fff' : 'var(--ink-3)',
                background: active ? 'var(--ink)' : 'transparent',
                border: 'none', padding: '4px 9px', borderRadius: 4,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
