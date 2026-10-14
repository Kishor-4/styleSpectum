const mongoose = require("mongoose");
const { shopkeeperDb } = require("../config/db");

const shopkeeperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      default: "shopkeeper",
      immutable: true
    },
    shopName: {
      type: String,
      required: true,
      trim: true
    },
    shopAddress: {
      type: String,
      default: "",
      trim: true
    },
    shopkeeperApproved: {
      type: Boolean,
      default: true // Auto-approved for immediate access and product creation
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = shopkeeperDb.model("Shopkeeper", shopkeeperSchema);
