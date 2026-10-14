const mongoose = require("mongoose");
const { shopkeeperDb } = require("../config/db");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Ladies Wear",
        "Sarees",
        "Gents Wear",
        "Kids Wear",
        "Footwear",
        "Accessories"
      ]
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    sizes: {
      type: [String],
      default: []
    },
    colors: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      required: true,
      default: 10,
      min: 0
    },
    brand: {
      type: String,
      default: "StyleSpectrum"
    },
    tag: {
      type: String,
      default: "NEW"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shopkeeper"
    },
    shopName: {
      type: String,
      default: "StyleSpectrum Direct"
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });

module.exports = shopkeeperDb.model("Product", productSchema);
