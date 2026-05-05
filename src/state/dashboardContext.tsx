import { createContext, useContext, useState, type ReactNode } from 'react';

type DashboardContextValue = {
  selectedStockpile: string | null;
  selectedRoute: string | null;
  select: (stockpile: string | null, route?: string | null) => void;
  clearSelection: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedStockpile, setSelectedStockpile] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  function select(stockpile: string | null, route: string | null = null) {
    setSelectedStockpile(stockpile);
    setSelectedRoute(route);
  }

  function clearSelection() {
    setSelectedStockpile(null);
    setSelectedRoute(null);
  }

  return (
    <DashboardContext.Provider value={{ selectedStockpile, selectedRoute, select, clearSelection }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
