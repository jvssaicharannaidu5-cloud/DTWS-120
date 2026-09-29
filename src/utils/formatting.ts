export function fmt(n: number | undefined | null, d = 1): string {
  if (n === undefined || n === null || isNaN(n)) return '0.0';
  return Number(n).toFixed(d);
}

export function formatNumber(n: number, decimals = 1): string {
  return fmt(n, decimals);
}

export function formatTimeIST(date: Date): { time: string; date: string } {
  const time = date.toLocaleTimeString('en-IN', {
    hour12: false,
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const dateStr = date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  return { time, date: dateStr };
}

export function getStatusColor(status: string): { label: string; color: string; bg: string; textClass: string } {
  switch (status.toLowerCase()) {
    case 'active':
      return { label: 'ACTIVE', color: '#34d399', bg: 'rgba(52,211,153,0.12)', textClass: 'text-emerald-400' };
    case 'optimizing':
      return { label: 'OPTIMIZING', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', textClass: 'text-cyan-400' };
    case 'purging':
      return { label: 'PURGING', color: '#f5a623', bg: 'rgba(245,166,35,0.12)', textClass: 'text-amber-400' };
    case 'critical':
      return { label: 'CRITICAL', color: '#f43f5e', bg: 'rgba(244,63,94,0.14)', textClass: 'text-rose-400' };
    case 'offline':
    default:
      return { label: 'OFFLINE', color: '#64748b', bg: 'rgba(100,116,139,0.12)', textClass: 'text-slate-400' };
  }
}

export function getSeverityColor(sev: string): string {
  switch (sev.toUpperCase()) {
    case 'HIGH':
    case 'CRITICAL':
    case 'CRIT':
      return '#f43f5e';
    case 'MED':
    case 'WARNING':
    case 'WARN':
      return '#f5a623';
    case 'OK':
      return '#34d399';
    case 'LOW':
    case 'INFO':
    default:
      return '#22d3ee';
  }
}
