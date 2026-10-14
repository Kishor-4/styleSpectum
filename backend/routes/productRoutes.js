const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect, approvedShopkeeper } = require("../middleware/authMiddleware");
const { isShopkeeperDbReady } = require("../config/db");

const router = express.Router();

const starterSeedProducts = [
  {
    name: "Floral Everyday Kurti",
    category: "Ladies Wear",
    price: 899,
    originalPrice: 1299,
    stock: 15,
    tag: "BESTSELLER",
    description: "A versatile floral kurti made with premium breathable cotton for everyday style.",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Ethnic",
    shopName: "Spectrum Boutique"
  },
  {
    name: "Elegant Occasion Suit",
    category: "Ladies Wear",
    price: 1899,
    originalPrice: 2499,
    stock: 10,
    tag: "NEW",
    description: "An elegant embroidered outfit designed for special occasions and festivities.",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e7?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Ethnic",
    shopName: "Spectrum Boutique"
  },
  {
    name: "Festive Silk Saree",
    category: "Sarees",
    price: 2499,
    originalPrice: 3499,
    stock: 8,
    tag: "NEW",
    description: "A luxurious festive silk saree featuring intricate golden zari border work.",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Royal",
    shopName: "Sharma Sarees Jaipur"
  },
  {
    name: "Traditional Printed Saree",
    category: "Sarees",
    price: 1599,
    originalPrice: 1999,
    stock: 12,
    tag: "POPULAR",
    description: "A timeless handloom printed saree embodying grace in every drape.",
    images: ["https://images.unsplash.com/photo-1610030469668-8e9f641aaf24?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Royal",
    shopName: "Sharma Sarees Jaipur"
  },
  {
    name: "Classic Casual Shirt",
    category: "Gents Wear",
    price: 1199,
    originalPrice: 1699,
    stock: 25,
    tag: "BESTSELLER",
    description: "A clean, slim-fit button-down casual shirt crafted from 100% fine cotton.",
    images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Man",
    shopName: "Urban Stitch Co."
  },
  {
    name: "Little Explorer Outfit",
    category: "Kids Wear",
    price: 799,
    originalPrice: 1099,
    stock: 14,
    tag: "POPULAR",
    description: "A cheerful, durable matching outfit tailored for active play and adventures.",
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Kids",
    shopName: "Junior Wardrobe"
  },
  {
    name: "Everyday Sneakers",
    category: "Footwear",
    price: 1499,
    originalPrice: 2199,
    stock: 15,
    tag: "BESTSELLER",
    description: "Cushioned memory foam sneakers designed for comfort and everyday stride.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Walk",
    shopName: "Footwear Studio"
  },
  {
    name: "Everyday Shoulder Bag",
    category: "Accessories",
    price: 1299,
    originalPrice: 1899,
    stock: 12,
    tag: "BESTSELLER",
    description: "Structured faux-leather shoulder bag with spacious compartments.",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80"],
    brand: "StyleSpectrum Luxe",
    shopName: "Luxe Bags"
  }
];

// Fallback in-memory catalog
let memoryProducts = starterSeedProducts.map((p, idx) => ({
  ...p,
  _id: `prod_${idx + 1}`,
  id: `prod_${idx + 1}`,
  createdAt: new Date().toISOString()
}));

// ==========================================
// GET /api/products
// ==========================================
router.get("/", async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    if (isShopkeeperDbReady()) {
      const filter = { isActive: true };
      if (category && category !== "All") filter.category = category;
      if (search && search.trim()) {
        filter.$or = [
          { name: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
          { category: { $regex: search.trim(), $options: "i" } }
        ];
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
      if (products.length > 0) {
        return res.json({
          success: true,
          total: products.length,
          products
        });
      }
    }

    // In-memory catalog
    let list = memoryProducts.filter((p) => {
      const matchCat = !category || category === "All" || p.category === category;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    return res.json({
      success: true,
      total: list.length,
      products: list
    });
  } catch (error) {
    res.json({
      success: true,
      total: memoryProducts.length,
      products: memoryProducts
    });
  }
});

// ==========================================
// POST /api/products
// ==========================================
router.post("/", protect, approvedShopkeeper, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      images,
      stock,
      brand
    } = req.body;

    if (!name?.trim() || !description?.trim() || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, description, category and price are required"
      });
    }

    const imageArray = Array.isArray(images) && images.length > 0
      ? images
      : typeof images === "string" && images.trim()
      ? [images.trim()]
      : ["https://images.unsplash.com/photo-1583391733956-6c78276477e7?auto=format&fit=crop&w=700&q=80"];

    const newProdData = {
      name: name.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      images: imageArray,
      stock: stock ? Number(stock) : 15,
      brand: brand?.trim() || req.user.shopName || "StyleSpectrum",
      tag: "NEW",
      shopkeeper: req.user._id || req.user.id,
      shopName: req.user.shopName || "My Shop",
      isActive: true,
      createdAt: new Date()
    };

    if (isShopkeeperDbReady()) {
      const dbProduct = await Product.create(newProdData);
      memoryProducts.unshift(dbProduct.toObject());
      return res.status(201).json({
        success: true,
        message: "Product added successfully to MongoDB!",
        product: dbProduct
      });
    }

    // In-memory addition
    const memProd = {
      ...newProdData,
      _id: `prod_${Date.now()}`,
      id: `prod_${Date.now()}`
    };
    memoryProducts.unshift(memProd);

    res.status(201).json({
      success: true,
      message: "Product added successfully to store!",
      product: memProd
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add product: " + error.message
    });
  }
});

// ==========================================
// GET /api/products/:id
// ==========================================
router.get("/:id", async (req, res) => {
  const p = memoryProducts.find(x => x._id === req.params.id || x.id === req.params.id);
  if (p) return res.json({ success: true, product: p });
  res.status(404).json({ success: false, message: "Product not found" });
});

module.exports = router;
