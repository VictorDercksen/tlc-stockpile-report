# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server (hot reload)
npm run build    # tsc type-check then Vite production build
npm run lint     # ESLint
npm run preview  # serve the dist/ build locally
```

No test suite is configured. Type-check alone: `npx tsc --noEmit`.

## Architecture

Single-page React dashboard with no backend. Data flows from a Google Apps Script web app (reads a Google Sheet, returns JSON) → `fetchDashboardData()` in `src/api/client.ts` → `App.tsx` state → `DashboardShell`. The live endpoint is in `.env` as `VITE_DATA_URL`; if the variable is absent, it falls back to `public/data.json` (stub for offline development).

```
src/
├── api/
│   ├── types.ts          ← DashboardData, Stockpile, Route, Location types
│   └── client.ts         ← fetchDashboardData(), env-aware URL switching
├── state/
│   └── dashboardContext.tsx  ← selectedStockpile / selectedRoute + select() / clearSelection()
├── utils/
│   ├── nodeMetadata.ts   ← NODE_META (display names, colours), SITES, SITE_KEYS
│   └── format.ts         ← fmtNum, fmtTons, fmtSigned, fmtAge, formatDate
├── components/
│   ├── Map/LightMap.tsx       ← react-map-gl/maplibre + GeoJSON Source/Layer for routes
│   ├── charts/PipelineSankey.tsx  ← ECharts Sankey, Mine→Siding→Port
│   ├── charts/BalanceBars.tsx
│   ├── charts/RouteTable.tsx
│   ├── cards/SiteCard.tsx     ← per-site detail card (one per SITE_KEY)
│   ├── metrics/MetricTile.tsx
│   └── shell/
│       ├── DashboardShell.tsx ← top-level layout, KPI computation
│       └── TopBar.tsx
└── index.css   ← all CSS custom properties (--brand, --ink-*, --card, etc.)
```

**Data auto-refreshes every 15 minutes** (interval in `App.tsx`). The `generatedAt` timestamp drives the `fmtAge` freshness chip in the top-left KPI card.

**Cross-filtering** works through `DashboardContext`: any component calls `select(stockpileName)` or `select(null, routeId)`; the map dims non-connected nodes/routes, Sankey dims non-connected links, and SiteCards dim.

**Map** (`LightMap.tsx`) uses MapLibre GL via react-map-gl with a Carto Positron base style. Routes are rendered as GeoJSON `Source`/`Layer` pairs (halo + line), not Deck.gl. Node markers are `<Marker>` components. Route filtering is handled by re-computing `filteredRoutes` inside the component; the filter value is lifted to `DashboardShell`.

**Colour system** lives in two places: CSS custom properties in `index.css` (used by UI chrome) and `NODE_META` / inline hex values in component files (used by the map and charts). Brand green is `#00b67a`; port nodes use it; mine/siding nodes use near-black `#0a0e0c`.

## React practices

**Memoisation — profile before adding.** `useMemo` and `useCallback` carry their own overhead (storing previous values, diffing dependencies). Only add them after confirming a real render-cost problem with React DevTools Profiler. The existing `useMemo` calls in `LightMap.tsx` (GeoJSON feature collection, node groups) are justified because they depend on filtered arrays that change on every interaction.

**`useEffect` — only for synchronisation.** Use it to sync React state with something outside React (timers, map imperative API, event listeners). Don't use it to derive state from props — compute it inline or with `useMemo`. The auto-refresh timer in `App.tsx` and the map `fitBounds`/`easeTo` calls in `LightMap.tsx` are correct uses.

**`ref` as a prop (React 19).** `forwardRef` is no longer needed — pass `ref` directly as a prop to function components.

**Context is for shared UI state, not server data.** `DashboardContext` is the right tool for cross-filter selection state. If fetched data ever needs to be shared, pass it down as props (as `DashboardShell` already does) rather than putting it in context — context triggers a re-render of every consumer on every change.

**`React.memo` on leaf components** that receive stable props and render frequently (e.g. `MetricTile`, `SiteCard`). Don't wrap the whole tree.

**Avoid derived state in `useState`.** If a value can be computed from existing state or props, compute it during render (or `useMemo`) — don't sync it with a `useEffect` + `setState` pattern.

## Conventions

- **TypeScript strict mode.** No `any` without justification.
- **Functional components + hooks only.**
- **Styling:** CSS custom properties from `index.css` for spacing/colour tokens; Tailwind utility classes for layout; inline styles for dynamic values. No CSS modules, no CSS-in-JS.
- **Numbers:** `fmtNum` / `fmtTons` from `utils/format.ts`. Locale is `en-ZA`. Never format raw numbers inline.
- **Source data typos are intentional** — the Google Sheet has `TOTAL_TONS_RECIEVED`, `LOADINNG_LONG`, `TOTAL_ENROUE_TO_LOAD`, `TOTAL ENROUTE` (space). The Apps Script normalises these; the TypeScript types use correct spelling.
- **WKT coordinates** in `routePoly` are `lng lat` order (GeoJSON convention), not `lat lng`.
- **Commit messages:** conventional commits — `feat:`, `fix:`, `refactor:`, `chore:`.

## Key files to know

| File | Why |
|------|-----|
| `src/utils/nodeMetadata.ts` | Ground truth for node display names, types, site groupings, and colours |
| `src/state/dashboardContext.tsx` | All cross-filter state lives here |
| `src/components/shell/DashboardShell.tsx` | Layout root and KPI computation |
| `public/data.json` | Offline stub — update if adding new fields to the JSON contract |
| `PLAN.md` | Full spec: data schema, Apps Script source, phases, out-of-scope items |
