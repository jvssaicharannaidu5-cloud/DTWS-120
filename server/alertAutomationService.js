/**
 * alertAutomationService.js
 * Evaluates triggers, enforces rate limiting, and manages duplicate alert cooldown.
 */

import { emailService } from './emailService.js';
import { notificationService } from './notificationService.js';

class AlertAutomationService {
  constructor() {
    this.settings = {
      enabled: true,
      recipientEmail: process.env.NOTIFICATION_EMAIL || 'jvssaicharannaidu5@gmail.com',
      criticalAlerts: true,
      pumpAlerts: true,
      steamAlerts: true,
      aiRecommendations: true,
      cssSchedule: true,
      telemetryAlerts: true,
      dailySummary: true
    };

    // Cooldown map: key -> timestamp (epoch ms)
    this.cooldownMap = new Map();
    // 15 minutes default cooldown for the same well & alert type
    this.cooldownDurationMs = parseInt(process.env.ALERT_COOLDOWN_MINUTES || '15', 10) * 60 * 1000;

    // Hourly rate limiter: [epochMs]
    this.hourlyDispatches = [];
    this.maxPerHour = parseInt(process.env.RATE_LIMIT_MAX_PER_HOUR || '60', 10);
  }

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(newSettings) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    return this.getSettings();
  }

  checkRateLimit() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    this.hourlyDispatches = this.hourlyDispatches.filter(ts => ts > oneHourAgo);

    if (this.hourlyDispatches.length >= this.maxPerHour) {
      return false;
    }
    return true;
  }

  isSuppressed(key) {
    const lastSent = this.cooldownMap.get(key);
    if (!lastSent) return false;

    const elapsed = Date.now() - lastSent;
    return elapsed < this.cooldownDurationMs;
  }

  recordCooldown(key) {
    this.cooldownMap.set(key, Date.now());
    this.hourlyDispatches.push(Date.now());
  }

  /**
   * Process event trigger and send email if enabled and not cooled down
   */
  async processEvent({
    eventType,
    wellId = 'BGW-04',
    title,
    severity = 'HIGH',
    confidence = 90,
    parameter,
    currentValue,
    threshold,
    recommendedAction,
    metrics = {},
    recommendationText,
    overrideRecipient,
    targetEmail,
    force = false // bypass cooldown for manual test/dispatch
  }) {
    if (!this.settings.enabled && !force) {
      return { skipped: true, reason: 'Email automation globally disabled in settings' };
    }

    // Check category toggles
    if (eventType === 'CRITICAL_WELL' && !this.settings.criticalAlerts && !force) {
      return { skipped: true, reason: 'Critical Alerts toggle is disabled' };
    }
    if (eventType === 'PUMP_ANOMALY' && !this.settings.pumpAlerts && !force) {
      return { skipped: true, reason: 'Pump Alerts toggle is disabled' };
    }
    if (eventType === 'STEAM_ALERT' && !this.settings.steamAlerts && !force) {
      return { skipped: true, reason: 'Steam Alerts toggle is disabled' };
    }
    if (eventType === 'AI_RECOMMENDATION' && !this.settings.aiRecommendations && !force) {
      return { skipped: true, reason: 'AI Recommendations toggle is disabled' };
    }
    if (eventType === 'CSS_SCHEDULE' && !this.settings.cssSchedule && !force) {
      return { skipped: true, reason: 'CSS Schedule toggle is disabled' };
    }
    if (eventType === 'TELEMETRY_CONNECTION' && !this.settings.telemetryAlerts && !force) {
      return { skipped: true, reason: 'Telemetry Connection Alerts toggle is disabled' };
    }

    // Check Rate Limiting
    if (!this.checkRateLimit()) {
      return { skipped: true, reason: 'Rate limit exceeded (max 60 emails/hour)' };
    }

    // Check Cooldown key: e.g. "BGW-04:CRITICAL_WELL:fluid_pound"
    const dedupeKey = `${wellId}:${eventType}:${title || 'default'}`;
    if (!force && this.isSuppressed(dedupeKey)) {
      const remainingMin = Math.ceil(
        (this.cooldownDurationMs - (Date.now() - this.cooldownMap.get(dedupeKey))) / 60000
      );
      return {
        skipped: true,
        reason: `Duplicate alert suppressed by cooldown (${remainingMin}m remaining for ${dedupeKey})`
      };
    }

    // Prepare template
    let emailPayload;
    const recipient = overrideRecipient || targetEmail || this.settings.recipientEmail || 'jvssaicharannaidu5@gmail.com';
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';

    if (eventType === 'AI_RECOMMENDATION') {
      emailPayload = notificationService.generateRecommendationEmail({
        wellId,
        currentEfficiency: metrics.currentEfficiency || '78.4%',
        predictedEfficiency: metrics.predictedEfficiency || '87.4%',
        currentProduction: metrics.currentProduction || '142.6 bbl/d',
        predictedProduction: metrics.predictedProduction || '151.0 bbl/d',
        energyImpact: metrics.energyImpact || '-4.2 kWh/day',
        recommendation: recommendationText || title || 'Adjust pump kinematics for optimized lift',
        confidence,
        dashboardUrl
      });
    } else {
      emailPayload = notificationService.generateAlertEmail({
        wellId,
        title: title || `${eventType} detected on ${wellId}`,
        severity,
        confidence,
        parameter: parameter || 'Telemetry Bus Sensor Tag',
        currentValue: currentValue || 'Deviation detected',
        threshold: threshold || 'Operating Envelope Limit',
        recommendedAction: recommendedAction || 'Inspect wellhead SCADA telemetry and verify fillage',
        dashboardUrl
      });
    }

    // Dispatch
    const result = await emailService.sendEmail({
      to: recipient,
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
      eventType,
      wellId
    });

    this.recordCooldown(dedupeKey);

    return result;
  }

  async sendDailyDigest(summaryData = {}) {
    if (!this.settings.enabled || !this.settings.dailySummary) {
      return { skipped: true, reason: 'Daily summary digest is disabled' };
    }

    const recipient = this.settings.recipientEmail || 'jvssaicharannaidu5@gmail.com';
    const emailPayload = notificationService.generateDailySummaryEmail({
      ...summaryData,
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000'
    });

    return emailService.sendEmail({
      to: recipient,
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
      eventType: 'DAILY_SUMMARY',
      wellId: 'FIELD_SUMMARY'
    });
  }

  async sendTestEmail(targetEmail) {
    const recipient = targetEmail || this.settings.recipientEmail || 'jvssaicharannaidu5@gmail.com';
    const status = emailService.getStatus();

    const emailPayload = notificationService.generateTestEmail({
      recipient,
      serviceMode: status.serviceMode,
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000'
    });

    return emailService.sendEmail({
      to: recipient,
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
      eventType: 'TEST_EMAIL',
      wellId: 'SYSTEM'
    });
  }
}

export const alertAutomationService = new AlertAutomationService();
