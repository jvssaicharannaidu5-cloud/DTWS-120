/**
 * server/index.js
 * DTW-SOP Backend
 * Email Automation + Voice Agent API
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { emailService } from "./emailService.js";
import { alertAutomationService } from "./alertAutomationService.js";

dotenv.config();

const app = express();

/* -------------------------------------------------------
   CONFIGURATION
------------------------------------------------------- */

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0";

/* -------------------------------------------------------
   MIDDLEWARE
------------------------------------------------------- */

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
      : true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------
   REQUEST LOGGER
------------------------------------------------------- */

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    console.log(`[API] ${req.method} ${req.path}`);
  }

  next();
});

/* =======================================================
   HEALTH CHECK
======================================================= */

app.get("/", (req, res) => {
  res.json({
    service: "DTW-SOP Backend",
    status: "online",
    message: "Digital Twin Well-to-Surface Optimization API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "dtw-sop-backend",
    timestamp: new Date().toISOString(),
  });
});

/* =======================================================
   EMAIL STATUS
======================================================= */

app.get("/api/email/status", (req, res) => {
  try {
    const status = emailService.getStatus();
    const settings = alertAutomationService.getSettings();

    res.status(200).json({
      success: true,
      ...status,
      settings,
    });
  } catch (error) {
    console.error("Email status error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to retrieve email status",
    });
  }
});

/* =======================================================
   EMAIL SETTINGS
======================================================= */

app.get("/api/email/settings", (req, res) => {
  try {
    res.status(200).json(
      alertAutomationService.getSettings()
    );
  } catch (error) {
    console.error("Email settings error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to retrieve email settings",
    });
  }
});

app.post("/api/email/settings", (req, res) => {
  try {
    const updated =
      alertAutomationService.updateSettings(req.body || {});

    res.status(200).json({
      success: true,
      settings: updated,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/* =======================================================
   TEST EMAIL
======================================================= */

app.post("/api/email/send-test", async (req, res) => {
  try {
    const { targetEmail, recipient } = req.body || {};

    const email = targetEmail || recipient;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "targetEmail or recipient is required",
      });
    }

    const result =
      await alertAutomationService.sendTestEmail(email);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Test email error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =======================================================
   TRIGGER ALERT
======================================================= */

app.post("/api/email/trigger-alert", async (req, res) => {
  try {
    const eventPayload = req.body || {};

    const result =
      await alertAutomationService.processEvent(eventPayload);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Alert trigger error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =======================================================
   DAILY DIGEST
======================================================= */

app.post("/api/email/send-digest", async (req, res) => {
  try {
    const digestData = req.body || {};

    const result =
      await alertAutomationService.sendDailyDigest(digestData);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Digest error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =======================================================
   EMAIL LOGS
======================================================= */

app.get("/api/email/logs", (req, res) => {
  try {
    res.status(200).json(emailService.getLogs());
  } catch (error) {
    console.error("Email logs error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to retrieve email logs",
    });
  }
});

/* =======================================================
   RETRY EMAIL
======================================================= */

app.post("/api/email/retry/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await emailService.retryEmail(id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Retry email error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =======================================================
   MILLIS VOICE AGENT CONFIG
======================================================= */

app.get("/api/voice/config", (req, res) => {
  const agentId = process.env.MILLIS_AGENT_ID;

  const publicKey = process.env.MILLIS_PUBLIC_KEY;

  res.status(200).json({
    agentId: agentId || "",
    publicKey: publicKey || "",
    serviceMode: publicKey ? "live" : "interactive_hybrid",
    status: agentId ? "READY" : "NOT_CONFIGURED",
  });
});

/* =======================================================
   404 HANDLER
======================================================= */

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.originalUrl,
  });
});

/* =======================================================
   GLOBAL ERROR HANDLER
======================================================= */

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

/* =======================================================
   SERVER START
======================================================= */

/*
 * IMPORTANT:
 * Only start the HTTP server when running directly.
 *
 * This allows the same file to work with:
 * - Render
 * - Railway
 * - localhost
 * - Vercel/serverless adapters
 */

const isProductionServer =
  process.env.NODE_ENV !== "test" &&
  !process.env.VERCEL;

if (isProductionServer) {
  app.listen(PORT, HOST, () => {
    console.log("==================================================");
    console.log(" DTW-SOP Backend");
    console.log(" Digital Twin Well-to-Surface Optimization");
    console.log("==================================================");
    console.log(`Server: http://${HOST}:${PORT}`);
    console.log(`Port: ${PORT}`);
    console.log(
      `Email Mode: ${process.env.EMAIL_SERVICE_MODE || "simulation"
      }`
    );
    console.log(
      `Notification Email: ${process.env.NOTIFICATION_EMAIL
        ? "configured"
        : "not configured"
      }`
    );
    console.log(
      `Millis Agent: ${process.env.MILLIS_AGENT_ID
        ? "configured"
        : "not configured"
      }`
    );
    console.log("==================================================");
  });
}

/* -------------------------------------------------------
   EXPORT APP
------------------------------------------------------- */

export default app;