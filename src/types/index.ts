export type WellStatus = 'active' | 'optimizing' | 'purging' | 'critical' | 'offline';

export interface Well {
  id: string;
  pad: string;
  status: WellStatus;
  pumpEff: number;
  rate: number;
  thp: number;
  chp: number;
  temp: number;
  wc: number;
  spm: number;
  stroke: number;
  steam: number;
  cycle: string;
  day: number;
  fillage: number;
  api: number;
  alerts: number;
  spark: number[];
  x: number;
  y: number;
  pumpLoad?: number; // in kN or klbf
  energy?: number;   // in kWh/day
}

export interface TelemetryPoint {
  time: string;
  displacement: number;
  load: number;
  thp: number;
  temp: number;
  rate: number;
  efficiency: number;
}

export interface Alert {
  id: number;
  well: string;
  title: string;
  detail: string;
  sev: 'HIGH' | 'MED' | 'LOW' | 'CRITICAL' | 'WARNING' | 'INFO';
  conf: number;
  ts: string;
  parameter?: string;
  action?: string;
}

export interface CSSStage {
  well: string;
  stage: 'INJECT' | 'SOAK' | 'PRODUCE' | 'MONITOR' | 'NEXT_CYCLE' | 'SHUT-IN';
  start: string;
  end: string;
  progress: number;
  color: string;
  targetTemp?: number;
  cweRate?: number;
  steamPressure?: number;
}

export interface EventItem {
  id?: string;
  t: string;
  sev: 'info' | 'warn' | 'crit' | 'ok';
  msg: string;
}

export interface OptimizationControls {
  spm: number;
  choke: number;
  steam: number;
  freq: number;
  stroke: number;
  cycleDuration: number;
  soakDays: number;
}

export interface SimulationResult {
  deltaRate: number;
  predictedRate: number;
  deltaEff: number;
  predictedEff: number;
  predictedEnergy: number;
  deltaEnergy: number;
  sor: number; // steam-oil ratio
}

export interface FieldConfig {
  name: string;
  block: string;
  basin: string;
  operator: string;
  wells: number;
  pads: number;
  target: number;
}

export type TimeRange = '1H' | '6H' | '24H' | '7D' | '30D';

export type TwinViewMode = '3d' | 'pid';
