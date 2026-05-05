import ctrlFleetIcon from '../../assets/icon512_rounded.png';
import { formatDate } from '../../utils/format';
import { useDashboard } from '../../state/dashboardContext';

type Props = { generatedAt?: string };

export function TopBar({ generatedAt }: Props) {
  const { selectedStockpile, selectedRoute, clearSelection } = useDashboard();
  const hasSelection = !!(selectedStockpile || selectedRoute);
  const selLabel = selectedRoute
    ? selectedRoute.replace(/_/g, ' ').replace('->', '→')
    : selectedStockpile?.replace(/_/g, ' ') ?? '';

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#fff',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: 52,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src={ctrlFleetIcon}
          alt="CtrlFleet"
          width={30}
          height={30}
          style={{ borderRadius: 6, display: 'block' }}
        />
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.005em' }}>
          TLC Stockpile Monitor
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {hasSelection && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--brand-dark)', fontWeight: 500 }}>
              {selLabel}
            </span>
            <button
              onClick={clearSelection}
              style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px',
                borderRadius: 5, border: '1px solid var(--line)',
                background: '#fff', color: 'var(--ink-3)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 2 L8 8 M8 2 L2 8" />
              </svg>
              Clear
            </button>
          </div>
        )}
        {generatedAt && (
          <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            {formatDate(generatedAt)}
          </div>
        )}
      </div>
    </div>
  );
}
