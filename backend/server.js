const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Initialize dual database connections
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Serve static frontend files (ideal for local testing & Render single-service deployment)
app.use(express.static(path.join(__dirname, "../frontend")));

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
  console.log(`===============================================`);
});

module.exports = app;
