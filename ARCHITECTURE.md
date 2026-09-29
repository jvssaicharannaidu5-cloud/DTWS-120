# System Architecture
## Digital Twin Well-Surface Optimization Platform

### 1. Architecture Overview

The application follows a modular frontend architecture with a clear separation between:
- Presentation/UI
- Visualization
- Application state
- Simulation/data services
- Analytics
- AI recommendation logic
- Configuration

Suggested stack:
- React
- TypeScript
- Vite or equivalent
- Tailwind CSS
- Recharts
- Three.js / React Three Fiber
- Lucide React
- Optional lightweight state manager such as Zustand

### 2. High-Level Architecture

```text
User
  |
  v
Responsive Web UI
  |
  +-------------------------+
  |                         |
  v                         v
Dashboard Shell         Navigation / Filters
  |
  +------------------------------------------------+
  |            |             |          |           |
  v            v             v          v           v
Digital Twin  Telemetry   Analytics   AI Engine   Scheduler
  |            |             |          |           |
  +------------+-------------+----------+-----------+
                       |
                       v
                Simulation/Data Layer
                       |
             +---------+----------+
             |                    |
             v                    v
        Well Dataset       Generated Telemetry
```

### 3. Recommended Project Structure

```text
src/
├── app/
│   ├── App.tsx
│   └── routes/
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── wells/
│   ├── digital-twin/
│   ├── telemetry/
│   ├── analytics/
│   ├── alerts/
│   ├── optimization/
│   ├── scheduler/
│   └── timeline/
├── data/
│   ├── wells.ts
│   ├── telemetry.ts
│   ├── alerts.ts
│   └── cssCycles.ts
├── services/
│   ├── simulationService.ts
│   ├── anomalyService.ts
│   └── optimizationService.ts
├── state/
│   └── dashboardStore.ts
├── types/
│   └── index.ts
├── utils/
│   ├── calculations.ts
│   └── formatting.ts
├── styles/
│   └── globals.css
└── assets/
```

### 4. Core Data Models

#### Well
```ts
type WellStatus =
  | "ACTIVE"
  | "OPTIMIZING"
  | "PURGING"
  | "CRITICAL"
  | "OFFLINE";

interface Well {
  id: string;
  name: string;
  status: WellStatus;
  productionRate: number;
  pumpEfficiency: number;
  wellheadPressure: number;
  temperature: number;
  steamPressure: number;
}
```

#### Telemetry
```ts
interface Telemetry {
  timestamp: string;
  strokeLength: number;
  spm: number;
  pumpLoad: number;
  productionRate: number;
  wellheadPressure: number;
  steamPressure: number;
  temperature: number;
  energyConsumption: number;
}
```

#### Alert
```ts
interface Alert {
  id: string;
  wellId: string;
  title: string;
  severity: "INFO" | "MODERATE" | "WARNING" | "CRITICAL";
  confidence: number;
  timestamp: string;
  parameter: string;
  recommendation: string;
}
```

### 5. State Management

Global state should include:
- Selected well
- Selected time range
- Well filters
- Active alerts
- Digital Twin mode
- Telemetry snapshot
- Optimization parameters
- CSS schedule
- UI panel states

Keep component-local state for purely visual interactions where possible.

### 6. Data Flow

```text
Well Selection
     ↓
Dashboard Store
     ↓
Selected Well
     ↓
Telemetry + Analytics + Digital Twin + Alerts
     ↓
User Optimization Change
     ↓
Simulation Service
     ↓
Before/After Results
     ↓
AI Recommendation
```

### 7. Digital Twin Architecture
Use React Three Fiber / Three.js where practical.

Components:
- PumpingUnit
- RodString
- Wellhead
- Wellbore
- DownholePump
- SteamPath
- ProductionPath
- TelemetryLabels
- TwinControls

Use animation driven by a normalized pump-cycle value rather than real equipment commands.

### 8. Analytics Architecture
Recharts or equivalent should handle:
- Time-series charts
- Area/forecast charts
- Line charts
- Scatter/closed-loop dynamometer chart

Chart data must be derived from the same selected well state to prevent inconsistent views.

### 9. Simulation Layer
Simulation functions should accept current parameters and return predicted demo values.

Example:

```text
simulateOptimization(currentTelemetry, parameters)
        ↓
predictedEfficiency
predictedProduction
predictedEnergy
confidence
```

Never send simulation values to real industrial equipment.

### 10. AI Layer
Prototype AI can be deterministic/rule-based or mocked.

Example:
```text
IF pumpLoadDeviation > threshold
THEN create warning anomaly.

IF steamPressureVariance > threshold
THEN create steam instability alert.

IF efficiencyTrend < threshold
THEN create degradation insight.
```

The UI should label prototype AI outputs as simulated/demo intelligence when appropriate.

### 11. Security and Safety Architecture
- No real control commands in prototype.
- No secrets in frontend source.
- Validate user inputs.
- Sanitize displayed text.
- Keep industrial control integration out of demo scope.
- Separate visualization/simulation from any future control layer.

### 12. Future Production Architecture

```text
Sensors / SCADA
      ↓
Industrial Gateway
      ↓
Secure Data Ingestion
      ↓
Time-Series Database
      ↓
Analytics / ML Services
      ↓
Digital Twin API
      ↓
Web Application
```

A future control system must use authenticated APIs, authorization, audit logging, safety interlocks and industrial cybersecurity controls.

### 13. Email Automation Architecture

The Email Automation Module connects the frontend telemetry loop to a decoupled server-side notification engine.

```text
React Frontend (Vite)
       ↓  POST /api/email/trigger-alert (via proxy)
Express Backend API (Port 3001)
       ↓
Alert Automation Service
  ├── Cooldown Manager (15-min duplicate suppression per well:alert)
  ├── Rate Limiter (Max 60 emails/hr)
  └── Notification Service (Industrial HTML/Text Templates)
       ↓
Email Transport Service
  ├── Mode: Simulation (Outbox staging & audit log)
  ├── Mode: Authenticated SMTP (Nodemailer)
  └── Mode: Provider API (Resend / SendGrid)
       ↓
Target Recipient (jvssaicharannaidu5@gmail.com)
```

Security Rules Enforced:
- No email credentials or private tokens exposed to the client or browser bundle.
- `.env` gitignored, `.env.example` provided for configuration.
- Rate limiting and cooldown prevent alert spamming.
- In-memory audit logs support message preview and operator retries.

### 14. Arise Voice Assistant & Millis Voice Integration

The Arise Voice Assistant provides a high-fidelity control-room voice experience powered by the Millis Voice Agent.

```text
Dashboard / TopNav ("◉ ARISE")
       ↓
AriseVoiceModal (580px × 750px control-room overlay)
  ├── AriseAvatarOrb (telemetry reticles, state-reactive rings)
  ├── AudioWaveformVisualizer (Canvas-based Web Audio analyser tap)
  ├── Live Transcript Panel (YOU / ARISE messages & streaming text)
  └── Call Controls & Timer (Mic toggle, Minimize, End call)
       ↓
millisVoiceService
  ├── Millis AI SDK Session (Agent ID: -P2gcPI5t_7Djy8toIcp)
  ├── Web Audio API (MediaStreamSource -> AnalyserNode FFT)
  ├── Speech Recognition & Synthesis Engine
  └── Baghewala Field Knowledge Base (Telemetry, SRP, CSS, Alerts)
       ↓
MinimizedCallBar (Floating compact call dock with live audio wave)
```

Security & Boundary Rules:
- Agent ID `-P2gcPI5t_7Djy8toIcp` is configured server-side with `/api/voice/config`.
- Never expose private API keys or auth tokens in client-side code.
- Operates under the simulation boundary: clearly labels advisory responses and simulated telemetry.
- Cleans up all microphone streams and AudioContext resources immediately on call end.

