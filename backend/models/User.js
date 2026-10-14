
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
      trim: true,
      default: ""
    },

    password: {
      type: String,
      required: true,
      select: false
    },

role: {
  type: String,
  enum: ["customer", "shopkeeper", "admin"],
  default: "customer",
  required: true
},

    shopName: {
      type: String,
      trim: true,
      default: ""
    },

    shopkeeperApproved: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model("User", userSchema);
