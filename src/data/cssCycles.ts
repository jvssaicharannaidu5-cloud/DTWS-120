import { CSSStage } from '../types';

export const INITIAL_CSS_STAGES: CSSStage[] = [
  {
    well: 'BGW-005',
    stage: 'INJECT',
    start: 'Day 0',
    end: 'Day 6',
    progress: 0.66,
    color: '#fb923c',
    targetTemp: 285,
    cweRate: 1840,
    steamPressure: 48.5
  },
  {
    well: 'BGW-012',
    stage: 'SOAK',
    start: 'Day 6',
    end: 'Day 10',
    progress: 0.45,
    color: '#f5a623',
    targetTemp: 240,
    cweRate: 0,
    steamPressure: 32.0
  },
  {
    well: 'BGW-004',
    stage: 'PRODUCE',
    start: 'Day 10',
    end: 'Day 40',
    progress: 0.45,
    color: '#2ee6c7',
    targetTemp: 97,
    cweRate: 0,
    steamPressure: 0
  },
  {
    well: 'BGW-006',
    stage: 'PRODUCE',
    start: 'Day 10',
    end: 'Day 40',
    progress: 0.92,
    color: '#f43f5e',
    targetTemp: 71,
    cweRate: 0,
    steamPressure: 0
  },
  {
    well: 'BGW-010',
    stage: 'PRODUCE',
    start: 'Day 10',
    end: 'Day 40',
    progress: 0.68,
    color: '#22d3ee',
    targetTemp: 101,
    cweRate: 0,
    steamPressure: 0
  },
  {
    well: 'BGW-001',
    stage: 'PRODUCE',
    start: 'Day 10',
    end: 'Day 40',
    progress: 0.55,
    color: '#34d399',
    targetTemp: 89,
    cweRate: 0,
    steamPressure: 0
  }
];
