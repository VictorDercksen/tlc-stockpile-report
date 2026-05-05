import { ColumnLayer } from '@deck.gl/layers';
import type { Stockpile, StockpileType } from '../../api/types';

type RGBA = [number, number, number, number];

const TYPE_COLORS: Record<StockpileType, RGBA> = {
  MINE:   [180, 83,  9,   220], // amber-700
  SIDING: [15,  118, 110, 220], // teal-700
  PORT:   [109, 40,  217, 220], // violet-700
  OTHER:  [100, 116, 139, 220], // slate-500
};
const ALERT_COLOR: RGBA = [185, 28, 28, 220]; // red-700

export function makeStockpileLayer(stockpiles: Stockpile[]) {
  return new ColumnLayer<Stockpile>({
    id: 'stockpiles',
    data: stockpiles,
    getPosition: d => d.coordinates,
    getElevation: d => Math.max(d.currentBalance, 1) * 0.5,
    radius: 800,
    elevationScale: 1,
    getFillColor: d => d.currentBalance < 0 ? ALERT_COLOR : TYPE_COLORS[d.type],
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 60],
  });
}
