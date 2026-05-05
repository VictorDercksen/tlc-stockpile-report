import { useRef, useEffect, useMemo, useState } from 'react';
import { Map as MapGL, Source, Layer, Marker, Popup, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { DashboardData, Stockpile } from '../../api/types';
import { NODE_META } from '../../utils/nodeMetadata';
import { fmtNum, fmtTons } from '../../utils/format';
import { useDashboard } from '../../state/dashboardContext';

const CARTO_POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

type Props = {
  data: DashboardData;
  height: number | string;
  routeFilter?: string;
};

type TooltipState = { lng: number; lat: number; html: string } | null;

function groupByLocation(stockpiles: Stockpile[]): Stockpile[][] {
  const seen = new Map<string, Stockpile[]>();
  stockpiles.forEach(s => {
    const key = `${s.coordinates[0].toFixed(3)},${s.coordinates[1].toFixed(3)}`;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(s);
  });
  return Array.from(seen.values());
}

export function LightMap({ data, height, routeFilter = 'all' }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const { selectedStockpile, selectedRoute, select } = useDashboard();
  const hasSelection = !!(selectedStockpile || selectedRoute);

  // Fit bounds on mount
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const lngs = data.stockpiles.map(s => s.coordinates[0]);
    const lats = data.stockpiles.map(s => s.coordinates[1]);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 60, duration: 0 }
    );
  }, [data.stockpiles]);

  // Pan to selected stockpile
  useEffect(() => {
    if (!selectedStockpile) return;
    const sp = data.stockpiles.find(s => s.name === selectedStockpile);
    if (!sp || !mapRef.current) return;
    mapRef.current.easeTo({ center: [sp.coordinates[0], sp.coordinates[1]], duration: 600 });
  }, [selectedStockpile, data.stockpiles]);

  // Filter routes
  const filteredRoutes = useMemo(() => {
    const routes = data.routes;
    if (routeFilter === 'all') return routes;
    if (routeFilter === 'mine-siding') return routes.filter(r => r.offloading.name !== 'MATOLA_PORT');
    if (routeFilter === 'to-port') return routes.filter(r => r.offloading.name === 'MATOLA_PORT');
    if (routeFilter === 'active') return routes.filter(r => r.totalEnroute > 0);
    if (routeFilter === 'none') return [];
    return routes.filter(r => r.id === routeFilter);
  }, [data.routes, routeFilter]);

  const routeGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredRoutes.map(r => {
      let highlighted = true;
      if (selectedRoute) highlighted = r.id === selectedRoute;
      else if (selectedStockpile) highlighted = r.loading.name === selectedStockpile || r.offloading.name === selectedStockpile;
      return {
        type: 'Feature' as const,
        properties: {
          isPort: r.offloading.name === 'MATOLA_PORT',
          label: r.id.replace(/_/g, ' ').replace('->', '→'),
          enroute: r.totalEnroute,
          planned: r.totalPlanned,
          highlighted,
        },
        geometry: r.geometry,
      };
    }),
  }), [filteredRoutes, selectedRoute, selectedStockpile]);

  const nodeGroups = useMemo(() => groupByLocation(data.stockpiles), [data.stockpiles]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <MapGL
        ref={mapRef}
        mapStyle={CARTO_POSITRON}
        initialViewState={{ longitude: 31.5, latitude: -25, zoom: 6, pitch: 0, bearing: 0 }}
        style={{ width: '100%', height: '100%' }}
        scrollZoom
        interactiveLayerIds={['routes-line']}
        onMouseMove={e => {
          const f = e.features?.[0];
          if (f?.properties && (!hasSelection || f.properties.highlighted)) {
            setTooltip({
              lng: e.lngLat.lng,
              lat: e.lngLat.lat,
              html: `<strong>${f.properties.label}</strong><br/>En-route: ${fmtNum(f.properties.enroute)} t · Planned: ${fmtNum(f.properties.planned)} t`,
            });
          } else {
            setTooltip(null);
          }
        }}
        onMouseLeave={() => setTooltip(null)}
        cursor={tooltip ? 'pointer' : 'grab'}
      >
        {/* Route lines */}
        <Source id="routes" type="geojson" data={routeGeoJSON}>
          <Layer id="routes-halo" type="line"
            paint={{
              'line-color': '#ffffff',
              'line-width': 6,
              'line-opacity': hasSelection
                ? ['case', ['get', 'highlighted'], 0.9, 0.05] as unknown as number
                : 0.9,
            }}
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          />
          <Layer id="routes-line" type="line"
            paint={{
              'line-color': ['case', ['get', 'isPort'], '#00b67a', '#1f2a26'],
              'line-width': 2.4,
              'line-opacity': hasSelection
                ? ['case', ['get', 'highlighted'], 0.9, 0.1] as unknown as number
                : 0.9,
            }}
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          />
        </Source>

        {/* Node markers */}
        {nodeGroups.map((sps, i) => {
          const main = sps.find(s => NODE_META[s.name]?.type === 'port') ?? sps[0];
          const meta = NODE_META[main.name];
          const isPort = meta?.type === 'port';
          const isSelected = selectedStockpile === main.name;
          const isDimmed = hasSelection && !isSelected && !(selectedRoute && (
            data.routes.some(r => r.id === selectedRoute && (r.loading.name === main.name || r.offloading.name === main.name))
          ));

          const sz = isPort ? 26 : 20;
          const borderW = isSelected ? 3 : 1.5;
          const borderColor = isSelected ? '#00b67a' : '#0a0e0c';
          const innerSz = sz - borderW * 2 - 4;

          const tipLabel = sps.length > 1
            ? sps.map(s => `${(NODE_META[s.name]?.short ?? s.name)}: ${fmtNum(s.currentBalance)} t`).join(' · ')
            : `${meta?.short ?? main.name} — Balance: ${fmtNum(main.currentBalance)} t`;

          const totalBalance = sps.reduce((a, s) => a + s.currentBalance, 0);
          const balanceNegative = totalBalance < 0;
          const chipBg    = balanceNegative ? '#fef2f2' : isPort ? 'var(--brand-soft)' : 'rgba(10,14,12,0.07)';
          const chipColor = balanceNegative ? 'var(--danger)' : isPort ? 'var(--brand-dark)' : 'var(--ink-2)';

          return (
            <Marker
              key={i}
              longitude={main.coordinates[0]}
              latitude={main.coordinates[1]}
              anchor="top"
              onClick={() => select(main.name)}
            >
              <div
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  cursor: 'pointer', opacity: isDimmed ? 0.3 : 1,
                  transition: 'opacity 0.2s',
                }}
                title={tipLabel}
              >
                {/* Circle */}
                <div style={{
                  width: sz, height: sz, borderRadius: '50%', background: '#fff',
                  border: `${borderW}px solid ${borderColor}`,
                  boxShadow: isSelected ? '0 0 0 3px rgba(0,182,122,0.25)' : '0 1px 3px rgba(0,0,0,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: innerSz, height: innerSz, borderRadius: '50%', background: isPort ? '#00b67a' : '#0a0e0c' }} />
                </div>
                {/* Balance label */}
                <div style={{
                  background: chipBg,
                  color: chipColor,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '-0.01em',
                  padding: '2px 7px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                }}>
                  {fmtTons(totalBalance)} t
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Route hover tooltip */}
        {tooltip && (
          <Popup longitude={tooltip.lng} latitude={tooltip.lat} closeButton={false} closeOnClick={false} anchor="bottom">
            <div dangerouslySetInnerHTML={{ __html: tooltip.html }} />
          </Popup>
        )}
        <NavigationControl position="top-right" />
      </MapGL>

      {/* Legend */}
      <div style={{
        position: 'absolute', left: 12, bottom: 12, zIndex: 500,
        background: 'rgba(255,255,255,0.96)', border: '1px solid var(--line)', borderRadius: 8,
        padding: '8px 10px', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 5,
        boxShadow: 'var(--shadow-1)', pointerEvents: 'none',
      }}>
        {[
          { dot: { border: '1.5px solid #0a0e0c', inner: '#0a0e0c', sz: 10 }, label: 'Mine / Siding' },
          { dot: { border: '1.5px solid #0a0e0c', inner: '#00b67a', sz: 12 }, label: 'Port' },
        ].map(({ dot, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: dot.sz, height: dot.sz, borderRadius: '50%', background: '#fff', border: dot.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: dot.sz - 5, height: dot.sz - 5, borderRadius: '50%', background: dot.inner }} />
            </div>
            <span style={{ color: 'var(--ink-2)' }}>{label}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'var(--line)', margin: '2px 0' }} />
        {[['#1f2a26', 'Mine → Siding'], ['#00b67a', 'To Port']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 2, background: color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'var(--ink-2)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
