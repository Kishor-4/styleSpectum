const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
require("dotenv").config();

// Initialize dual database connections
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable gzip compression for ultra-fast asset delivery
app.use(compression());

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Ultra-fast lightweight ping endpoint (Used by keep-alive pinger, cron, UptimeRobot)
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Serve static frontend files with caching for lightning-fast loads
app.use(
  express.static(path.join(__dirname, "../frontend"), {
    maxAge: 0,
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    }
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StyleSpectrum API is running with dual MongoDB databases",
    databases: {
      customerDb: "stylespectrum_customer",
      shopkeeperDb: "stylespectrum_shopkeeper"
    }
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Fallback to frontend index.html for client-side navigation (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.path} not found`
    });
  }
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start Express HTTP Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  StyleSpectrum Server running on port ${PORT}`);
  console.log(`  Frontend: http://localhost:${PORT}`);
  console.log(`  Health API: http://localhost:${PORT}/api/health`);
  console.log(`  Ping API: http://localhost:${PORT}/ping`);
  console.log(`===============================================`);

  // Auto Keep-Alive for Render (Prevents Free Tier 15-minute Sleep / Cold Starts)
  const renderAppUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://stylespectrum-store.onrender.com"
      : null);

  if (renderAppUrl && process.env.NODE_ENV === "production") {
    const PING_INTERVAL = 10 * 60 * 1000; // Every 10 minutes (Render sleeps after 15 min)
    const cleanUrl = renderAppUrl.replace(/\/$/, "");
    console.log(`⚡ Keep-Alive auto-pinger initialized for: ${cleanUrl}/ping`);

    setInterval(async () => {
      try {
        const pingEndpoint = `${cleanUrl}/ping`;
        const res = await fetch(pingEndpoint);
        if (res.ok) {
          console.log(`[Keep-Alive] Self-ping successful to prevent Render sleep (Status: ${res.status})`);
        }
      } catch (err) {
        console.warn(`[Keep-Alive] Ping notice:`, err.message);
      }
    }, PING_INTERVAL);
  }
});

module.exports = app;
