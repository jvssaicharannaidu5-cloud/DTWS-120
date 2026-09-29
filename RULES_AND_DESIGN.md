# Rules & Design System
## Digital Twin Well-Surface Optimization Platform

### 1. Core Design Principles
1. Industrial first: the UI must resemble a professional control-room platform.
2. Information density without clutter.
3. Critical information must be visible within seconds.
4. Status should be communicated through color + icon + text, never color alone.
5. Interactions must be predictable.
6. Simulation and real-world control must always be visually distinguished.
7. Maintain consistent spacing, typography and component behavior.

### 2. Color System

```text
Background:
#080B0D  Near Black
#10161A  Charcoal
#151D22  Panel
#1D272D  Elevated Panel

Telemetry:
#20D6C7  Teal
#37E6FF  Cyan

Status:
#36D399  Healthy
#F6C453  Warning
#FF9F43  Purging / Attention
#FF5C5C  Critical
#7D8790  Offline

Text:
#F5F7F8  Primary
#B7C1C7  Secondary
#78858D  Muted

Borders:
#26343B
```

### 3. Typography
Use a modern sans-serif such as Inter, Geist, IBM Plex Sans or equivalent.

Suggested hierarchy:
- Page title: 24–30 px
- Section title: 16–20 px
- KPI number: 22–30 px
- Body: 13–15 px
- Labels: 11–12 px
- Telemetry values: medium/bold weight

Avoid decorative fonts.

### 4. Spacing
Use an 8px spacing system:
- 4px: micro spacing
- 8px: compact
- 16px: standard
- 24px: section spacing
- 32px: major separation

### 5. Cards
Cards should:
- Use dark slate surfaces
- Have subtle borders
- Use 8–12px radius
- Avoid heavy shadows
- Maintain consistent internal padding
- Keep titles aligned

### 6. Dashboard Grid
Desktop layout:
```text
┌────────────┬───────────────────────────────────────┐
│            │ Header                                │
│ Well       ├───────────────────────────────────────┤
│ Inventory  │ Digital Twin / Main Visualization     │
│            │                                       │
│            ├───────────────────────────────────────┤
│            │ Telemetry + Analytics                 │
│            ├───────────────────────┬───────────────┤
│            │ Optimization / AI     │ Alerts        │
└────────────┴───────────────────────┴───────────────┘
```

### 7. Status Rules
ACTIVE:
- Teal/green
- Normal operation icon

OPTIMIZING:
- Cyan
- Optimization icon

PURGING:
- Amber
- Flow/process icon

CRITICAL:
- Red
- Warning icon
- Optional subtle pulse

OFFLINE:
- Gray
- Connection-off icon

### 8. Chart Rules
- Use dark chart backgrounds.
- Use grid lines sparingly.
- Label axes clearly.
- Show units.
- Use tooltips.
- Keep legends compact.
- Highlight anomalies without overwhelming the primary trend.
- Provide time-range controls.

### 9. Digital Twin Rules
The Digital Twin is the primary visual focus.

It must:
- Look technical and engineering-oriented.
- Clearly distinguish surface and downhole components.
- Animate pump/rod movement.
- Show telemetry paths.
- Provide readable labels.
- Support 2D/3D mode.
- Avoid unnecessary photorealism if it reduces performance.

### 10. AI Alert Rules
Every alert must include:
- What happened
- Where it happened
- Severity
- Confidence
- When it happened
- Suggested next step

Do not display unexplained AI scores.

### 11. Optimization Rules
All optimization controls are simulations.

Use labels such as:
- “Simulation”
- “Predicted”
- “Estimated”
- “AI Recommendation”

Never imply that clicking an optimization button directly changes a physical pump.

### 12. Accessibility
- Maintain readable contrast.
- Keyboard-accessible controls.
- Visible focus states.
- Tooltip text for unfamiliar icons.
- Never rely solely on color.
- Use semantic labels for inputs.

### 13. Responsive Rules
Desktop:
- Full sidebar
- Full Digital Twin
- Multi-column analytics

Tablet:
- Collapsible sidebar
- Two-column analytics

Mobile:
- Bottom/slide-out well inventory
- Stacked cards
- Simplified Digital Twin
- Horizontally scrollable charts

### 14. Animation Rules
Use:
- 150–300ms UI transitions
- Smooth telemetry pulses
- Subtle Digital Twin motion
- Chart transitions

Avoid:
- Constant flashing
- Excessive particle effects
- Distracting background animation
- Long blocking animations

### 15. Content Rules
Use concise engineering terminology.

Preferred:
“Pump Efficiency”
“Steam Pressure”
“Load Deviation”
“AI Recommendation”

Avoid:
“Magic AI”
“Guaranteed optimization”
“100% accurate prediction”

### 16. Prototype Data Rule
All demo telemetry must be realistic-looking but clearly treated as simulated data. Never present fabricated values as verified live measurements.

### 17. Email Automation & Security Rules
- Never commit credentials, passwords, app passwords, or API tokens to source control.
- Maintain `.env` in `.gitignore` and distribute `.env.example` with sanitized defaults.
- All email content must prominently state: "DEMO / SIMULATED TELEMETRY ENVIRONMENT".
- Emails must not claim to be physical field events from actual hardware.
- Enforce duplicate-alert suppression (15-minute cooldown per well and anomaly).
- Validate recipient email addresses server-side before queuing or dispatch.
- Keep secret variables isolated to server-side code without `VITE_` prefixes.
