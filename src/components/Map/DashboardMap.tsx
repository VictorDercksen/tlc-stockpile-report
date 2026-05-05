import type { CSSProperties } from 'react';
import DeckGL from '@deck.gl/react';
import type { PickingInfo } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { DashboardData, Stockpile, Route } from '../../api/types';
import { makeStockpileLayer } from './stockpileLayer';
import { makeRouteLayer } from './routeLayer';
import { fitViewState } from '../../utils/geo';
import { formatTonnes } from '../../utils/format';

const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    satellite: {
      type: 'raster' as const,
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP',
    },
  },
  layers: [{ id: 'satellite', type: 'raster' as const, source: 'satellite' }],
};

const TOOLTIP_STYLE: CSSProperties = {
  background: '#1e293b',
  color: '#f1f5f9',
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '13px',
  lineHeight: '1.5',
  pointerEvents: 'none',
};

type Props = { data: DashboardData };

export function DashboardMap({ data }: Props) {
  const initialViewState = fitViewState(data.stockpiles);

  const layers = [
    makeRouteLayer(data.routes),
    makeStockpileLayer(data.stockpiles),
  ];

  function getTooltip({ object, layer }: PickingInfo) {
    if (!object || !layer) return null;

    if (layer.id === 'stockpiles') {
      const s = object as Stockpile;
      return {
        html: `<strong>${s.name}</strong><br/>${s.type}<br/>${formatTonnes(s.currentBalance)} t`,
        style: TOOLTIP_STYLE,
      };
    }

    if (layer.id === 'routes') {
      const r = object as Route;
      return {
        html: `<strong>${r.id}</strong><br/>In transit: ${formatTonnes(r.totalEnroute)} t`,
        style: TOOLTIP_STYLE,
      };
    }

    return null;
  }

  return (
    <DeckGL
      initialViewState={initialViewState}
      controller
      layers={layers}
      getTooltip={getTooltip}
      style={{ width: '100%', height: '100%' }}
    >
      <Map mapStyle={SATELLITE_STYLE} />
    </DeckGL>
  );
}
