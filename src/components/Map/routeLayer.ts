import { PathLayer } from '@deck.gl/layers';
import type { Route } from '../../api/types';

type RGBA = [number, number, number, number];

const ACTIVE_COLOR: RGBA  = [59,  130, 246, 220]; // blue-500
const DORMANT_COLOR: RGBA = [100, 116, 139, 100]; // slate-500, faded

export function makeRouteLayer(routes: Route[]) {
  return new PathLayer<Route>({
    id: 'routes',
    data: routes,
    getPath: d => d.geometry.coordinates,
    getWidth: d => Math.max(d.totalEnroute / 200, 2),
    widthUnits: 'pixels',
    widthMinPixels: 2,
    getColor: d => d.totalEnroute > 0 ? ACTIVE_COLOR : DORMANT_COLOR,
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 80],
  });
}
