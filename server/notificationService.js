/**
 * notificationService.js
 * Generates professional industrial HTML and plain-text email templates for DTW-SOP.
 */

export const notificationService = {
  /**
   * Template 1: Critical Well Alert / Anomaly Alert
   */
  generateAlertEmail({
    wellId = 'BGW-04',
    title = 'Incomplete pump fillage / fluid pound signature',
    severity = 'HIGH',
    confidence = 93,
    parameter = 'Dynamometer Fillage / Pump Load',
    currentValue = '44% fillage (84.1 kN load)',
    threshold = '< 55% fillage (> 75 kN load)',
    timestamp = new Date().toISOString(),
    recommendedAction = 'Throttle SPM from 7.4 → 5.2 or initiate CSS cycle',
    dashboardUrl = 'http://localhost:3000'
  }) {
    const isCritical = severity.toUpperCase() === 'CRITICAL' || severity.toUpperCase() === 'HIGH';
    const bannerColor = isCritical ? '#f43f5e' : '#f5a623';
    const bannerText = isCritical ? 'CRITICAL OPERATIONAL ANOMALY' : 'WARNING / ATTENTION REQUIRED';

    const subject = `[DTW-SOP ALERT] ${severity} Alert on ${wellId}: ${title} [SIMULATED]`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090c; color: #d7dee8; margin: 0; padding: 24px; }
    .card { background-color: #10151c; border: 1px solid #243040; border-radius: 8px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
    .header { background-color: #0c1016; padding: 16px 24px; border-bottom: 1px solid #243040; display: flex; align-items: center; justify-content: space-between; }
    .header h2 { margin: 0; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase; color: #8b9bb0; font-family: monospace; }
    .badge { background-color: ${bannerColor}; color: #000; font-weight: bold; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
    .alert-banner { background-color: rgba(${isCritical ? '244,63,94,0.15' : '245,166,35,0.15'}); border-left: 4px solid ${bannerColor}; padding: 14px 20px; }
    .alert-banner h3 { margin: 0 0 6px 0; font-size: 16px; color: ${bannerColor}; font-weight: 600; }
    .content { padding: 24px; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; font-size: 13px; font-family: monospace; }
    .data-table td { padding: 8px 12px; border-bottom: 1px solid #1a2430; }
    .data-table td.label { color: #8b9bb0; width: 40%; }
    .data-table td.val { color: #f5f7f8; font-weight: 600; }
    .action-box { background-color: #0c1016; border: 1px solid #1a8f7c; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
    .action-box h4 { margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #2ee6c7; font-family: monospace; }
    .action-box p { margin: 0; color: #e2e8f0; font-size: 13px; }
    .cta-btn { display: inline-block; background-color: #2ee6c7; color: #07090c; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; font-family: monospace; letter-spacing: 0.08em; }
    .disclaimer { background-color: #07090c; padding: 14px 24px; border-top: 1px solid #243040; font-size: 10px; color: #64748b; font-family: monospace; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>DTW-SOP · BAGHEWALA SCADA BUS</h2>
      <span class="badge">${severity} ALERT</span>
    </div>

    <div class="alert-banner">
      <h3>${title}</h3>
      <div style="font-size: 12px; color: #94a3b8; font-family: monospace;">FIELD: Baghewala (RJ-ON-90/1) · WELL: ${wellId} · TS: ${timestamp}</div>
    </div>

    <div class="content">
      <table class="data-table">
        <tr>
          <td class="label">WELL IDENTIFIER:</td>
          <td class="val">${wellId}</td>
        </tr>
        <tr>
          <td class="label">SEVERITY / CONFIDENCE:</td>
          <td class="val"><span style="color: ${bannerColor};">${severity}</span> (${confidence}% Confidence)</td>
        </tr>
        <tr>
          <td class="label">MONITORED PARAMETER:</td>
          <td class="val">${parameter}</td>
        </tr>
        <tr>
          <td class="label">CURRENT VALUE:</td>
          <td class="val" style="color: ${bannerColor};">${currentValue}</td>
        </tr>
        <tr>
          <td class="label">ALARM THRESHOLD:</td>
          <td class="val">${threshold}</td>
        </tr>
      </table>

      <div class="action-box">
        <h4>AI RECOMMENDED OPERATIONAL ACTION:</h4>
        <p>${recommendedAction}</p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${dashboardUrl}" class="cta-btn">LAUNCH DIGITAL TWIN DASHBOARD →</a>
      </div>
    </div>

    <div class="disclaimer">
      <strong>⚠️ DEMO / SIMULATED TELEMETRY ENVIRONMENT NOTICE:</strong><br>
      This email is generated automatically by the Digital Twin Well-Surface Optimization Platform test harness. Values and events represent simulated telemetry models and do not indicate physical control commands on live oilfield equipment.
    </div>
  </div>
</body>
</html>
    `;

    const text = `[DTW-SOP ALERT] ${severity} Alert on ${wellId}
======================================================
Title: ${title}
Well ID: ${wellId}
Severity: ${severity} (${confidence}% Confidence)
Parameter: ${parameter}
Current Value: ${currentValue}
Threshold: ${threshold}
Timestamp: ${timestamp}

Recommended Action:
${recommendedAction}

View Digital Twin: ${dashboardUrl}

NOTE: DEMO / SIMULATED TELEMETRY ENVIRONMENT`;

    return { subject, html, text };
  },

  /**
   * Template 2: AI Optimization Recommendation
   */
  generateRecommendationEmail({
    wellId = 'BGW-04',
    currentEfficiency = '78.4%',
    predictedEfficiency = '87.4%',
    currentProduction = '142.6 bbl/d',
    predictedProduction = '151.0 bbl/d',
    energyImpact = '-4.2 kWh/day (-3.1%)',
    recommendation = 'Increase SPM from 5.8 → 6.8. Hold choke at 24/64". Defer CSS steam cycle by 14 days.',
    confidence = 86,
    dashboardUrl = 'http://localhost:3000'
  }) {
    const subject = `[DTW-SOP OPTIMIZATION] AI Recommendation for ${wellId} (+8.4 bbl/d predicted) [SIMULATED]`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090c; color: #d7dee8; margin: 0; padding: 24px; }
    .card { background-color: #10151c; border: 1px solid #1a8f7c; border-radius: 8px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 0 30px rgba(46,230,199,0.12); }
    .header { background-color: #0c1016; padding: 16px 24px; border-bottom: 1px solid #243040; display: flex; align-items: center; justify-content: space-between; }
    .header h2 { margin: 0; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; color: #2ee6c7; font-family: monospace; }
    .badge { background-color: #2ee6c7; color: #000; font-weight: bold; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
    .rec-banner { background-color: rgba(46,230,199,0.08); padding: 16px 24px; border-bottom: 1px solid #243040; }
    .rec-banner h3 { margin: 0 0 6px 0; font-size: 17px; color: #f5f7f8; }
    .content { padding: 24px; }
    .metrics-grid { display: table; width: 100%; margin-bottom: 24px; }
    .metric-col { display: table-cell; width: 33.33%; padding: 12px; background-color: #0c1016; border: 1px solid #243040; border-radius: 6px; text-align: center; }
    .metric-title { font-size: 9px; text-transform: uppercase; color: #8b9bb0; font-family: monospace; letter-spacing: 0.08em; }
    .metric-cur { font-size: 11px; color: #64748b; font-family: monospace; text-decoration: line-through; margin-top: 4px; }
    .metric-pred { font-size: 16px; font-weight: bold; color: #2ee6c7; font-family: monospace; margin-top: 2px; }
    .rec-text-box { background-color: #0c1016; border-left: 3px solid #2ee6c7; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px; }
    .rec-text-box p { margin: 0; font-size: 13px; line-height: 1.5; color: #e2e8f0; }
    .cta-btn { display: inline-block; background-color: #2ee6c7; color: #07090c; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; font-family: monospace; letter-spacing: 0.08em; }
    .disclaimer { background-color: #07090c; padding: 14px 24px; border-top: 1px solid #243040; font-size: 10px; color: #64748b; font-family: monospace; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>AI OPTIMIZATION ENGINE · ${wellId}</h2>
      <span class="badge">${confidence}% CONFIDENCE</span>
    </div>

    <div class="rec-banner">
      <h3>Predicted Lift &amp; Surface Efficiency Uplift</h3>
      <div style="font-size: 12px; color: #94a3b8; font-family: monospace;">Model: IPR vs TPC Reservoir Matching · Heavy Oil 15.4° API</div>
    </div>

    <div class="content">
      <div class="metrics-grid">
        <div class="metric-col" style="margin-right: 6px;">
          <div class="metric-title">PUMP EFFICIENCY</div>
          <div class="metric-cur">${currentEfficiency}</div>
          <div class="metric-pred">${predictedEfficiency}</div>
        </div>
        <div class="metric-col" style="margin-right: 6px;">
          <div class="metric-title">OIL PRODUCTION</div>
          <div class="metric-cur">${currentProduction}</div>
          <div class="metric-pred">${predictedProduction}</div>
        </div>
        <div class="metric-col">
          <div class="metric-title">ENERGY IMPACT</div>
          <div class="metric-cur">135 kWh/d</div>
          <div class="metric-pred" style="font-size: 13px; color: #34d399;">${energyImpact}</div>
        </div>
      </div>

      <div class="rec-text-box">
        <div style="font-size: 10px; font-family: monospace; color: #2ee6c7; margin-bottom: 4px; font-weight: bold;">RECOMMENDATION:</div>
        <p>${recommendation}</p>
      </div>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="cta-btn">APPLY TO SIMULATION IN DASHBOARD →</a>
      </div>
    </div>

    <div class="disclaimer">
      <strong>⚠️ SIMULATION DISCLAIMER:</strong> All optimization calculations are predictive estimates derived from reservoir inflow simulations. Applying recommendations in the portal modifies the in-memory simulation only. No real control commands are transmitted to field PLCs.
    </div>
  </div>
</body>
</html>
    `;

    const text = `[DTW-SOP OPTIMIZATION] AI Recommendation for ${wellId}
============================================================
Confidence: ${confidence}%
Efficiency: ${currentEfficiency} → ${predictedEfficiency}
Production: ${currentProduction} → ${predictedProduction}
Energy Impact: ${energyImpact}

Recommendation:
${recommendation}

Review in Digital Twin: ${dashboardUrl}

NOTE: DEMO / SIMULATED TELEMETRY ENVIRONMENT`;

    return { subject, html, text };
  },

  /**
   * Template 3: Daily Field Summary Digest
   */
  generateDailySummaryEmail({
    dateStr = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' }),
    totalWells = 12,
    activeWells = 9,
    criticalWells = 1,
    avgEfficiency = '79.2%',
    totalProduction = '1,684.2 bbl/d',
    steamInjection = '1,840 CWE bbl/d',
    majorAlerts = [
      'BGW-006: Fluid pound and low pump fillage (44%)',
      'BGW-002: Choke backpressure restriction',
      'BGW-010: Cycle Day 27 thermal decay'
    ],
    aiRecommendations = [
      'BGW-004: Increase SPM to 6.8 for +8.4 bbl/d uplift',
      'BGW-002: Open choke to 26/64" to relieve THP by 28 psi'
    ],
    dashboardUrl = 'http://localhost:3000'
  }) {
    const subject = `[DTW-SOP] Daily Field Summary — Baghewala Field (${dateStr}) [SIMULATED]`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090c; color: #d7dee8; margin: 0; padding: 24px; }
    .card { background-color: #10151c; border: 1px solid #243040; border-radius: 8px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
    .header { background-color: #0c1016; padding: 18px 24px; border-bottom: 1px solid #243040; }
    .header h2 { margin: 0; font-size: 14px; letter-spacing: 0.14em; text-transform: uppercase; color: #2ee6c7; font-family: monospace; }
    .header p { margin: 4px 0 0 0; font-size: 11px; color: #8b9bb0; font-family: monospace; }
    .content { padding: 24px; }
    .summary-grid { display: table; width: 100%; margin-bottom: 24px; }
    .summary-cell { display: table-cell; width: 33.33%; padding: 10px; background-color: #0c1016; border: 1px solid #243040; text-align: center; }
    .summary-cell .kpi { font-size: 16px; font-weight: bold; font-family: monospace; color: #f5f7f8; margin-top: 4px; }
    .section-head { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #8b9bb0; font-family: monospace; margin: 20px 0 10px 0; border-bottom: 1px solid #243040; padding-bottom: 4px; }
    .list-item { font-size: 12px; padding: 6px 0; border-bottom: 1px solid #1a2430; color: #cbd5e1; font-family: monospace; }
    .disclaimer { background-color: #07090c; padding: 14px 24px; border-top: 1px solid #243040; font-size: 10px; color: #64748b; font-family: monospace; line-height: 1.5; }
    .cta-btn { display: inline-block; background-color: #2ee6c7; color: #07090c; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>DAILY FIELD OPERATIONS DIGEST</h2>
      <p>BAGHEWALA FIELD (RJ-ON-90/1) · ${dateStr}</p>
    </div>

    <div class="content">
      <div class="summary-grid">
        <div class="summary-cell">
          <div style="font-size: 9px; color: #8b9bb0; font-family: monospace;">TOTAL PRODUCTION</div>
          <div class="kpi" style="color: #2ee6c7;">${totalProduction}</div>
        </div>
        <div class="summary-cell">
          <div style="font-size: 9px; color: #8b9bb0; font-family: monospace;">AVG PUMP η</div>
          <div class="kpi" style="color: #34d399;">${avgEfficiency}</div>
        </div>
        <div class="summary-cell">
          <div style="font-size: 9px; color: #8b9bb0; font-family: monospace;">STEAM INJECTION</div>
          <div class="kpi" style="color: #f5a623;">${steamInjection}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-cell">
          <div style="font-size: 9px; color: #8b9bb0; font-family: monospace;">ACTIVE WELLS</div>
          <div class="kpi">${activeWells} / ${totalWells}</div>
        </div>
        <div class="summary-cell">
          <div style="font-size: 9px; color: #8b9bb0; font-family: monospace;">CRITICAL WELLS</div>
          <div class="kpi" style="color: ${criticalWells > 0 ? '#f43f5e' : '#34d399'};">${criticalWells}</div>
        </div>
        <div class="summary-cell">
          <div style="font-size: 9px; color: #8b9bb0; font-family: monospace;">TARGET ATTAINMENT</div>
          <div class="kpi" style="color: #22d3ee;">80.2%</div>
        </div>
      </div>

      <div class="section-head">MAJOR ANOMALIES &amp; WARNINGS</div>
      ${majorAlerts.map(a => `<div class="list-item">⚠️ ${a}</div>`).join('')}

      <div class="section-head">KEY AI OPTIMIZATION ACTIONS</div>
      ${aiRecommendations.map(r => `<div class="list-item">💡 ${r}</div>`).join('')}

      <div style="text-align: center; margin-top: 24px;">
        <a href="${dashboardUrl}" class="cta-btn">OPEN LIVE SCADA CONSOLE →</a>
      </div>
    </div>

    <div class="disclaimer">
      <strong>⚠️ DEMO / SIMULATED TELEMETRY ENVIRONMENT NOTICE:</strong><br>
      This operational digest was produced automatically by the DTW-SOP simulation platform for operator review.
    </div>
  </div>
</body>
</html>
    `;

    const text = `[DTW-SOP] Daily Field Summary — Baghewala Field
============================================================
Date: ${dateStr}
Total Production: ${totalProduction}
Average Pump Efficiency: ${avgEfficiency}
Steam Injection: ${steamInjection}
Wells: ${activeWells} Active, ${criticalWells} Critical (${totalWells} Total)

Major Anomalies:
${majorAlerts.map(a => `- ${a}`).join('\n')}

AI Recommendations:
${aiRecommendations.map(r => `- ${r}`).join('\n')}

View Dashboard: ${dashboardUrl}`;

    return { subject, html, text };
  },

  /**
   * Template 4: Test Connection Email
   */
  generateTestEmail({
    recipient = 'jvssaicharannaidu5@gmail.com',
    timestamp = new Date().toISOString(),
    serviceMode = 'simulation',
    dashboardUrl = 'http://localhost:3000'
  }) {
    const subject = 'Digital Twin Platform — Email Automation Test [SIMULATED]';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #07090c; color: #d7dee8; margin: 0; padding: 24px; }
    .card { background-color: #10151c; border: 1px solid #2ee6c7; border-radius: 8px; max-width: 550px; margin: 0 auto; overflow: hidden; }
    .header { background-color: #0c1016; padding: 16px 20px; border-bottom: 1px solid #243040; }
    .header h2 { margin: 0; font-size: 13px; color: #2ee6c7; font-family: monospace; letter-spacing: 0.1em; }
    .content { padding: 24px; }
    .badge-ok { display: inline-block; background-color: #34d399; color: #000; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 4px; font-family: monospace; margin-bottom: 16px; }
    .meta-box { background-color: #0c1016; border: 1px solid #243040; border-radius: 4px; padding: 12px; font-family: monospace; font-size: 12px; margin-top: 16px; }
    .disclaimer { background-color: #07090c; padding: 12px 20px; border-top: 1px solid #243040; font-size: 10px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>DTW-SOP · AUTOMATION TEST VERIFICATION</h2>
    </div>
    <div class="content">
      <span class="badge-ok">✓ DISPATCH CHANNEL OPERATIONAL</span>
      <h3 style="margin: 0 0 10px 0; color: #f5f7f8; font-size: 17px;">Email automation is successfully connected to the Digital Twin Well-Surface Optimization Platform.</h3>
      <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
        This test confirms that your notification pipeline is properly configured to dispatch automated alerts, AI recommendations, and CSS schedules to your address.
      </p>

      <div class="meta-box">
        <div><strong>TARGET RECIPIENT:</strong> ${recipient}</div>
        <div><strong>SERVICE MODE:</strong> ${serviceMode.toUpperCase()}</div>
        <div><strong>TIMESTAMP:</strong> ${timestamp}</div>
        <div><strong>ORIGIN:</strong> Baghewala SCADA Digital Twin Host</div>
      </div>
    </div>
    <div class="disclaimer">
      DEMO / SIMULATED TELEMETRY ENVIRONMENT · Baghewala Heavy Oil Field
    </div>
  </div>
</body>
</html>
    `;

    const text = `Digital Twin Platform — Email Automation Test
======================================================
Email automation is successfully connected to the Digital Twin Well-Surface Optimization Platform.

Recipient: ${recipient}
Mode: ${serviceMode}
Timestamp: ${timestamp}
Dashboard: ${dashboardUrl}`;

    return { subject, html, text };
  }
};
