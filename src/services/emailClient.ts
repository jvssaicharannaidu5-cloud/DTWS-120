/**
 * emailClient.ts
 * Frontend API client communicating with backend email automation service.
 * Never stores or exposes secret API keys on the client side.
 */

export interface EmailSettings {
  enabled: boolean;
  recipientEmail: string;
  criticalAlerts: boolean;
  pumpAlerts: boolean;
  steamAlerts: boolean;
  aiRecommendations: boolean;
  cssSchedule: boolean;
  telemetryAlerts: boolean;
  dailySummary: boolean;
}

export interface EmailStatusResponse {
  status: 'CONNECTED' | 'DISCONNECTED';
  serviceMode: 'simulation' | 'smtp' | 'resend' | string;
  lastEmail: string | null;
  emailsSentToday: number;
  failedEmails: number;
  activeRecipient: string;
  fromAddress: string;
  settings: EmailSettings;
}

export interface EmailLogEntry {
  id: string;
  to: string;
  subject: string;
  eventType: string;
  wellId?: string;
  status: 'DELIVERED' | 'SIMULATED_DELIVERY' | 'FAILED';
  error?: string;
  preview?: string;
  timestamp: string;
}

export interface TriggerAlertPayload {
  eventType:
    | 'CRITICAL_WELL'
    | 'PUMP_ANOMALY'
    | 'STEAM_ALERT'
    | 'PUMP_EFFICIENCY'
    | 'AI_RECOMMENDATION'
    | 'CSS_SCHEDULE'
    | 'TELEMETRY_CONNECTION';
  wellId?: string;
  title: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MED' | 'LOW' | 'WARNING' | 'INFO';
  confidence?: number;
  parameter?: string;
  currentValue?: string;
  threshold?: string;
  recommendedAction?: string;
  metrics?: {
    currentEfficiency?: string;
    predictedEfficiency?: string;
    currentProduction?: string;
    predictedProduction?: string;
    energyImpact?: string;
  };
  recommendationText?: string;
  force?: boolean;
}

export const emailClient = {
  async getStatus(): Promise<EmailStatusResponse> {
    try {
      const res = await fetch('/api/email/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[emailClient] Failed to fetch email status:', err);
      return {
        status: 'CONNECTED',
        serviceMode: 'simulation',
        lastEmail: null,
        emailsSentToday: 0,
        failedEmails: 0,
        activeRecipient: 'jvssaicharannaidu5@gmail.com',
        fromAddress: 'alerts@baghewala-digitaltwin.internal',
        settings: {
          enabled: true,
          recipientEmail: 'jvssaicharannaidu5@gmail.com',
          criticalAlerts: true,
          pumpAlerts: true,
          steamAlerts: true,
          aiRecommendations: true,
          cssSchedule: true,
          telemetryAlerts: true,
          dailySummary: true
        }
      };
    }
  },

  async updateSettings(settings: Partial<EmailSettings>): Promise<{ success: boolean; settings?: EmailSettings }> {
    try {
      const res = await fetch('/api/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false };
    }
  },

  async sendTestEmail(targetEmail?: string): Promise<{ success: boolean; error?: string; log?: EmailLogEntry }> {
    try {
      const res = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async triggerAlert(payload: TriggerAlertPayload): Promise<{ success?: boolean; skipped?: boolean; reason?: string; error?: string; log?: EmailLogEntry }> {
    try {
      const res = await fetch('/api/email/trigger-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async sendDailyDigest(summaryData: any): Promise<{ success?: boolean; skipped?: boolean; reason?: string; error?: string }> {
    try {
      const res = await fetch('/api/email/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summaryData)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getLogs(): Promise<EmailLogEntry[]> {
    try {
      const res = await fetch('/api/email/logs');
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async retryEmail(logId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/email/retry/${logId}`, {
        method: 'POST'
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
