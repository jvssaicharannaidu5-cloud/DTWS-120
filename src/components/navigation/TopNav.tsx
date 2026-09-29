import React, { useState } from 'react';
import { FieldConfig, Alert } from '../../types';
import { getSeverityColor } from '../../utils/formatting';
import {
  Menu,
  Search,
  Bell,
  Cpu,
  HeartPulse,
  Settings,
  ChevronDown,
  Radio,
  Mail
} from 'lucide-react';

interface TopNavProps {
  field: FieldConfig;
  currentTimeStr: string;
  currentDateStr: string;
  alerts: Alert[];
  health: number;
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onFocusWell: (wellId: string) => void;
  userEmail?: string;
  onOpenEmailSettings: () => void;
  emailAutomationActive?: boolean;
  onOpenVoiceAssistant?: () => void;
  voiceState?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  field,
  currentTimeStr,
  currentDateStr,
  alerts,
  health,
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  onFocusWell,
  userEmail = 'jvssaicharannaidu5@gmail.com',
  onOpenEmailSettings,
  emailAutomationActive = true,
  onOpenVoiceAssistant,
  voiceState = 'IDLE'
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-12 shrink-0 flex items-center gap-3 px-3 border-b border-[#243040] bg-[#0c1118] select-none z-30">
      {/* Mobile Hamburger */}
      <button
        className="xl:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
        onClick={onToggleSidebar}
        title="Toggle Well Inventory"
      >
        <Menu size={18} />
      </button>

      {/* Product Branding */}
      <div className="flex items-center gap-2 pr-3 border-r border-[#243040]">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-teal-300 to-cyan-700 flex items-center justify-center font-mono text-[10px] text-black font-bold shadow-md shadow-teal-500/20">
          DT
        </div>
        <div className="leading-tight">
          <div className="text-[11px] font-semibold tracking-wide text-slate-100 flex items-center gap-1">
            <span>DIGITAL TWIN</span>
          </div>
          <div className="text-[9px] font-mono text-teal-400 tracking-wider">
            WELL-SURFACE OPT
          </div>
        </div>
      </div>

      {/* Field Selector Dropdown */}
      <div className="hidden md:flex items-center gap-2 px-2 py-1 panel text-[11px] bg-[#121821] border-[#243040]">
        <span className="text-slate-500 text-[10px]">FIELD</span>
        <span className="font-semibold text-slate-200">{field.name}</span>
        <ChevronDown size={11} className="text-slate-500" />
        <span className="tag text-teal-400">{field.block}</span>
      </div>

      {/* Live Stream Indicator */}
      <div className="flex items-center gap-1.5 px-2">
        <span className="live-dot" />
        <span className="text-[10px] font-mono tracking-widest text-teal-300 font-semibold">
          LIVE
        </span>
      </div>

      {/* Universal Search Bar */}
      <div className="flex-1 max-w-md hidden lg:block">
        <div className="flex items-center gap-2 bg-inset border border-[#243040] rounded px-2 h-7 focus-within:border-teal-500/70 transition-colors">
          <Search size={13} className="text-slate-500" />
          <input
            className="bg-transparent text-[11px] w-full outline-none text-slate-200 placeholder:text-slate-600"
            placeholder="Search tags, wells, events / PIT-004 · BGW- · CSS"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Email Automation Status Chip */}
      <button
        onClick={onOpenEmailSettings}
        className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded border border-[#243040] bg-[#10151c] hover:border-teal-500/50 transition-colors cursor-pointer"
        title="Email Automation Settings"
      >
        <Mail size={12} className={emailAutomationActive ? 'text-teal-400' : 'text-slate-500'} />
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">EMAIL AUTO</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            emailAutomationActive ? 'bg-teal-400 shadow-[0_0_6px_#2ee6c7]' : 'bg-slate-600'
          }`}
        />
        <span className="text-[9px] font-mono font-semibold text-teal-300">
          {emailAutomationActive ? 'ACTIVE' : 'OFF'}
        </span>
      </button>

      {/* Right Header Navigation Metrics */}
      <div className="ml-auto flex items-center gap-2 text-[11px]">
        {/* Date & Time IST */}
        <div className="hidden md:block font-mono text-slate-300 text-[11px]">
          <span className="text-slate-500 mr-2">{currentDateStr}</span>
          <span className="text-slate-100">{currentTimeStr}</span>
          <span className="text-slate-500 ml-1 text-[9px]">IST</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((o) => !o)}
            className="relative p-1.5 border border-[#243040] rounded hover:bg-white/5 transition-colors"
            title="Operational Notifications"
          >
            <Bell size={14} className="text-slate-300" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-bold px-1 rounded-full">
                {alerts.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-10 w-80 panel z-50 p-2 shadow-2xl border-slate-700">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#243040]">
                <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase">
                  OPERATIONAL ALERTS
                </span>
                <span className="text-[9px] font-mono text-amber-400">
                  {alerts.length} PENDING
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-[#243040]/60 hide-scroll">
                {alerts.length === 0 ? (
                  <div className="text-[10px] text-slate-500 py-3 text-center">
                    All notifications acknowledged
                  </div>
                ) : (
                  alerts.map((a) => {
                    const color = getSeverityColor(a.sev);
                    return (
                      <div
                        key={a.id}
                        className="py-1.5 text-[11px] cursor-pointer hover:bg-white/5 rounded px-1 transition-colors"
                        onClick={() => {
                          onFocusWell(a.well);
                          setNotificationsOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span style={{ color }} className="font-semibold">
                            {a.sev}
                          </span>
                          <span className="text-slate-500">{a.well} · {a.ts}</span>
                        </div>
                        <div className="text-slate-200 mt-0.5 font-medium line-clamp-1">
                          {a.title}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Health Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 border border-[#243040] rounded bg-[#10151c]">
          <Cpu size={12} className="text-amber-400" />
          <span className="text-slate-500 text-[10px]">AI</span>
          <span className="font-mono text-amber-400 font-semibold">{alerts.length}</span>
        </div>

        {/* System Health */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 border border-[#243040] rounded bg-[#10151c]">
          <HeartPulse size={12} className="text-emerald-400" />
          <span className="text-slate-500 text-[10px]">HEALTH</span>
          <span className="font-mono text-emerald-400 font-semibold">
            {health.toFixed(1)}%
          </span>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-6 h-6 rounded bg-[#1a2836] border border-teal-700/60 flex items-center justify-center text-[9px] font-bold text-teal-300">
              SC
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-[11px] font-medium text-slate-100 flex items-center gap-1">
                <span>Sai Charan</span>
                <ChevronDown size={9} className="text-slate-500" />
              </div>
              <div className="text-[9px] text-slate-500 truncate max-w-[120px]">
                {userEmail}
              </div>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-10 w-64 panel z-50 p-2 shadow-2xl border-slate-700 text-[11px]">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#243040]">
                <div className="w-8 h-8 rounded bg-teal-900/60 border border-teal-500 flex items-center justify-center font-bold text-teal-300 font-mono text-[11px]">
                  SC
                </div>
                <div>
                  <div className="font-semibold text-slate-100">Sai Charan (Lead Eng)</div>
                  <div className="text-[9px] text-teal-400 font-mono break-all">{userEmail}</div>
                </div>
              </div>
              <div className="space-y-1 font-mono text-[10px] text-slate-300">
                <div className="flex justify-between py-1 px-1.5 bg-inset rounded">
                  <span className="text-slate-500">ROLE:</span>
                  <span>Lead Petroleum / AI Ops</span>
                </div>
                <div className="flex justify-between py-1 px-1.5 bg-inset rounded">
                  <span className="text-slate-500">FIELD ACCESS:</span>
                  <span>Baghewala (Full Control)</span>
                </div>
                <div className="flex justify-between py-1 px-1.5 bg-inset rounded">
                  <span className="text-slate-500">EMAIL AUTO:</span>
                  <span className="text-teal-400">ENABLED</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenEmailSettings();
                }}
                className="w-full mt-2 text-[10px] font-mono py-1 rounded bg-teal-400/20 border border-teal-400 hover:bg-teal-400/30 text-teal-300"
              >
                OPEN EMAIL SETTINGS
              </button>
            </div>
          )}
        </div>

        {/* Arise Voice Assistant Trigger Button */}
        <button
          onClick={onOpenVoiceAssistant}
          title={
            voiceState === 'ARISE_SPEAKING'
              ? 'Arise is speaking'
              : voiceState === 'LISTENING' || voiceState === 'CONNECTED' || voiceState === 'USER_SPEAKING'
              ? 'Arise is active and listening'
              : 'Talk to Arise Voice Assistant'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono font-medium transition-all ${
            voiceState === 'ARISE_SPEAKING'
              ? 'bg-[#37E6FF]/15 border-[#37E6FF]/50 text-[#37E6FF] shadow-[0_0_12px_rgba(55,230,255,0.25)]'
              : voiceState === 'CONNECTED' || voiceState === 'LISTENING' || voiceState === 'USER_SPEAKING'
              ? 'bg-[#20D6C7]/15 border-[#20D6C7]/50 text-[#20D6C7] shadow-[0_0_12px_rgba(32,214,199,0.2)]'
              : 'bg-[#10151c] border-[#243040] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {(voiceState === 'ARISE_SPEAKING' || voiceState === 'LISTENING' || voiceState === 'USER_SPEAKING') && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                voiceState === 'ARISE_SPEAKING'
                  ? 'bg-[#37E6FF]'
                  : voiceState === 'CONNECTED' || voiceState === 'LISTENING' || voiceState === 'USER_SPEAKING'
                  ? 'bg-[#20D6C7]'
                  : 'bg-slate-500'
              }`}
            />
          </span>
          <span className="tracking-wider">
            {voiceState === 'ARISE_SPEAKING'
              ? 'ARISE SPEAKING'
              : voiceState === 'CONNECTED' || voiceState === 'LISTENING' || voiceState === 'USER_SPEAKING'
              ? 'ARISE ACTIVE'
              : 'ARISE'}
          </span>
        </button>

        {/* Settings Dialog Trigger */}
        <button
          onClick={onOpenEmailSettings}
          className="p-1.5 border border-[#243040] rounded hover:bg-white/5 transition-colors"
          title="Email Automation & Platform Settings"
        >
          <Settings size={14} className="text-slate-400 hover:text-slate-200" />
        </button>

        {/* SCADA Connection Status Bar indicator */}
        <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-[#243040]">
          <span className="text-[9px] font-mono tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
            <Radio size={10} />
            <span>SCADA CONNECTED</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[9px] font-mono tracking-wider text-cyan-400">
            STREAM ACTIVE
          </span>
        </div>
      </div>
    </header>
  );
};
