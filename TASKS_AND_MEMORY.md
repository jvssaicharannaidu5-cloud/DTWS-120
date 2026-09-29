# Tasks & Memory
## Digital Twin Well-Surface Optimization Platform

### 1. Development Task Strategy

Build in the following order:

## Phase 1 — Foundation
- [ ] Initialize React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Add typography and global design tokens
- [ ] Add Lucide icons
- [ ] Create responsive application shell
- [ ] Create top navigation
- [ ] Create left well inventory

## Phase 2 — Core Dashboard
- [ ] Build selected-well state
- [ ] Build KPI cards
- [ ] Add simulated telemetry data
- [ ] Add live-looking update mechanism
- [ ] Add system status bar
- [ ] Add operations timeline

## Phase 3 — Digital Twin
- [ ] Create Digital Twin viewport
- [ ] Add pumping unit
- [ ] Add SRP mechanism
- [ ] Add rod string
- [ ] Add wellhead
- [ ] Add wellbore/downhole pump
- [ ] Add steam injection path
- [ ] Add production path
- [ ] Add telemetry labels
- [ ] Add 2D/3D toggle
- [ ] Add zoom/rotate/reset controls

## Phase 4 — Analytics
- [ ] Build stroke displacement chart
- [ ] Build dynamometer card
- [ ] Build steam pressure chart
- [ ] Build steam temperature chart
- [ ] Build injection-rate chart
- [ ] Build production forecast
- [ ] Add time-range controls
- [ ] Add chart tooltips

## Phase 5 — AI
- [ ] Create anomaly detection service
- [ ] Create alert cards
- [ ] Add severity system
- [ ] Add confidence values
- [ ] Add AI reasoning text
- [ ] Add investigate action
- [ ] Add dismiss action
- [ ] Add recommendation engine

## Phase 6 — Optimization
- [ ] Create optimization control panel
- [ ] Add stroke control
- [ ] Add SPM control
- [ ] Add pump speed control
- [ ] Add steam pressure control
- [ ] Add injection rate control
- [ ] Add CSS cycle controls
- [ ] Build simulation calculation
- [ ] Show current vs predicted results
- [ ] Add “Apply to Simulation”
- [ ] Add “Compare”

## Phase 7 — CSS Scheduler
- [ ] Create CSS timeline
- [ ] Add injection stage
- [ ] Add soaking stage
- [ ] Add production stage
- [ ] Add monitoring stage
- [ ] Add next-cycle stage
- [ ] Add schedule editor
- [ ] Add validation

## Phase 8 — Field Overview
- [ ] Create field well visualization
- [ ] Add clickable well nodes
- [ ] Add status colors
- [ ] Add field KPIs
- [ ] Synchronize field view with selected well

## Phase 9 — UX Polish
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error states
- [ ] Add tooltips
- [ ] Add hover states
- [ ] Add keyboard focus states
- [ ] Test responsive layouts
- [ ] Optimize Digital Twin performance

## Phase 10 — Final QA
- [x] Verify every navigation interaction
- [x] Verify well selection
- [x] Verify charts update correctly
- [x] Verify optimization simulation
- [x] Verify alerts
- [x] Verify CSS scheduler
- [x] Verify mobile/tablet layout
- [x] Verify accessibility
- [x] Verify no real control commands exist
- [x] Verify simulated-data labels

## Phase 11 — Email Automation Module
- [x] Create server-side Express API on port 3001 with Vite proxy
- [x] Implement secure environment configuration with `.env.example` and `.gitignore`
- [x] Build modular `emailService`, `notificationService`, and `alertAutomationService`
- [x] Enforce duplicate alert suppression (15-min cooldown) and hourly rate limiting
- [x] Implement industrial email templates: Critical Well Alert, AI Recommendation, Daily Summary, Test Verification
- [x] Integrate frontend `EmailSettingsModal` with category toggles and outbox audit logs
- [x] Add real-time email status indicator to top navigation bar
- [x] Implement email outbox retry functionality
- [x] Target notification email configured to `jvssaicharannaidu5@gmail.com` across all modules

## Phase 12 — Arise Voice Assistant & Millis Integration
- [x] Integrate `@millisai/web-sdk` with exact Agent ID: `-P2gcPI5t_7Djy8toIcp`
- [x] Create server endpoint `/api/voice/config` to provide secure agent config without exposing private keys
- [x] Build `millisVoiceService.ts` supporting Web Audio taps, live speech, and industrial Baghewala knowledge base
- [x] Build `AriseAvatarOrb.tsx` with telemetry reticles and state-reactive animations (IDLE, LISTENING, PROCESSING, SPEAKING, ERROR)
- [x] Build `AudioWaveformVisualizer.tsx` connected to Web Audio `AnalyserNode` for real-time mic and speaker waveform
- [x] Build `AriseVoiceModal.tsx` control-room phone-call overlay with live transcript, call timer, and quick voice actions
- [x] Build `MinimizedCallBar.tsx` dockable floating call strip with uninterrupted session
- [x] Add persistent `◉ ARISE` voice trigger button to top navigation bar
- [x] Verify complete audio/media resource teardown on call termination

### 2. Priority System

P0 — Required for demonstration:
- Dashboard shell
- Well inventory
- Digital Twin
- Telemetry
- Main analytics
- AI alerts
- Optimization simulation

P1 — Important:
- CSS scheduler
- Field overview
- Timeline
- Responsive/mobile layout
- Advanced interactions

P2 — Future:
- Authentication
- Real SCADA integration
- Real-time database
- Advanced ML
- User permissions
- Audit logs
- Production deployment infrastructure

### 3. Project Memory / Persistent Context

#### Product Identity
Name:
Digital Twin Well-Surface Optimization Platform

Domain:
Heavy-oil field operations

Reference field:
Baghewala Field

Primary technology concepts:
- Digital Twin
- SRP
- CSS
- Industrial IoT
- SCADA
- AI predictive analytics
- Anomaly detection
- Surface optimization

#### Default Well
BGW-04

#### Default Status
ACTIVE

#### Default Demo Values
- Pump Efficiency: 87.4%
- Production: 38.6 m³/day
- Steam Pressure: 42.8 bar
- Temperature: 287°C
- Stroke: 42.5 in
- SPM: 5.8
- Pump Load: 68.4 kN

These values are demonstration data only.

### 4. Persistent Design Memory
Always preserve:
- Dark industrial theme
- Charcoal/slate panels
- Teal/cyan telemetry
- Amber warnings
- Red critical status
- High-density dashboard
- Professional B2B SaaS appearance
- Digital Twin as the visual centerpiece
- SCADA-inspired workflow
- Clear engineering terminology
- Responsive design

### 5. Persistent Safety/Product Rules
- Never imply demo data is real field telemetry.
- Never send actual industrial control commands from the prototype.
- Optimization controls are simulation/operator-review controls.
- AI recommendations are advisory prototype outputs.
- Real-world deployment requires validated engineering models, cybersecurity, authorization, safety interlocks and appropriate operational approval.

### 6. Definition of Done
A task is complete when:
1. It works in the intended UI.
2. It follows the design system.
3. It responds correctly to selected well/state.
4. It works on desktop and responsive layouts where applicable.
5. It has sensible loading/error/empty behavior.
6. It does not introduce unsafe real-world control behavior.
7. It does not contradict the product memory.
