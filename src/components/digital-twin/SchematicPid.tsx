import React from 'react';
import { Well } from '../../types';
import { fmt } from '../../data/wells';

interface SchematicPidProps {
  well: Well;
}

export const SchematicPid: React.FC<SchematicPidProps> = ({ well }) => {
  const steamOn = well.steam > 10 || well.cycle === 'INJECT';

  return (
    <div className="w-full h-full min-h-[300px] bg-[#0a1016] overflow-hidden flex items-center justify-center p-2">
      <svg viewBox="0 0 900 420" className="w-full h-full pid-svg max-h-[460px]">
        <rect width="900" height="420" fill="#0a1016" rx="4" />
        
        {/* Engineering Grid */}
        <g stroke="#243040" strokeWidth="1" opacity="0.6">
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={'h' + i} x1="0" y1={i * 24} x2="900" y2={i * 24} />
          ))}
          {Array.from({ length: 38 }).map((_, i) => (
            <line key={'v' + i} x1={i * 24} y1="0" x2={i * 24} y2="420" />
          ))}
        </g>

        {/* Title Header */}
        <text x="16" y="22" fill="#6b7c90" fontSize="10" fontWeight="600">
          P&amp;ID · WELL SURFACE &amp; DOWNHOLE SCHEMATIC · {well.id} · REV 4.2 · ISA-5.1
        </text>

        {/* Steam Generator H-1200 Block */}
        <g transform="translate(60, 68)">
          <rect x="0" y="0" width="125" height="74" fill="#121821" stroke="#f5a623" strokeWidth="1.5" rx="3" />
          <text x="10" y="18" fill="#f5a623" fontSize="10" fontWeight="600">STEAM GENERATOR</text>
          <text x="10" y="34" fill="#9aa8b8" fontSize="9">H-1200 (CYCLIC CSS)</text>
          <text x="10" y="52" fill="#f5a623" fontSize="11" fontWeight="600">
            {steamOn ? fmt(well.steam || 1840, 0) : '0'} CWE bbl/d
          </text>
          <text x="10" y="66" fill="#9aa8b8" fontSize="8">
            {steamOn ? '450°F · 1,142 psig' : 'STANDBY · 120 psig'}
          </text>
        </g>

        {/* Steam Pipe to FV-STEAM */}
        <path
          d="M185 105 H280"
          fill="none"
          stroke="#f5a623"
          strokeWidth="3"
          className={steamOn ? 'steam-pipe' : ''}
        />
        <polygon points="280,100 292,105 280,110" fill="#f5a623" />

        {/* Flow Valve (FV-STEAM) */}
        <g transform="translate(300, 78)">
          <circle cx="18" cy="27" r="16" fill="#121821" stroke="#f5a623" strokeWidth="2" />
          <line x1="8" y1="27" x2="28" y2="27" stroke="#f5a623" strokeWidth="2" />
          <polygon points="10,21 18,27 10,33" fill="#f5a623" />
          <polygon points="26,21 18,27 26,33" fill="#f5a623" />
          <text x="-4" y="58" fill="#f5a623" fontSize="8">FV-STEAM 2"</text>
        </g>

        {/* Steam Pipe to Wellhead */}
        <path
          d="M336 105 H415"
          fill="none"
          stroke="#f5a623"
          strokeWidth="3"
          className={steamOn ? 'steam-pipe' : ''}
        />

        {/* Wellhead Christmas Tree & Wellbore */}
        <g transform="translate(420, 36)">
          {/* Surface Casing Spool 9-5/8" */}
          <rect x="40" y="0" width="70" height="22" fill="#1a2430" stroke="#8b9bb0" />
          <text x="45" y="15" fill="#c5d0dc" fontSize="8">CASING 9-5/8"</text>

          {/* Production Casing 7" */}
          <rect x="58" y="22" width="34" height="160" fill="#151c26" stroke="#8b9bb0" />

          {/* Tubing String 2-7/8" */}
          <rect x="66" y="30" width="18" height="210" fill="#0e141c" stroke="#2ee6c7" />
          <text x="104" y="82" fill="#8b9bb0" fontSize="8">TUBING 2-7/8" L-80</text>

          {/* Master Valve */}
          <rect x="48" y="52" width="54" height="12" fill="#2ee6c7" opacity="0.35" />
          <text x="108" y="61" fill="#2ee6c7" fontSize="8">X-TREE MASTER VALVE</text>
          <circle cx="75" cy="58" r="5" fill="#2ee6c7" />

          {/* Swab Valve */}
          <rect x="70" y="38" width="10" height="14" fill="#8a93a0" />
          <text x="108" y="44" fill="#9aa8b8" fontSize="8">SWAB VALVE</text>

          {/* Sucker Rod String (Center wire) */}
          <line x1="75" y1="20" x2="75" y2="230" stroke="#fbbf24" strokeWidth="2.5" />
          <text x="104" y="130" fill="#fbbf24" fontSize="8">ROD STRING 7/8" + 3/4"</text>

          {/* Downhole Packer */}
          <rect x="60" y="174" width="30" height="9" fill="#3a4555" stroke="#243040" />
          <text x="108" y="182" fill="#6b7c90" fontSize="8">PACKER 812 m MD</text>

          {/* Downhole Insert Pump & Traveling Valve */}
          <rect x="64" y="215" width="22" height="22" fill="#16695e" stroke="#2ee6c7" />
          <text x="108" y="224" fill="#2ee6c7" fontSize="8">DOWNHOLE PUMP RHBC</text>

          {/* Perforations */}
          <rect x="64" y="244" width="22" height="34" fill="none" stroke="#fb923c" strokeDasharray="3 2" />
          <text x="108" y="260" fill="#fb923c" fontSize="8">PERFS 812–856 m (MANDHATA)</text>
        </g>

        {/* Production Line Flow to Choke */}
        <path d="M495 95 H615" fill="none" stroke="#2ee6c7" strokeWidth="3" className="flow-pipe" />
        <polygon points="615,90 627,95 615,100" fill="#2ee6c7" />

        {/* Adjustable Choke */}
        <g transform="translate(635, 70)">
          <circle cx="20" cy="25" r="18" fill="#121821" stroke="#2ee6c7" strokeWidth="2" />
          <line x1="8" y1="25" x2="32" y2="25" stroke="#2ee6c7" strokeWidth="2" />
          <line x1="20" y1="13" x2="20" y2="37" stroke="#2ee6c7" strokeWidth="2" />
          <text x="-4" y="58" fill="#2ee6c7" fontSize="8">CHOKE {well.status === 'critical' ? '18' : '24'}/64"</text>
        </g>

        {/* Flowline to Separator */}
        <path d="M675 95 H750" fill="none" stroke="#2ee6c7" strokeWidth="3" className="flow-pipe" />

        {/* 3-Phase Test Separator Block */}
        <g transform="translate(750, 56)">
          <rect x="0" y="0" width="130" height="84" rx="3" fill="#121821" stroke="#2ee6c7" strokeWidth="1.5" />
          <text x="10" y="18" fill="#2ee6c7" fontSize="9" fontWeight="600">TEST SEPARATOR</text>
          <text x="10" y="34" fill="#9aa8b8" fontSize="8">V-310 · 3-PHASE TEST</text>
          <text x="10" y="52" fill="#d7dee8" fontSize="11" fontWeight="600">
            {fmt(well.rate, 1)} bbl/d oil
          </text>
          <text x="10" y="66" fill="#9aa8b8" fontSize="8">
            WC {fmt(well.wc, 0)}% · {fmt(well.temp, 0)}°C
          </text>
        </g>

        {/* Surface Pumping Unit (Schematic Elevation) */}
        <g transform="translate(230, 240)">
          <rect x="0" y="24" width="105" height="56" fill="#1a222c" stroke="#8b9bb0" rx="2" />
          <polygon points="20,24 85,24 95,0 12,0" fill="#2c333c" stroke="#8b9bb0" />
          <line x1="50" y1="0" x2="50" y2="-45" stroke="#8b9bb0" strokeWidth="3.5" />
          <line x1="50" y1="-45" x2="155" y2="-55" stroke="#8b9bb0" strokeWidth="4" />
          <path d="M12,-55 Q0,-22 12,8" fill="none" stroke="#8b9bb0" strokeWidth="3" />
          <line x1="12" y1="8" x2="12" y2="76" stroke="#2ee6c7" strokeWidth="2.5" />
          <text x="4" y="94" fill="#9aa8b8" fontSize="9">MARK II UNIT · {fmt(well.spm, 1)} SPM</text>
          <text x="4" y="108" fill="#2ee6c7" fontSize="9">
            η {fmt(well.pumpEff, 1)}% · FILLAGE {fmt(well.fillage, 0)}%
          </text>
        </g>

        {/* Telemetry Tag PIT-004 Box */}
        <g transform="translate(425, 296)">
          <rect x="0" y="0" width="170" height="74" fill="#121821" stroke="#22d3ee" strokeWidth="1.2" rx="3" />
          <text x="10" y="16" fill="#22d3ee" fontSize="9" fontWeight="600">PIT-004 WELLHEAD THP</text>
          <text x="10" y="38" fill="#e8eef4" fontSize="18" fontFamily="IBM Plex Mono" fontWeight="600">
            {fmt(well.thp, 0)} psi
          </text>
          <text x="10" y="56" fill="#9aa8b8" fontSize="8">
            CHP {fmt(well.chp, 0)} psi · TT {fmt(well.temp, 0)}°C
          </text>
        </g>

        {/* RTU SCADA Gateway Box */}
        <g transform="translate(625, 296)">
          <rect x="0" y="0" width="175" height="74" fill="#121821" stroke="#243040" strokeWidth="1.2" rx="3" />
          <text x="10" y="16" fill="#8b9bb0" fontSize="9" fontWeight="600">RTU-SCADA / OPC-UA</text>
          <text x="10" y="36" fill="#34d399" fontSize="11" fontWeight="600">
            CONNECTED (124 Hz)
          </text>
          <text x="10" y="56" fill="#9aa8b8" fontSize="8">
            TAG COUNT: 847 · QUALITY: 100% GOOD
          </text>
        </g>
      </svg>
    </div>
  );
};
