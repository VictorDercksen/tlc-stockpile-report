import type { Stockpile } from '../api/types';

type Bounds = [[number, number], [number, number]]; // [[minLng, minLat], [maxLng, maxLat]]

export function calcBounds(stockpiles: Stockpile[]): Bounds {
  const lngs = stockpiles.map(s => s.coordinates[0]);
  const lats = stockpiles.map(s => s.coordinates[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export function fitViewState(stockpiles: Stockpile[]) {
  if (stockpiles.length === 0) {
    return { longitude: 32, latitude: -25, zoom: 7, pitch: 45, bearing: 0 };
  }
  const [[minLng, minLat], [maxLng, maxLat]] = calcBounds(stockpiles);
  const longitude = (minLng + maxLng) / 2;
  const latitude = (minLat + maxLat) / 2;
  // Approximate zoom: fit the larger of lng/lat span with some padding
  const span = Math.max(maxLng - minLng, (maxLat - minLat) * 1.5) * 1.5;
  const zoom = Math.min(Math.log2(360 / Math.max(span, 0.001)), 14);
  return { longitude, latitude, zoom, pitch: 45, bearing: 0 };
}
