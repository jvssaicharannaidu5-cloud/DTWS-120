import React from 'react';
import { Well } from '../../types';
import { KpiCard } from './KpiCard';
import { fmt } from '../../data/wells';

interface KpiGridProps {
  well: Well;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ well }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      <KpiCard
        tag="QOIL"
        label="Oil Rate"
        value={fmt(well.rate, 1)}
        unit="bbl/d"
        tone="teal"
        sub={`WC ${fmt(well.wc, 0)}% · ${(well.rate * 0.159).toFixed(1)} m³/d`}
      />
      <KpiCard
        tag="THP"
        label="Tubing Head"
        value={fmt(well.thp, 0)}
        unit="psi"
        tone={well.thp < 120 ? 'red' : 'cyan'}
        sub={`CHP ${fmt(well.chp, 0)} psi · ${(well.thp * 0.0689).toFixed(1)} bar`}
      />
      <KpiCard
        tag="TT-WH"
        label="Wellhead T"
        value={fmt(well.temp, 0)}
        unit="°C"
        tone={well.temp > 130 ? 'amber' : 'white'}
        sub={well.cycle === 'INJECT' ? 'Steam Superheat' : 'Flowline Temp'}
      />
      <KpiCard
        tag="PEFF"
        label="Pump η"
        value={fmt(well.pumpEff, 1)}
        unit="%"
        tone={well.pumpEff < 50 ? 'red' : 'green'}
        sub={`Fill ${fmt(well.fillage, 0)}% · Load ${fmt(well.pumpLoad || 68.4, 1)} kN`}
      />
      <KpiCard
        tag="SPM"
        label="Strokes"
        value={fmt(well.spm, 1)}
        unit="/min"
        tone="cyan"
        sub={`${well.stroke || 144} in stroke`}
      />
      <KpiCard
        tag="STEAM"
        label="Inject"
        value={fmt(well.steam, 0)}
        unit="CWE"
        tone="amber"
        sub={well.cycle}
      />
    </div>
  );
};
