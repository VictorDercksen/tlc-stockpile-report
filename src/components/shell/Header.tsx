import { formatDate } from '../../utils/format';

type Props = { generatedAt: string };

function BrandMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="0"  y="8"  width="4" height="8"  fill="#00b67a" />
      <rect x="6"  y="4"  width="4" height="12" fill="#00b67a" />
      <rect x="12" y="0"  width="4" height="16" fill="#00b67a" />
    </svg>
  );
}

export function Header({ generatedAt }: Props) {
  return (
    <header style={{
      height: '46px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      gap: '12px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, var(--green) 0%, transparent 40%)',
        opacity: 0.5,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BrandMark />
        <span style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700,
          fontSize: '17px',
          letterSpacing: '0.08em',
          color: '#fff',
          lineHeight: 1,
        }}>
          CTRLFLEET
        </span>
        <div style={{ width: '1px', height: '14px', background: 'var(--border-hi)' }} />
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '9px',
          letterSpacing: '0.18em',
          color: 'var(--green)',
          textTransform: 'uppercase' as const,
          lineHeight: 1,
          opacity: 0.8,
        }}>
          Stockpile Monitor
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '10px',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
        }}>
          {formatDate(generatedAt)}
        </span>
        <div style={{ width: '1px', height: '12px', background: 'var(--border-hi)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-dot" />
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '10px',
            letterSpacing: '0.18em',
            color: 'var(--green)',
          }}>
            LIVE
          </span>
        </div>
      </div>
    </header>
  );
}
