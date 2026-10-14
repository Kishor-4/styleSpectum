const mongoose = require("mongoose");
const path = require("path");

// Load .env
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config();

function getDbUri(targetDbName) {
  const baseUri = process.env.MONGODB_URI;
  if (!baseUri || typeof baseUri !== "string") return null;

  if (baseUri.includes("?")) {
    return baseUri.replace(/\/[^/?]+(?=\?)/, `/${targetDbName}`);
  }
  return baseUri.replace(/\/[^/]*$/, `/${targetDbName}`);
}

const customerUri =
  process.env.MONGODB_CUSTOMER_URI || getDbUri("stylespectrum_customer");
const shopkeeperUri =
  process.env.MONGODB_SHOPKEEPER_URI || getDbUri("stylespectrum_shopkeeper");

console.log("Initializing Dual MongoDB Connections...");

const connectionOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000
};

// 1. Customer Database Connection (stylespectrum_customer)
const customerDb = customerUri
  ? mongoose.createConnection(customerUri, connectionOptions)
  : mongoose.createConnection();

customerDb.on("connected", () => {
  console.log("✅ Customer DB Connected successfully: stylespectrum_customer");
});

customerDb.on("error", (err) => {
  console.log("ℹ️  Customer DB Notice (Atlas IP Whitelist pending):", err.message);
});

// 2. Shopkeeper Database Connection (stylespectrum_shopkeeper)
const shopkeeperDb = shopkeeperUri
  ? mongoose.createConnection(shopkeeperUri, connectionOptions)
  : mongoose.createConnection();

shopkeeperDb.on("connected", () => {
  console.log("✅ Shopkeeper DB Connected successfully: stylespectrum_shopkeeper");
});

shopkeeperDb.on("error", (err) => {
  console.log("ℹ️  Shopkeeper DB Notice (Atlas IP Whitelist pending):", err.message);
});

module.exports = {
  customerDb,
  shopkeeperDb,
  isCustomerDbReady: () => customerDb.readyState === 1,
  isShopkeeperDbReady: () => shopkeeperDb.readyState === 1
};
