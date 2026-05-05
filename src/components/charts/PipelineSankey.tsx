import ReactECharts from 'echarts-for-react';
import type { Stockpile, Route, StockpileType } from '../../api/types';
import { fmtNum } from '../../utils/format';
import { NODE_META } from '../../utils/nodeMetadata';
import { useDashboard } from '../../state/dashboardContext';

const TYPE_COLORS: Record<StockpileType, string> = {
  MINE:   '#0a0e0c',
  SIDING: '#5b625e',
  PORT:   '#00b67a',
  OTHER:  '#9ca3af',
};

const MIN_LINK_VALUE = 50;

type Props = { stockpiles: Stockpile[]; routes: Route[]; height?: number };

export function PipelineSankey({ stockpiles, routes, height = 260 }: Props) {
  const { selectedStockpile, selectedRoute, select } = useDashboard();
  const hasSelection = !!(selectedStockpile || selectedRoute);

  const nodes = stockpiles.map(s => ({
    name: s.name,
    itemStyle: { color: TYPE_COLORS[s.type] ?? '#9ca3af' },
    label: { color: 'var(--ink-2)' },
  }));

  const links = routes.map(r => {
    const weight = r.totalEnroute + r.totalPlanned;
    const active = weight > 0;

    let highlighted = true;
    if (selectedRoute) highlighted = r.id === selectedRoute;
    else if (selectedStockpile) highlighted = r.loading.name === selectedStockpile || r.offloading.name === selectedStockpile;

    return {
      source: r.loading.name,
      target: r.offloading.name,
      value: Math.max(weight, MIN_LINK_VALUE),
      lineStyle: {
        color: active ? '#00b67a' : '#e6e8e6',
        opacity: hasSelection ? (highlighted ? 0.7 : 0.06) : (active ? 0.55 : 0.9),
      },
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ECharts formatter params are an untyped union
  function tooltipFormatter(params: any): string {
    const font = "'Inter Tight', sans-serif";
    if (params.dataType === 'node') {
      const s = stockpiles.find(x => x.name === params.name);
      const meta = NODE_META[params.name];
      const balance = s ? fmtNum(s.currentBalance) : '—';
      const color = TYPE_COLORS[s?.type ?? 'OTHER'];
      return `<div style="font-family:${font}">
        <div style="color:${color};font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:3px">${meta?.short ?? params.name}</div>
        <div style="font-size:18px;font-weight:600;color:#0a0e0c;line-height:1">${balance} <span style="font-size:11px;color:#8a918d;font-weight:500">t balance</span></div>
      </div>`;
    }
    const actual = routes.find(r => r.loading.name === params.data?.source && r.offloading.name === params.data?.target);
    const enroute = actual ? fmtNum(actual.totalEnroute) : '—';
    const fromMeta = NODE_META[params.data?.source];
    const toMeta   = NODE_META[params.data?.target];
    return `<div style="font-family:${font}">
      <div style="font-size:10px;color:#8a918d;margin-bottom:3px">${fromMeta?.short ?? params.data?.source} → ${toMeta?.short ?? params.data?.target}</div>
      <div style="font-size:18px;font-weight:600;color:#00b67a;line-height:1">${enroute} <span style="font-size:11px;color:#8a918d;font-weight:500">t in transit</span></div>
    </div>`;
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#e6e8e6',
      borderWidth: 1,
      padding: [10, 14],
      extraCssText: 'border-radius:8px;box-shadow:0 4px 12px rgba(8,16,12,0.1)',
      formatter: tooltipFormatter,
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      nodeWidth: 10,
      nodePadding: 20,
      top: '6%', bottom: '6%', left: '22%', right: '22%',
      data: nodes,
      links,
      label: {
        color: '#0a0e0c',
        fontSize: 10.5,
        fontFamily: "'Inter Tight', sans-serif",
        fontWeight: '500',
      },
      lineStyle: { curveness: 0.5 },
    }],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleClick(params: any) {
    if (params.dataType === 'edge') {
      const route = routes.find(r => r.loading.name === params.data.source && r.offloading.name === params.data.target);
      if (route) select(null, route.id);
    } else if (params.dataType === 'node') {
      select(params.name);
    }
  }

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      notMerge
      onEvents={{ click: handleClick }}
    />
  );
}
