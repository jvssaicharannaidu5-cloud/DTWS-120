import { Well, Alert } from '../types';

export function evaluateAnomalies(wells: Well[]): Alert[] {
  const alerts: Alert[] = [];
  let id = 100;

  for (const well of wells) {
    if (well.status === 'offline') continue;

    // Check 1: Fluid pound / incomplete fillage
    if (well.fillage > 0 && well.fillage < 55) {
      alerts.push({
        id: ++id,
        well: well.id,
        title: 'Fluid pound & gas lock hazard detected',
        detail: `Pump fillage dropped to ${well.fillage}%. Significant fluid pound on downstroke. Tubing intake pressure below bubble point.`,
        sev: 'HIGH',
        conf: 94,
        ts: 'Just now',
        parameter: 'Fillage / Dyno Card',
        action: 'Reduce SPM by 20% or verify casing venting'
      });
    }

    // Check 2: Low efficiency
    if (well.pumpEff < 50 && well.status !== 'purging') {
      alerts.push({
        id: ++id,
        well: well.id,
        title: 'Severe volumetric pump efficiency degradation',
        detail: `Current pump efficiency is ${well.pumpEff.toFixed(1)}%. Leakage past traveling valve or worn barrel suspected.`,
        sev: 'MED',
        conf: 88,
        ts: '10m ago',
        parameter: 'Pump Efficiency',
        action: 'Run automated standing/traveling valve check'
      });
    }

    // Check 3: Abnormal wellhead pressure (THP)
    if (well.thp < 100 && well.rate > 20) {
      alerts.push({
        id: ++id,
        well: well.id,
        title: 'Abnormally low tubing head pressure',
        detail: `THP collapsed to ${well.thp.toFixed(0)} psi. Check for flowline obstruction or emulsion breakout at header.`,
        sev: 'HIGH',
        conf: 91,
        ts: '15m ago',
        parameter: 'Tubing Pressure (THP)',
        action: 'Inspect flowline manifold and check valve'
      });
    }

    // Check 4: Thermal breakdown in late produce cycle
    if (well.cycle === 'PRODUCE' && well.day > 25 && well.temp < 92) {
      alerts.push({
        id: ++id,
        well: well.id,
        title: 'Thermal heat sink decay in CSS cycle',
        detail: `Wellhead temperature has fallen to ${well.temp.toFixed(0)}°C on cycle day ${well.day}. Viscosity increase imminent.`,
        sev: 'MED',
        conf: 82,
        ts: '25m ago',
        parameter: 'Wellhead Temperature',
        action: 'Plan next CSS steam injection cycle'
      });
    }
  }

  return alerts;
}
