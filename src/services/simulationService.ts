import { Well, OptimizationControls, SimulationResult } from '../types';
import { clamp } from '../data/wells';

export function calculateSimulation(
  well: Well,
  controls: OptimizationControls
): SimulationResult {
  // SPM impact: Higher SPM increases displacement rate, but if too high degrades pump fillage & efficiency
  const deltaSpm = controls.spm - well.spm;
  const strokeRatio = controls.stroke / (well.stroke || 144);
  const deltaChoke = controls.choke - 24;
  const deltaFreq = controls.freq - 41.2;

  // Lift rate impact:
  // Base SPM delta provides ~14 bbl/d per SPM
  // Choke delta provides ~0.8 bbl/d per 1/64"
  // Stroke ratio multiplier
  let deltaRate =
    deltaSpm * 14 * strokeRatio +
    deltaChoke * 0.8 +
    deltaFreq * 0.45;

  if (well.status === 'offline') {
    deltaRate = 0;
  }

  // Steam effect (thermal recovery adds to inflow rate if cycle is INJECT/SOAK)
  if (controls.steam > 0 && well.steam === 0) {
    deltaRate += Math.min(25, controls.steam * 0.012);
  }

  const predictedRate = Math.max(0, Math.round((well.rate + deltaRate) * 10) / 10);

  // Efficiency impact:
  // Excessive SPM decreases efficiency if fillage collapses
  // Optimal SPM range is 5.5 to 7.0
  const effPenalty = deltaSpm > 1.2 ? Math.pow(deltaSpm - 1.2, 1.8) * -2.5 : 0;
  const deltaEff = deltaSpm * -1.4 + deltaFreq * 0.35 + effPenalty;
  const predictedEff = clamp(
    Math.round((well.pumpEff + deltaEff) * 10) / 10,
    15,
    98.5
  );

  // Energy consumption (kWh):
  // Baseline pump power scales with SPM * stroke * fluid density + steam thermal energy
  const baseEnergy = well.energy || 135;
  const deltaEnergy =
    deltaSpm * 8.5 +
    deltaFreq * 3.2 +
    (controls.steam > 0 ? (controls.steam / 100) * 8 : 0);
  const predictedEnergy = Math.max(10, Math.round(baseEnergy + deltaEnergy));

  // Steam-Oil Ratio (SOR)
  const sor =
    controls.steam > 0
      ? Math.round((controls.steam / Math.max(1, predictedRate)) * 100) / 100
      : 0;

  return {
    deltaRate: Math.round(deltaRate * 10) / 10,
    predictedRate,
    deltaEff: Math.round(deltaEff * 10) / 10,
    predictedEff,
    predictedEnergy,
    deltaEnergy: Math.round(deltaEnergy * 10) / 10,
    sor
  };
}
