import { useEffect, useState } from 'react';
import { fetchDashboardData } from './api/client';
import type { DashboardData } from './api/types';
import { DashboardShell } from './components/shell/DashboardShell';
import { DashboardProvider } from './state/dashboardContext';
import { TopBar } from './components/shell/TopBar';
import { Spinner } from './components/Spinner';

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = () =>
      fetchDashboardData()
        .then(setData)
        .catch((err: unknown) =>
          setError(err instanceof Error ? err.message : String(err))
        );

    load();
    const timer = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <DashboardProvider>
      {error ? (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: 40, color: 'var(--danger)', fontFamily: 'var(--font-sans)' }}>
              Error: {error}
            </div>
          </div>
        </div>
      ) : !data ? (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
          </div>
        </div>
      ) : (
        <DashboardShell data={data} />
      )}
    </DashboardProvider>
  );
}

export default App;
