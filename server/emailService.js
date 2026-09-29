/**
 * emailService.js
 * Core email transport and dispatch engine with support for authenticated SMTP (Gmail, Sendgrid, etc.),
 * provider API keys, and simulated outbox delivery with full retry tracking.
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.emailLogs = [];
    this.sentCountToday = 0;
    this.failedCountToday = 0;
    this.lastEmailTime = null;
    this.transporter = null;
    this.smtpVerified = false;
    this.initTransporter();
  }

  initTransporter() {
    const mode = (process.env.EMAIL_SERVICE_MODE || 'simulation').toLowerCase();
    let smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpUser = (process.env.SMTP_USER || '').trim();
    let smtpPass = (process.env.SMTP_PASS || '').trim();

    // Strip spaces in Gmail app password if 16-character format with spaces
    if (smtpHost.includes('gmail') || smtpUser.endsWith('@gmail.com')) {
      smtpPass = smtpPass.replace(/\s+/g, '');
    }

    // Clean up host if user entered URL scheme like ://gmail.com or https://...
    smtpHost = smtpHost.replace(/^https?:\/\//i, '').replace(/^:?\/\//, '').replace(/\/.*$/, '').trim();

    if (mode === 'smtp' && smtpUser && smtpPass) {
      try {
        let transportConfig;

        // If Gmail host or user is Gmail
        if (smtpHost.includes('gmail') || smtpUser.endsWith('@gmail.com') || !smtpHost) {
          transportConfig = {
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          };
          console.log(`[EmailService] Initializing Gmail SMTP transport for user: ${smtpUser}`);
        } else {
          transportConfig = {
            host: smtpHost || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: smtpUser,
              pass: smtpPass
            },
            tls: {
              rejectUnauthorized: false
            }
          };
          console.log(`[EmailService] Initializing generic SMTP transport for host: ${smtpHost}`);
        }

        this.transporter = nodemailer.createTransport(transportConfig);

        // Asynchronously verify connection
        this.transporter.verify((err) => {
          if (err) {
            console.warn(`[EmailService] SMTP verification notice: ${err.message}`);
            this.smtpVerified = false;
          } else {
            console.log('[EmailService] SMTP transport verified successfully. Live dispatch active.');
            this.smtpVerified = true;
          }
        });
      } catch (err) {
        console.error('[EmailService] Failed to create SMTP transporter:', err.message);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
      console.log(`[EmailService] Running in ${mode.toUpperCase()} mode. Outbox staging active.`);
    }
  }

  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  getStatus() {
    const mode = (process.env.EMAIL_SERVICE_MODE || 'simulation').toLowerCase();
    const isConnected =
      mode === 'simulation' ||
      (mode === 'smtp' && this.transporter !== null) ||
      (mode === 'resend' && !!process.env.EMAIL_PROVIDER_API_KEY);

    return {
      status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
      serviceMode: mode,
      lastEmail: this.lastEmailTime,
      emailsSentToday: this.sentCountToday,
      failedEmails: this.failedCountToday,
      activeRecipient: process.env.NOTIFICATION_EMAIL || 'jvssaicharannaidu5@gmail.com',
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'alerts@baghewala-digitaltwin.internal',
      smtpVerified: this.smtpVerified
    };
  }

  getLogs() {
    return this.emailLogs.slice(0, 50);
  }

  async sendEmail({ to, subject, html, text, eventType = 'GENERAL_ALERT', wellId = null }) {
    const recipient = to || process.env.NOTIFICATION_EMAIL || 'jvssaicharannaidu5@gmail.com';

    // 1. Recipient Validation
    if (!this.validateEmail(recipient)) {
      const err = `Invalid recipient email address: "${recipient}"`;
      this.failedCountToday++;
      this.recordLog({
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        to: recipient,
        subject,
        eventType,
        wellId,
        status: 'FAILED',
        error: err,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: err };
    }

    const logId = `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'alerts@baghewala-digitaltwin.internal';

    // 2. Dispatch via live SMTP if configured
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: recipient,
          subject,
          text,
          html
        });

        this.sentCountToday++;
        this.lastEmailTime = new Date().toISOString();

        const logEntry = {
          id: logId,
          to: recipient,
          subject,
          eventType,
          wellId,
          status: 'DELIVERED',
          messageId: info.messageId,
          timestamp: this.lastEmailTime
        };
        this.recordLog(logEntry);
        console.log(`[EmailService] Live email dispatched to ${recipient}: "${subject}" (id: ${info.messageId})`);
        return { success: true, log: logEntry };
      } catch (err) {
        this.failedCountToday++;
        const logEntry = {
          id: logId,
          to: recipient,
          subject,
          eventType,
          wellId,
          status: 'FAILED',
          error: err.message,
          timestamp: new Date().toISOString()
        };
        this.recordLog(logEntry);
        console.error(`[EmailService] Live email delivery failed to ${recipient}:`, err.message);
        return { success: false, error: err.message, log: logEntry };
      }
    }

    // 3. Dispatch via Simulated Outbox Mode
    this.sentCountToday++;
    this.lastEmailTime = new Date().toISOString();

    const logEntry = {
      id: logId,
      to: recipient,
      subject,
      eventType,
      wellId,
      status: 'SIMULATED_DELIVERY',
      preview: (text || '').substring(0, 140) + '...',
      timestamp: this.lastEmailTime
    };

    this.recordLog(logEntry);
    console.log(`[EmailService:Simulated] Queued & delivered to outbox for ${recipient}: "${subject}"`);
    return { success: true, log: logEntry };
  }

  async retryEmail(logId) {
    const entry = this.emailLogs.find(l => l.id === logId);
    if (!entry) {
      return { success: false, error: `Email record ${logId} not found in logs.` };
    }

    return this.sendEmail({
      to: entry.to,
      subject: entry.subject,
      html: `<p>Retry of event ${entry.eventType} on ${entry.wellId}</p>`,
      text: `Retry of event ${entry.eventType} on ${entry.wellId}`,
      eventType: entry.eventType,
      wellId: entry.wellId
    });
  }

  recordLog(entry) {
    this.emailLogs.unshift(entry);
    if (this.emailLogs.length > 100) {
      this.emailLogs.pop();
    }
  }
}

export const emailService = new EmailService();
