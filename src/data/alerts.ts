import { Alert } from '../types';

export const INITIAL_AI_ALERTS: Alert[] = [
  {
    id: 1,
    sev: 'HIGH',
    conf: 93,
    well: 'BGW-006',
    title: 'Incomplete pump fillage / fluid pound signature',
    detail: 'Dynamometer card indicates severe fluid pound after 62% of downstroke. Predicted intake pressure collapse below bubble point. High risk of sucker rod string fatigue failure within 36–48 h.',
    ts: '14:17:51',
    parameter: 'Dynamometer Fillage',
    action: 'Throttle SPM from 7.4 → 5.2 or initiate CSS cycle'
  },
  {
    id: 2,
    sev: 'MED',
    conf: 86,
    well: 'BGW-004',
    title: 'SPM under-optimized vs reservoir inflow capacity',
    detail: 'Inflow Performance Relationship (IPR) vs Tubing Performance Curve (TPC) mismatch. Raising SPM from 5.8/6.2 → 6.8 will boost lift rate by +8.4 bbl/d while maintaining pump fillage >78%.',
    ts: '14:12:08',
    parameter: 'Pumping Speed (SPM)',
    action: 'Increase SPM to 6.8 via VFD controller'
  },
  {
    id: 3,
    sev: 'MED',
    conf: 81,
    well: 'BGW-010',
    title: 'Steam-oil ratio (SOR) drift — early CSS recall suggested',
    detail: 'Cycle day 27 thermal decay. Production decline accelerated to -4.1%/day with temperature dropping to 101°C. Recommend terminating produce phase and scheduling steam soak in 48 h.',
    ts: '14:02:40',
    parameter: 'Steam-Oil Ratio (SOR)',
    action: 'Transition to Cyclic Steam Injection Stage'
  },
  {
    id: 4,
    sev: 'LOW',
    conf: 74,
    well: 'BGW-002',
    title: 'Wellhead choke backpressure interaction',
    detail: 'Surface choke restriction at 22/64" creating unnecessary tubing backpressure (+28 psi). Model predicts opening choke to 26/64" stabilizes flowline pressure and yields +3.2 bbl/d.',
    ts: '13:51:19',
    parameter: 'Choke Size',
    action: 'Adjust surface choke to 26/64"'
  }
];
