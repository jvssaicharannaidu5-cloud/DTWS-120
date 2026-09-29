# Product Requirements Document (PRD)
## Digital Twin Well-Surface Optimization Platform

### 1. Product Overview
The Digital Twin Well-Surface Optimization Platform is a dark-themed, industrial B2B SaaS dashboard for monitoring and optimizing heavy-oil well surface operations at Baghewala Field.

The prototype combines:
- Digital Twin visualization
- Industrial IoT / SCADA-style telemetry
- Sucker Rod Pump (SRP) monitoring
- Cyclic Steam Stimulation (CSS) monitoring and scheduling
- AI predictive analytics
- Anomaly detection
- Surface optimization recommendations
- Well inventory and rapid triage

All prototype telemetry and optimization outputs are simulated/demo data unless a real data source is explicitly integrated.

### 2. Product Goals
1. Provide a single operational view of field and well status.
2. Visualize SRP and CSS processes through an intuitive Digital Twin.
3. Make real-time telemetry easy to interpret.
4. Detect and communicate abnormal operating conditions.
5. Provide AI-assisted surface optimization recommendations.
6. Allow operators to test parameter changes through simulation.
7. Support CSS cycle planning and monitoring.
8. Deliver a polished, presentation-ready industrial interface.

### 3. Target Users
- Petroleum / production engineers
- Field operators
- Well optimization engineers
- Data and automation engineers
- Engineering students and hackathon evaluators
- Supervisors monitoring multiple wells

### 4. Core User Journeys
#### Journey A — Monitor a Well
Open dashboard → select field → select well → inspect Digital Twin → review telemetry → inspect charts → review current alerts.

#### Journey B — Investigate an Anomaly
Receive AI alert → open alert → inspect affected parameter → compare current/historical behavior → review AI explanation → simulate corrective parameter change.

#### Journey C — Optimize Pumping
Select well → open optimization panel → adjust stroke/SPM/pump settings → run simulation → compare current vs optimized KPIs → review recommendation.

#### Journey D — Plan CSS
Select well → open CSS scheduler → define injection, soaking and production periods → review expected impact → save simulated schedule.

### 5. Functional Requirements

#### FR-01 Field and Well Selection
- Provide Baghewala Field selector.
- Provide searchable well inventory.
- Support well IDs BGW-01 through BGW-10.
- Selecting a well updates all dashboard data.

#### FR-02 Well Status
Support:
- Active
- Optimizing
- Purging
- Critical
- Offline

Show status using consistent color and icon conventions.

#### FR-03 Digital Twin
Provide a central 2D/3D technical visualization containing:
- Pumping unit
- SRP
- Rod string
- Wellhead
- Tubing/casing
- Downhole pump
- Steam injection path
- Production path

Provide rotate, zoom, reset, focus and fullscreen controls.

#### FR-04 Telemetry
Display:
- Oil production
- Steam injection
- Pump efficiency
- Stroke length
- SPM
- Pump load
- Wellhead pressure
- Temperature
- Energy consumption

Every KPI should show value, unit, status, trend and optional sparkline.

#### FR-05 Analytics
Provide interactive charts for:
- Stroke displacement
- Load vs position / dynamometer card
- Steam pressure
- Steam temperature
- Injection rate
- CSS cycle duration
- Production forecast

#### FR-06 AI Anomaly Detection
Alerts must contain:
- Alert title
- Severity
- Confidence
- Timestamp
- Well
- Parameter
- Suggested action

Actions:
- Investigate
- Accept recommendation
- Dismiss

#### FR-07 Optimization
Allow simulated changes to:
- Stroke length
- SPM
- Pump speed
- Pump schedule
- Steam injection pressure
- Steam injection rate
- CSS cycle duration
- Soak period
- Production period

Show before/after simulation results.

#### FR-08 AI Recommendations
Provide:
- Recommendation
- Reasoning summary
- Confidence
- Predicted efficiency change
- Predicted production change
- Predicted energy change

#### FR-09 CSS Scheduler
Support visual scheduling of:
1. Steam Injection
2. Soaking
3. Production
4. Monitoring
5. Next Cycle

#### FR-10 Field Overview
Provide interactive well nodes and field KPIs.

#### FR-11 Operations Timeline
Display recent system and operational events chronologically.

#### FR-12 System Health
Show:
- Telemetry connection
- Sensor count
- Data streams
- Last synchronization
- AI model state
- System uptime

#### FR-13 Email Automation
Provide decoupled server-side email dispatching for simulated telemetry alerts:
- Critical Well Alerts (well transitions to CRITICAL or severe fluid pound)
- Pump Load & Fillage Anomalies
- Steam Injection Pressure & Temperature Anomalies
- Pump Efficiency Degradation Alerts
- AI Optimization Recommendations
- CSS Cycle Stage Reminders
- Telemetry Bus Offline/Disconnected Alerts
- Daily Field Summary Digest compilation
- Configurable settings modal with master toggle, category toggles, target recipient (`jvssaicharannaidu5@gmail.com`), test email sender, and outbox logs with retry capability.
- Duplicate suppression (15-minute cooldown) and hourly rate limiting.

#### FR-14 Arise Voice Assistant (Millis AI)
Provide a control-room voice assistant phone-call overlay powered by Millis AI (Agent ID: `-P2gcPI5t_7Djy8toIcp`):
- Persistent `◉ ARISE` trigger in the top navigation bar.
- Centered industrial phone-call overlay modal (520–620px × 700–780px).
- Concentric circular AI avatar orb (`AriseAvatarOrb`) with telemetry motion.
- Live audio spectrum waveform (`AudioWaveformVisualizer`) with dual Web Audio AnalyserNode taps.
- Chronological speech transcript panel with user and Arise messages, live interim typing states, and timestamps.
- Call controls: Mute/unmute microphone, Minimize to dockable floating call bar, Reconnect, and End call.
- Context-aware voice requests for selected well telemetry, pump load, steam trends, active alerts, and AI optimization recommendations.
- Strict security: no private keys in client code; graceful resource cleanup on call termination.

### 6. Non-Functional Requirements
- Responsive desktop-first design
- 1920×1080 optimized
- Tablet and mobile support
- High contrast
- Fast initial render
- Modular React components
- Clear error and empty states
- Accessible interactive controls
- No real-world equipment commands in prototype
- Simulated data clearly identified

### 7. Default State
Field: Baghewala Field
Selected Well: BGW-04
Status: ACTIVE
Pump Efficiency: 87.4%
Production: 38.6 m³/day
Steam Pressure: 42.8 bar
Temperature: 287°C
AI Status: OPERATIONAL

### 8. Success Criteria
The prototype is successful when a user can:
- Select a well
- Understand its current status
- View the Digital Twin
- Read telemetry
- Inspect analytics
- Investigate an anomaly
- Run an optimization simulation
- Review AI recommendations
- Create a simulated CSS schedule
- Navigate the platform without training

### 9. Prototype Boundaries
This product is a demonstration/prototype. It must not imply that simulated values are live field measurements. Real SCADA integration, authenticated control commands, production databases, industrial safety interlocks and validated AI models are outside the initial prototype scope.
