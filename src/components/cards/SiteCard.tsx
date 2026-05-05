import type { Stockpile, Route } from '../../api/types';
import { SITES, NODE_META, type SiteKey } from '../../utils/nodeMetadata';
import { fmtNum, fmtSigned } from '../../utils/format';

type Props = { siteKey: SiteKey; stockpiles: Stockpile[]; routes: Route[] };

function ArrowUp() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10 L6 2 M2 6 L6 2 L10 6" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 L6 10 M2 6 L6 10 L10 6" />
    </svg>
  );
}

type StatRowProps = { label: string; value: number; accent?: boolean };
function StatRow({ label, value, accent }: StatRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</span>
      <span
        className="num"
        style={{ fontSize: 11, fontWeight: 600, color: accent ? 'var(--brand-dark)' : 'var(--ink-2)' }}
      >
        {fmtNum(value)} t
      </span>
    </div>
  );
}

export function SiteCard({ siteKey, stockpiles, routes }: Props) {
  const site = SITES[siteKey];
  const own = stockpiles.filter(s => NODE_META[s.name]?.site === siteKey);
  const totalCurrent = own.reduce((a, s) => a + Math.max(0, s.currentBalance), 0);
  const totalOpening = own.reduce((a, s) => a + Math.max(0, s.openingBalance), 0);
  const delta = totalCurrent - totalOpening;

  return (
    <div className="tlc-card" style={{ padding: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{site.name}</div>
          <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{site.region}</div>
        </div>
        <div className="num" style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>{fmtNum(totalCurrent)}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>t · total</div>
        </div>
      </div>

      {/* Per-node sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {own.map(s => {
          const meta = NODE_META[s.name];
          const isPort = meta?.type === 'port';
          const isMine = meta?.type === 'mine';
          const typeLabel = isPort ? 'Port' : isMine ? 'Mine' : 'Siding';
          const dotColor = isPort ? 'var(--brand)' : isMine ? 'var(--ink)' : 'var(--ink-3)';
          const enrouteOut = routes
            .filter(r => r.loading.name === s.name)
            .reduce((a, r) => a + r.totalEnroute, 0);
          const projected = s.currentBalance + (s.receivingEnroute ?? 0);

          return (
            <div
              key={s.name}
              style={{
                background: 'var(--line-2)',
                borderRadius: 6,
                padding: '8px 10px',
              }}
            >
              {/* Node type header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 9.5, fontWeight: 700, color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                  }}>
                    {typeLabel}
                  </span>
                </div>
                <span
                  className="num"
                  style={{
                    fontSize: 13, fontWeight: 600,
                    color: s.currentBalance < 0 ? 'var(--danger)' : 'var(--ink)',
                  }}
                >
                  {fmtNum(s.currentBalance)} t
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {isMine && s.totalLoaded > 0 && (
                  <StatRow label="Loaded" value={s.totalLoaded} />
                )}
                {!isMine && s.totalReceived > 0 && (
                  <StatRow label="Received" value={s.totalReceived} />
                )}
                {!isPort && s.totalLoaded > 0 && !isMine && (
                  <StatRow label="Loaded out" value={s.totalLoaded} />
                )}
                {enrouteOut > 0 && (
                  <StatRow label="En-route out" value={enrouteOut} accent />
                )}
                {(s.receivingEnroute ?? 0) > 0 && (
                  <StatRow label="Inbound" value={s.receivingEnroute} accent />
                )}
                {(s.receivingEnroute ?? 0) > 0 && (
                  <StatRow label="Projected balance" value={projected} />
                )}
                {isMine && (s.enrouteToLoad ?? 0) > 0 && (
                  <StatRow label="Trucks to load" value={s.enrouteToLoad!} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="tlc-divider" style={{ margin: '10px 0' }} />

      <div style={{
        fontSize: 10.5, fontWeight: 600,
        color: delta >= 0 ? 'var(--brand-dark)' : 'var(--danger)',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {delta >= 0 ? <ArrowUp /> : <ArrowDown />}
        {fmtSigned(delta)} t vs opening
      </div>
    </div>
  );
}
