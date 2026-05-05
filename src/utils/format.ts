const _date = new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDate = (iso: string) => _date.format(new Date(iso));

export function fmtNum(n: number | null | undefined, dp = 0): string {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-ZA', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function fmtTons(n: number | null | undefined): string {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return Math.round(n).toLocaleString('en-ZA');
}

export function fmtSigned(n: number | null | undefined): string {
  if (n == null || n === 0) return '0';
  return (n > 0 ? '+' : '') + fmtNum(n);
}

export function fmtAge(iso: string): { label: string; color: string; dotColor: string } {
  const ageMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ageMs / 60_000);
  const hrs  = Math.floor(mins / 60);

  let label: string;
  if (mins < 1)       label = 'just now';
  else if (mins < 60) label = `${mins} min ago`;
  else if (hrs < 24)  label = `${hrs} hr ago`;
  else                label = `${Math.floor(hrs / 24)} d ago`;

  const color    = mins < 10 ? '#009463' : mins < 30 ? '#b45309' : '#b91c1c';
  const dotColor = mins < 10 ? '#00b67a' : mins < 30 ? '#f59e0b' : '#ef4444';

  return { label, color, dotColor };
}
