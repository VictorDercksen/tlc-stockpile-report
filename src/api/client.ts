import type { DashboardData } from './types';

const DATA_URL = import.meta.env.VITE_DATA_URL as string | undefined;

export async function fetchDashboardData(): Promise<DashboardData> {
  const url = DATA_URL || '/data.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch dashboard data: ${res.status}`);
  return res.json() as Promise<DashboardData>;
}
