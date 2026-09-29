/**
 * server/index.js
 * Express REST API for DTW-SOP Email Automation Module.
 * Runs on Port 3001 and handles email triggers, settings, logs, and retries.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { emailService } from './emailService.js';
import { alertAutomationService } from './alertAutomationService.js';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logger (does not log sensitive credentials)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/email')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

/**
 * GET /api/email/status
 * Returns current status of email transport and counters
 */
app.get('/api/email/status', (req, res) => {
  const status = emailService.getStatus();
  const settings = alertAutomationService.getSettings();
  res.json({
    ...status,
    settings
  });
});

/**
 * GET /api/email/settings
 * Returns user-configurable email automation settings
 */
app.get('/api/email/settings', (req, res) => {
  res.json(alertAutomationService.getSettings());
});

/**
 * POST /api/email/settings
 * Updates automation toggles and target recipient
 */
app.post('/api/email/settings', (req, res) => {
  try {
    const updated = alertAutomationService.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/send-test
 * Sends a test verification email
 */
app.post('/api/email/send-test', async (req, res) => {
  try {
    const { targetEmail, recipient } = req.body || {};
    const result = await alertAutomationService.sendTestEmail(targetEmail || recipient);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/trigger-alert
 * Evaluates an operational event and dispatches email if permitted
 */
app.post('/api/email/trigger-alert', async (req, res) => {
  try {
    const eventPayload = req.body || {};
    const result = await alertAutomationService.processEvent(eventPayload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/email/send-digest
 * Dispatches a Daily Field Summary digest email
 */
app.post('/api/email/send-digest', async (req, res) => {
  try {
    const digestData = req.body || {};
    const result = await alertAutomationService.sendDailyDigest(digestData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/email/logs
 * Retrieves the recent email outbox and delivery audit logs
 */
app.get('/api/email/logs', (req, res) => {
  res.json(emailService.getLogs());
});

/**
 * POST /api/email/retry/:id
 * Retries a failed or simulated email log entry
 */
app.post('/api/email/retry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await emailService.retryEmail(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/voice/config
 * Returns public voice agent configuration for Arise Millis Assistant
 */
app.get('/api/voice/config', (req, res) => {
  res.json({
    agentId: process.env.MILLIS_AGENT_ID || '-P2gcPI5t_7Djy8toIcp',
    publicKey: process.env.MILLIS_PUBLIC_KEY || '',
    serviceMode: process.env.MILLIS_PUBLIC_KEY ? 'live' : 'interactive_hybrid',
    status: 'READY'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dtw-sop-backend', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[DTW-SOP Backend] Email Automation Service running`);
  console.log(`[Port] ${PORT}`);
  console.log(`[Mode] ${process.env.EMAIL_SERVICE_MODE || 'simulation'}`);
  console.log(`[Target Email] ${process.env.NOTIFICATION_EMAIL || 'jvssaicharannaidu5@gmail.com'}`);
  console.log(`=======================================================`);
});
