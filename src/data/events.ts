import { EventItem } from '../types';

export const INITIAL_EVENTS: EventItem[] = [
  { t: '14:31:02', sev: 'info', msg: 'BGW-004 PCP VFD setpoint accepted — 41.2 Hz' },
  { t: '14:28:44', sev: 'warn', msg: 'BGW-010 pump fillage trending down 76% → 74%' },
  { t: '14:22:18', sev: 'ok', msg: 'CSS cycle BGW-005 injection ramp complete — 1,840 CWE bbl/d' },
  { t: '14:17:55', sev: 'crit', msg: 'BGW-006 rod load excursion +18% vs baseline — dyno card flagged' },
  { t: '14:11:09', sev: 'info', msg: 'Historian catch-up OK · 2,448 tags reconciled' },
  { t: '14:04:33', sev: 'ok', msg: 'Steam header pressure stable 1,142 psig ±6' },
  { t: '13:58:21', sev: 'warn', msg: 'BGW-002 THP climbing — choke review recommended' },
  { t: '13:49:10', sev: 'info', msg: 'OPC-UA session renewed · RTU-B pad gateway' }
];
