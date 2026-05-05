export type StockpileType = 'MINE' | 'SIDING' | 'PORT' | 'OTHER';

export type Stockpile = {
  poi: string;
  name: string;
  type: StockpileType;
  coordinates: [number, number]; // [lng, lat]
  openingBalance: number;
  totalReceived: number;
  totalLoaded: number;
  currentBalance: number;
  receivingEnroute: number;
  enrouteToLoad: number;
  date: string;
};

export type Route = {
  id: string;
  loading: { poi: string; name: string; coordinates: [number, number] };
  offloading: { poi: string; name: string; coordinates: [number, number] };
  totalEnroute: number;
  totalPlanned: number;
  geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
};

export type Location = {
  shortcode: string;
  coordinates: [number, number];
};

export type DashboardData = {
  generatedAt: string;
  stockpiles: Stockpile[];
  routes: Route[];
  locations: Location[];
};
