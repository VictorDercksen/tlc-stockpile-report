export type NodeType = 'mine' | 'siding' | 'port';

export type NodeMeta = {
  short: string;
  type: NodeType;
  site: string;
  color: string;
};

export const NODE_META: Record<string, NodeMeta> = {
  BOSVELD_MINE:    { short: 'Bosveld Mine',    type: 'mine',   site: 'BOSVELD',  color: '#0a0e0c' },
  RESSANO_MINE:    { short: 'Ressano Mine',    type: 'mine',   site: 'RESSANO',  color: '#0a0e0c' },
  STEENBOK_MINE:   { short: 'Steenbok Mine',   type: 'mine',   site: 'STEENBOK', color: '#0a0e0c' },
  MATOLA_MINE:     { short: 'Matola Mine',     type: 'mine',   site: 'MATOLA',   color: '#0a0e0c' },
  BOSVELD_SIDING:  { short: 'Bosveld Siding',  type: 'siding', site: 'BOSVELD',  color: '#5b625e' },
  RESSANO_SIDING:  { short: 'Ressano Siding',  type: 'siding', site: 'RESSANO',  color: '#5b625e' },
  STEENBOK_SIDING: { short: 'Steenbok Siding', type: 'siding', site: 'STEENBOK', color: '#5b625e' },
  MATOLA_PORT:     { short: 'Matola Port',     type: 'port',   site: 'MATOLA',   color: '#00b67a' },
};

export const SITES = {
  BOSVELD:  { code: 'BOSVELD',  name: 'Bosveld',  region: 'Limpopo, ZA' },
  RESSANO:  { code: 'RESSANO',  name: 'Ressano',  region: 'Ressano Garcia, MZ' },
  STEENBOK: { code: 'STEENBOK', name: 'Steenbok', region: 'Komatipoort, ZA' },
  MATOLA:   { code: 'MATOLA',   name: 'Matola',   region: 'Maputo, MZ' },
} as const;

export type SiteKey = keyof typeof SITES;
export const SITE_KEYS = Object.keys(SITES) as SiteKey[];
