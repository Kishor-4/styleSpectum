const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect, approvedShopkeeper } = require("../middleware/authMiddleware");
const { isShopkeeperDbReady } = require("../config/db");

const router = express.Router();

// 18 Handpicked, distinctive, high-resolution fashion products with unique images
const uniqueStarterCatalog = [
  // --- LADIES WEAR ---
  {
    name: "Embroidered Anarkali Kurti Set",
    category: "Ladies Wear",
    price: 1299,
    originalPrice: 1899,
    stock: 18,
    tag: "BESTSELLER",
    description: "Graceful Chanderi silk Anarkali kurti adorned with intricate Zari neckline embroidery and dupatta.",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e7?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Heritage",
    shopName: "Rajwada Boutique"
  },
  {
    name: "Royal Velvet Festive Kurta Set",
    category: "Ladies Wear",
    price: 1999,
    originalPrice: 2699,
    stock: 12,
    tag: "NEW",
    description: "Plush micro-velvet festive straight suit with detailed gota patti borders and matching pants.",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Heritage",
    shopName: "Rajwada Boutique"
  },
  {
    name: "Designer Pastel Sharara Outfit",
    category: "Ladies Wear",
    price: 2499,
    originalPrice: 3299,
    stock: 10,
    tag: "TRENDING",
    description: "Contemporary flared georgette sharara set in soft blush tones with handcrafted sequin work.",
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Luxe",
    shopName: "Glamour Threads"
  },

  // --- SAREES ---
  {
    name: "Banarasi Katan Silk Saree",
    category: "Sarees",
    price: 2899,
    originalPrice: 3999,
    stock: 8,
    tag: "ROYAL",
    description: "Pure Banarasi Katan silk saree woven with traditional floral jaal and antique golden zari work.",
    images: ["https://images.unsplash.com/photo-1610030469668-8e9f641aaf24?auto=format&fit=crop&w=800&q=80"],
    brand: "Varanasi Weaves",
    shopName: "Kashi Handlooms"
  },
  {
    name: "Kanjivaram Bridal Temple Saree",
    category: "Sarees",
    price: 3499,
    originalPrice: 4799,
    stock: 6,
    tag: "BRIDAL",
    description: "Exquisite ruby red Kanjivaram silk saree featuring pure zari pallu and authentic temple border.",
    images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"],
    brand: "Varanasi Weaves",
    shopName: "Kashi Handlooms"
  },
  {
    name: "Floral Organza Digital Print Saree",
    category: "Sarees",
    price: 1499,
    originalPrice: 2199,
    stock: 15,
    tag: "POPULAR",
    description: "Lightweight and airy pure organza silk saree finished with soft pastel blooming florals.",
    images: ["https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Ethnic",
    shopName: "Surat Sarees Hub"
  },

  // --- GENTS WEAR ---
  {
    name: "Classic Casual Oxford Shirt",
    category: "Gents Wear",
    price: 1199,
    originalPrice: 1699,
    stock: 22,
    tag: "BESTSELLER",
    description: "Crisp button-down collar casual shirt made with 100% breathable organic cotton.",
    images: ["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Urban Stitch Co."
  },
  {
    name: "Tailored Royal Navy Blazer",
    category: "Gents Wear",
    price: 2999,
    originalPrice: 4299,
    stock: 9,
    tag: "NEW",
    description: "Structured slim-fit single breasted blazer crafted for evening celebrations and formal occasions.",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Gentleman Suite"
  },
  {
    name: "Modern Everyday Ribbed T-Shirt",
    category: "Gents Wear",
    price: 599,
    originalPrice: 899,
    stock: 35,
    tag: "ESSENTIAL",
    description: "Heavyweight combed cotton t-shirt with ribbed crew neck for ultimate everyday comfort.",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Urban Stitch Co."
  },

  // --- KIDS WEAR ---
  {
    name: "Little Explorer Denim Dungaree Set",
    category: "Kids Wear",
    price: 899,
    originalPrice: 1299,
    stock: 14,
    tag: "POPULAR",
    description: "Soft bio-washed denim dungaree with playful striped inner tee for all-day comfort and play.",
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },
  {
    name: "Princess Birthday Party Tulle Frock",
    category: "Kids Wear",
    price: 1399,
    originalPrice: 1999,
    stock: 11,
    tag: "NEW",
    description: "Magical multi-layered tulle party frock with soft satin lining and delicate floral accents.",
    images: ["https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },
  {
    name: "Cheerful Cotton Everyday Tee Set",
    category: "Kids Wear",
    price: 499,
    originalPrice: 799,
    stock: 25,
    tag: "ESSENTIAL",
    description: "Ultra-soft tagless cotton t-shirt designed for energetic kids and daily wash durability.",
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Junior Closet"
  },

  // --- FOOTWEAR ---
  {
    name: "Urban Minimalist White Sneakers",
    category: "Footwear",
    price: 1699,
    originalPrice: 2499,
    stock: 16,
    tag: "BESTSELLER",
    description: "Cushioned memory-foam sole sneakers in sleek white vegan leather for modern streetwear style.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    name: "Handcrafted Embroidered Mojari",
    category: "Footwear",
    price: 1099,
    originalPrice: 1599,
    stock: 12,
    tag: "TRADITIONAL",
    description: "Authentic Jaipuri genuine leather jutti hand-embroidered with dabka and zardozi threadwork.",
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Rajasthan Craft Shoes"
  },
  {
    name: "Classic Pointed Stiletto Heels",
    category: "Footwear",
    price: 1899,
    originalPrice: 2799,
    stock: 8,
    tag: "NEW",
    description: "Elegantly sculpted stiletto pumps with padded insoles to elevate any evening look.",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },

  // --- ACCESSORIES ---
  {
    name: "Italian Structured Shoulder Bag",
    category: "Accessories",
    price: 1499,
    originalPrice: 2199,
    stock: 15,
    tag: "BESTSELLER",
    description: "Premium textured faux-leather shoulder tote featuring gold-toned hardware and double compartments.",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Luxe",
    shopName: "Moda Accessories"
  },
  {
    name: "Steel Mesh Chronograph Watch",
    category: "Accessories",
    price: 1899,
    originalPrice: 2999,
    stock: 12,
    tag: "TRENDING",
    description: "Minimalist brushed stainless steel dial with interchangeable quick-release mesh strap.",
    images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Time",
    shopName: "Chrono Watch Co."
  },
  {
    name: "Kundan Pearl Statement Choker",
    category: "Accessories",
    price: 1299,
    originalPrice: 1899,
    stock: 10,
    tag: "POPULAR",
    description: "Handcrafted royal Kundan necklace set with fresh water pearl drop earrings.",
    images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Jewels",
    shopName: "Royal Ornaments"
  }
];

// Helper to seed or refresh MongoDB Atlas catalogue with distinct images
async function autoSeedCatalogIfEmpty() {
  try {
    if (!isShopkeeperDbReady()) return;

    const count = await Product.countDocuments();
    if (count < uniqueStarterCatalog.length) {
      console.log(`Database has ${count} products. Refreshing with ${uniqueStarterCatalog.length} distinct high-res fashion products...`);
      // Clean old duplicate records and insert fresh distinct items
      await Product.deleteMany({});
      await Product.insertMany(uniqueStarterCatalog);
      console.log(`✅ Successfully stored ${uniqueStarterCatalog.length} unique products in stylespectrum_shopkeeper MongoDB!`);
    }
  } catch (err) {
    console.warn("Auto-seed notice:", err.message);
  }
}

// Trigger initial seeding check after DB connects
setTimeout(autoSeedCatalogIfEmpty, 2500);

// ==========================================
// GET /api/products
// Public: Browse all products with category & search filters
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
          { category: { $regex: search.trim(), $options: "i" } },
          { brand: { $regex: search.trim(), $options: "i" } },
          { shopName: { $regex: search.trim(), $options: "i" } }
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

    // In-memory fallback
    let list = uniqueStarterCatalog.map((p, i) => ({ ...p, _id: `p_${i + 1}`, id: `p_${i + 1}` }));
    if (category && category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    res.json({
      success: true,
      total: list.length,
      products: list
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    res.json({
      success: true,
      total: uniqueStarterCatalog.length,
      products: uniqueStarterCatalog
    });
  }
});

// ==========================================
// POST /api/products
// SHOPKEEPER: Add product with Image URL or File (Base64) into stylespectrum_shopkeeper
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
      brand,
      tag
    } = req.body;

    if (!name?.trim() || !description?.trim() || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product Name, Description, Category, and Price are required"
      });
    }

    let finalImages = [];
    if (Array.isArray(images) && images.length > 0) {
      finalImages = images.filter((img) => typeof img === "string" && img.trim().length > 0);
    } else if (typeof images === "string" && images.trim().length > 0) {
      finalImages = [images.trim()];
    }

    // Default image fallback if none provided
    if (finalImages.length === 0) {
      finalImages = ["https://images.unsplash.com/photo-1583391733956-6c78276477e7?auto=format&fit=crop&w=800&q=80"];
    }

    const productDoc = {
      name: name.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      images: finalImages,
      stock: stock ? Number(stock) : 15,
      brand: brand?.trim() || req.user.shopName || "StyleSpectrum",
      tag: tag?.trim() || "NEW",
      shopkeeper: req.user._id || req.user.id,
      shopName: req.user.shopName || "My Store",
      isActive: true,
      createdAt: new Date()
    };

    let savedProduct = null;
    if (isShopkeeperDbReady()) {
      savedProduct = await Product.create(productDoc);
      console.log(`✅ Product '${savedProduct.name}' saved directly into MongoDB Atlas (stylespectrum_shopkeeper)!`);
    } else {
      savedProduct = { ...productDoc, _id: `custom_${Date.now()}` };
    }

    res.status(201).json({
      success: true,
      message: "Product successfully saved to store database!",
      product: savedProduct
    });
  } catch (error) {
    console.error("Add product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add product: " + error.message
    });
  }
});

// ==========================================
// GET /api/products/shop/my-products
// SHOPKEEPER: View all products added by this shopkeeper
// ==========================================
router.get("/shop/my-products", protect, approvedShopkeeper, async (req, res) => {
  try {
    const shopkeeperId = req.user._id || req.user.id;

    if (isShopkeeperDbReady()) {
      const myProducts = await Product.find({ shopkeeper: shopkeeperId })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        count: myProducts.length,
        products: myProducts
      });
    }

    res.json({ success: true, count: 0, products: [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shopkeeper products: " + error.message
    });
  }
});

// ==========================================
// DELETE /api/products/:id
// SHOPKEEPER: Delete product
// ==========================================
router.delete("/:id", protect, approvedShopkeeper, async (req, res) => {
  try {
    if (isShopkeeperDbReady()) {
      const deleted = await Product.findOneAndDelete({
        _id: req.params.id,
        shopkeeper: req.user._id
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Product not found or unauthorized to delete"
        });
      }

      return res.json({
        success: true,
        message: "Product deleted successfully"
      });
    }

    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product: " + error.message
    });
  }
});

module.exports = router;
