import { useEffect, useState } from 'react';
import type { DashboardData } from '../../api/types';
import { useDashboard } from '../../state/dashboardContext';
import { fmtNum, fmtSigned, fmtTons, fmtAge } from '../../utils/format';
import { SITE_KEYS } from '../../utils/nodeMetadata';
import { SiteCard } from '../cards/SiteCard';
import { BalanceBars } from '../charts/BalanceBars';
import { PipelineSankey } from '../charts/PipelineSankey';
import { RouteTable } from '../charts/RouteTable';
import { SectionTitle } from '../charts/SectionTitle';
import { LightMap } from '../Map/LightMap';
import { RouteFilterToggle } from '../Map/RouteFilterToggle';
import { MetricTile } from '../metrics/MetricTile';
import { TopBar } from './TopBar';

type Props = { data: DashboardData };

function computeKPIs(data: DashboardData) {
  const { stockpiles, routes } = data;
  const networkBalance = stockpiles.reduce((a, s) => a + Math.max(0, s.currentBalance), 0);
  const networkOpening = stockpiles.reduce((a, s) => a + Math.max(0, s.openingBalance), 0);
  const totalLoaded    = stockpiles.reduce((a, s) => a + s.totalLoaded, 0);
  const totalReceived  = stockpiles.reduce((a, s) => a + s.totalReceived, 0);
  const enroute        = routes.reduce((a, r) => a + r.totalEnroute, 0);
  const trucksToLoad   = stockpiles.reduce((a, s) => a + (s.enrouteToLoad ?? 0), 0);
  const delta          = networkBalance - networkOpening;
  const deltaPct       = networkOpening ? (delta / networkOpening) * 100 : 0;
  return { networkBalance, networkOpening, totalLoaded, totalReceived, enroute, trucksToLoad, delta, deltaPct };
}

/* ── Tiny SVG icons ── */
function IconTruck() {
  return <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="5" width="8" height="6" /><path d="M9.5 7 L13 7 L14.5 9 L14.5 11 L9.5 11 Z" /><circle cx="4.5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /></svg>;
}
function IconArrowUp() {
  return <svg width={14} height={14} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10 L6 2 M2 6 L6 2 L10 6" /></svg>;
}
function IconArrowDown() {
  return <svg width={14} height={14} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 L6 10 M2 6 L6 10 L10 6" /></svg>;
}

export function DashboardShell({ data }: Props) {
  const { selectedRoute } = useDashboard();
  const [routeFilter, setRouteFilter] = useState('all');
  const [, setTick] = useState(0);
  const k = computeKPIs(data);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedRoute) setRouteFilter('all');
  }, [selectedRoute]);
  const activeRoutes = data.routes.filter(r => r.totalEnroute > 0).length;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <TopBar generatedAt={data.generatedAt} />

      <div style={{ padding: 18 }}>
        {/* ── Hero metrics row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          {/* Network balance — wide card */}
          <div className="tlc-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="tlc-label">Network balance</div>
              {(() => {
                const age = fmtAge(data.generatedAt);
                return (
                  <span className="tlc-chip" style={{ color: age.color, background: age.color + '18' }}>
                    <svg width={6} height={6} viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill={age.dotColor} /></svg>
                    {age.label}
                  </span>
                );
              })()}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
              <div className="num" style={{ fontSize: 56, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                {fmtNum(k.networkBalance)}
              </div>
              <div style={{ fontSize: 16, color: 'var(--muted)', fontWeight: 500 }}>tons</div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11.5, color: 'var(--ink-3)' }}>
              <div>Opening <span className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{fmtNum(k.networkOpening)}</span></div>
              <div>Δ <span className="num" style={{ color: k.delta >= 0 ? 'var(--brand-dark)' : 'var(--danger)', fontWeight: 600 }}>{fmtSigned(k.delta)} t</span></div>
              <div>Across <span className="num" style={{ color: 'var(--ink-2)', fontWeight: 600 }}>4 sites</span></div>
            </div>
          </div>

          <MetricTile label="Tons en-route"      value={fmtNum(k.enroute)}        unit="t"  sub="in transit"          icon={<IconTruck />} />
          <MetricTile label="Loaded · period"    value={fmtTons(k.totalLoaded)}   unit="t"  sub="ex-mine + siding"    icon={<IconArrowUp />} />
          <MetricTile label="Received · period"  value={fmtTons(k.totalReceived)} unit="t"  sub="into network"        icon={<IconArrowDown />} />
          <MetricTile label="Total to load"     value={fmtNum(k.trucksToLoad)}   unit="t"   sub="awaiting to be loaded"   icon={<IconTruck />} />
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="tlc-card" style={{ padding: 14 }}>
              <SectionTitle sub="Mine → Siding → Port — line weight = flow magnitude">Material flow</SectionTitle>
              <PipelineSankey stockpiles={data.stockpiles} routes={data.routes} height={240} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="tlc-card" style={{ padding: 14 }}>
                <SectionTitle sub="Tons remaining at each location">Stockpile balances</SectionTitle>
                <BalanceBars stockpiles={data.stockpiles} routes={data.routes} />
              </div>
              <div className="tlc-card" style={{ padding: 14 }}>
                <SectionTitle sub={`${activeRoutes} active of ${data.routes.length} corridors`}>Routes</SectionTitle>
                <RouteTable routes={data.routes} />
              </div>
            </div>
          </div>

          {/* Right column — Map */}
          <div className="tlc-card" style={{ padding: 14, display: 'flex', flexDirection: 'column' }}>
            <SectionTitle
              sub="Click a node to focus · toggle route segments to declutter"
              right={<RouteFilterToggle value={routeFilter} onChange={setRouteFilter} routes={data.routes} />}
            >
              Geography
            </SectionTitle>
            <div style={{ flex: 1, minHeight: 0 }}>
              <LightMap
                data={data}
                height="100%"
                routeFilter={routeFilter}
              />
            </div>
          </div>
        </div>

        {/* ── Site cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SITE_KEYS.map(sk => (
            <SiteCard key={sk} siteKey={sk} stockpiles={data.stockpiles} routes={data.routes} />
          ))}
        </div>
      </div>
    </div>
  );
}
