# Digital Twin Well-Surface Optimization Platform

A next-generation industrial SaaS web platform designed for upstream oil & gas production operations. It couples real-time 3D subsurface and surface digital twin physics, automated telemetry monitoring, secure event-driven email automation, and a voice-interactive AI control room copilot (**Arise** powered by Millis AI).

![Digital Twin Overview](https://img.shields.io/badge/Platform-Digital%20Twin-blue)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61dafb)
![Three.js](https://img.shields.io/badge/3D%20Graphics-Three.js-black)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green)
![Voice](https://img.shields.io/badge/Voice%20AI-Millis%20AI-purple)

---

## 🌟 Key Features

### 1. Real-Time 3D Digital Twin Visualizer
- High-fidelity **Three.js** interactive 3D rendering of wellhead, subsurface casing, pump assemblies, and surface flowlines.
- Interactive component inspection: well casing, progressive cavity/rod pump, steam injection manifolds, choke valves, and separator lines.
- Dynamic color-coded status overlays based on live telemetry (Operational, Warning, Critical).

### 2. Live Telemetry & Supervisory Control
- Real-time physics simulation of bottomhole pressure, surface wellhead pressure, pump speed (SPM), pump load, motor temperature, and water cut.
- Interactive setpoint tuning for choke valve position, target pump RPM, and steam injection rates.
- Instant feedback loop showing dynamic recovery rates and artificial lift performance.

### 3. Secure Event-Driven Email Automation
- Dedicated server-side notification engine with **Nodemailer** integration.
- Automated instant alerts for:
  - **Critical Well Status** (emergency shut-in or severe deviation)
  - **Pump Load Anomalies** (overload or underload rod pump conditions)
  - **Steam Pressure Surges & Drops**
  - **Pump Efficiency Degradation** (< 65% mechanical efficiency)
  - **AI Optimization Recommendations** (high-impact energy or production gains)
- Secure credential isolation via `.env` environment variables (no hardcoded secrets or credentials).

### 4. Arise Voice Assistant (Millis Voice AI)
- High-fidelity industrial operations control-room voice assistant modal overlay.
- Powered by **Millis AI Web SDK** with dedicated industrial well-surface domain knowledge base.
- Features:
  - Live audio waveform visualizer and voice activity indicators.
  - Real-time speech-to-text transcript and voice response playback.
  - Background call minimization dock to allow simultaneous dashboard navigation.
  - Hands-free field operations advisory for well diagnostics and setpoint adjustments.

---

## 🏗️ Architecture

```
├── server/                          # Express backend & automation services
│   ├── index.js                     # Server entry point (port 3001)
│   ├── emailService.js              # Nodemailer transport & HTML email templates
│   ├── alertAutomationService.js    # Rule engine detecting critical deviations
│   └── notificationService.js       # In-memory logging & notification dispatch
├── src/                             # React 18 + TypeScript frontend
│   ├── components/
│   │   ├── 3d/                      # Three.js Digital Twin canvas & models
│   │   ├── dashboard/               # KPI cards, telemetry charts, well selector
│   │   ├── controls/                # Surface choke & pump speed actuators
│   │   ├── email/                   # Email automation test & history drawer
│   │   └── voice/                   # Arise phone-call modal, waveform, avatar orb
│   ├── services/
│   │   ├── digitalTwinEngine.ts     # Physics simulation & telemetry stream
│   │   ├── emailClientService.ts    # Frontend API client for alerts
│   │   └── millisVoiceService.ts    # Millis AI Web SDK real-time audio bridge
│   ├── types/                       # TypeScript interfaces for telemetry & alerts
│   ├── App.tsx                      # Root dashboard orchestration
│   └── main.tsx                     # React DOM entry
└── .env.example                     # Environment variables template
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd digital-twin-well-surface-optimization
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your SMTP details (optional for development, as mock/fallback mode is supported):
   ```env
   # Server Port
   PORT=3001

   # SMTP Configuration (e.g. Gmail App Password)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM="Digital Twin Operations <your-email@gmail.com>"
   ALERT_RECIPIENT_EMAIL=your-recipient@gmail.com

   # Millis Voice AI Integration
   VITE_MILLIS_AGENT_ID=-P2gcPI5t_7Djy8toIcp
   ```

4. **Run the Development Server:**
   Launch both the Express backend API and the Vite frontend concurrently:
   ```bash
   npm run dev:all
   ```
   - **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🔒 Security Best Practices

- All email credentials (`SMTP_PASS`), API keys, and sensitive tokens are confined to the backend `.env` file.
- `.env` is permanently excluded via `.gitignore` to prevent secret leakage.
- Frontend communicates with the backend alert dispatcher via secure internal endpoints (`/api/alerts/notify`, `/api/alerts/test-email`).

---

## 🧪 Build & Verification

To verify TypeScript types and build the production bundle:
```bash
npm run build
```
This produces an optimized production bundle inside `dist/`.

---

## 📄 License
MIT License. Industrial and research use authorized.
