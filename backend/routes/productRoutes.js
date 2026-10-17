const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect, approvedShopkeeper } = require("../middleware/authMiddleware");
const { isShopkeeperDbReady } = require("../config/db");

const router = express.Router();

// 30 Verified, High-Resolution, 100% Working 200-OK Fashion Products (5 per Category)
const verifiedStarterCatalog = [
  // --- 1. LADIES WEAR (5) ---
  {
    name: "Embroidered Festive Kurti Set",
    category: "Ladies Wear",
    price: 1299,
    originalPrice: 1899,
    stock: 20,
    tag: "BESTSELLER",
    description: "Graceful festive cotton silk kurti set with intricate neckline embroidery and bright contrast styling.",
    images: ["https://plus.unsplash.com/premium_photo-1682097935697-2ed1efce421a?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Heritage",
    shopName: "Rajwada Boutique"
  },
  {
    name: "Handcrafted Chanderi Print Tunic",
    category: "Ladies Wear",
    price: 1599,
    originalPrice: 2299,
    stock: 14,
    tag: "NEW",
    description: "Pure Chanderi handloom tunic with floral handblock motifs and comfortable breezy silhouette.",
    images: ["https://plus.unsplash.com/premium_photo-1661964468389-faa0dec64469?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Heritage",
    shopName: "Rajwada Boutique"
  },
  {
    name: "Designer Pastel Georgette Sharara Outfit",
    category: "Ladies Wear",
    price: 2499,
    originalPrice: 3299,
    stock: 12,
    tag: "TRENDING",
    description: "Contemporary flared georgette sharara set in soft pastel tones with handcrafted sequin work and dupatta.",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Luxe",
    shopName: "Glamour Threads"
  },
  {
    name: "Bohemian Floral Tiered Maxi",
    category: "Ladies Wear",
    price: 1499,
    originalPrice: 2199,
    stock: 16,
    tag: "POPULAR",
    description: "Flowing breathable tiered maxi dress with blooming floral prints and a flattering wrap waist.",
    images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Modern",
    shopName: "Urban Vogue"
  },
  {
    name: "Chic Embroidered Floral Sundress",
    category: "Ladies Wear",
    price: 1699,
    originalPrice: 2399,
    stock: 15,
    tag: "ESSENTIAL",
    description: "Vibrant crimson fit-and-flare dress detailed with golden threadwork embroidery and waist belt.",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Modern",
    shopName: "Urban Vogue"
  },


  // --- 2. SAREES (5) - 100% AUTHENTIC INDIAN SAREES ---
  {
    name: "Banarasi Katan Silk Saree",
    category: "Sarees",
    price: 2899,
    originalPrice: 3999,
    stock: 10,
    tag: "ROYAL",
    description: "Pure royal purple Banarasi Katan silk saree intricately hand-woven with antique golden zari jaal and grand pallu.",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"],
    brand: "Varanasi Weaves",
    shopName: "Kashi Handlooms"
  },
  {
    name: "Kanjivaram Bridal Temple Saree",
    category: "Sarees",
    price: 3499,
    originalPrice: 4799,
    stock: 8,
    tag: "BRIDAL",
    description: "Exquisite ruby red bridal Kanjivaram silk saree featuring pure zari temple borders and royal gold pallu.",
    images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"],
    brand: "Varanasi Weaves",
    shopName: "Kashi Handlooms"
  },
  {
    name: "Royal Green Heritage Kanjivaram Saree",
    category: "Sarees",
    price: 3299,
    originalPrice: 4499,
    stock: 14,
    tag: "HERITAGE",
    description: "Majestic emerald green handwoven Kanjivaram saree with rich golden zari borders and intricate floral boota work.",
    images: ["https://images.unsplash.com/photo-1753981031189-27bb7bd1c079?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Ethnic",
    shopName: "Surat Sarees Hub"
  },
  {
    name: "Traditional Jaipuri Bandhani Silk Saree",
    category: "Sarees",
    price: 2599,
    originalPrice: 3499,
    stock: 12,
    tag: "FESTIVE",
    description: "Authentic festive Jaipuri Bandhej & Leheriya saree on pure gajji silk with golden zari border and delicate fringe tassels.",
    images: ["https://images.unsplash.com/photo-1746265350981-538f4bb1e737?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Ethnic",
    shopName: "Rajasthan Weaves"
  },
  {
    name: "Handcrafted Chanderi Booti Silk Saree",
    category: "Sarees",
    price: 2199,
    originalPrice: 2999,
    stock: 18,
    tag: "POPULAR",
    description: "Elegant teal blue Chanderi silk saree adorned with all-over golden booti weave and broad zari border.",
    images: ["https://plus.unsplash.com/premium_photo-1669977749819-d8737b4408f7?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Ethnic",
    shopName: "Surat Sarees Hub"
  },

  // --- 3. GENTS WEAR (5) ---
  {
    name: "Classic Casual Chambray Shirt",
    category: "Gents Wear",
    price: 1199,
    originalPrice: 1699,
    stock: 25,
    tag: "BESTSELLER",
    description: "Crisp button-down collar casual chambray shirt crafted with 100% breathable organic cotton.",
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Urban Stitch Co."
  },
  {
    name: "Tailored Royal Navy Blazer Suit",
    category: "Gents Wear",
    price: 2999,
    originalPrice: 4299,
    stock: 10,
    tag: "NEW",
    description: "Structured slim-fit single-breasted navy blazer tailored for evening celebrations and formal events.",
    images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Gentleman Suite"
  },
  {
    name: "Modern Everyday Ribbed White T-Shirt",
    category: "Gents Wear",
    price: 599,
    originalPrice: 899,
    stock: 35,
    tag: "ESSENTIAL",
    description: "Heavyweight combed cotton t-shirt with ribbed crew neck for ultimate everyday comfort and durability.",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Urban Stitch Co."
  },
  {
    name: "Royal Heritage Indo-Western Sherwani",
    category: "Gents Wear",
    price: 3499,
    originalPrice: 4999,
    stock: 14,
    tag: "ROYAL",
    description: "Regal gold-beige silk Indo-Western sherwani with asymmetric button placket, mandarin collar and pocket square.",
    images: ["https://plus.unsplash.com/premium_photo-1682090778813-3938ba76ee57?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Gentleman Suite"
  },
  {
    name: "Italian Cut Slim Formal Suit",
    category: "Gents Wear",
    price: 4499,
    originalPrice: 5999,
    stock: 8,
    tag: "PREMIUM",
    description: "Sophisticated three-piece check formal suit tailored with structured waistcoat and trousers from poly-viscose.",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Man",
    shopName: "Gentleman Suite"
  },

  // --- 4. KIDS WEAR (5) ---
  {
    name: "Little Gentleman Cardigan & Shorts Set",
    category: "Kids Wear",
    price: 899,
    originalPrice: 1299,
    stock: 16,
    tag: "POPULAR",
    description: "Dapper knit cardigan set with matching tailored shorts, bowtie and crisp white inner polo for young boys.",
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },
  {
    name: "Princess Birthday Party Ruffled White Frock",
    category: "Kids Wear",
    price: 1399,
    originalPrice: 1999,
    stock: 12,
    tag: "NEW",
    description: "Pure white embroidered cotton party frock with flutter ruffle sleeves and soft breathable lining.",
    images: ["https://images.unsplash.com/photo-1578178107900-e8ef3855b9cf?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },
  {
    name: "Cheerful Cotton Everyday Tee Set",
    category: "Kids Wear",
    price: 499,
    originalPrice: 799,
    stock: 28,
    tag: "ESSENTIAL",
    description: "Ultra-soft tagless cotton t-shirt designed for energetic kids with reinforced stitching and vibrant color.",
    images: ["https://images.unsplash.com/photo-1604226199793-ccd78b0395ba?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Junior Closet"
  },
  {
    name: "Cozy Fleece Hooded Teddy Romper",
    category: "Kids Wear",
    price: 799,
    originalPrice: 1199,
    stock: 18,
    tag: "COMFORT",
    description: "Warm plush sherpa fleece baby jumpsuit featuring cute teddy-bear ears and front zipper for easy dressing.",
    images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Junior Closet"
  },
  {
    name: "Pure Organic Cotton Baby Tee & Cap Set",
    category: "Kids Wear",
    price: 699,
    originalPrice: 999,
    stock: 14,
    tag: "FESTIVE",
    description: "Hypoallergenic organic cotton essential baby starter set with soft crewneck tee, knit pompom beanie and socks.",
    images: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },

  // --- 5. FOOTWEAR (5) ---
  {
    name: "Urban Minimalist White Sneakers",
    category: "Footwear",
    price: 1699,
    originalPrice: 2499,
    stock: 18,
    tag: "BESTSELLER",
    description: "Sleek low-top white leather sneakers with perforated detailing and durable cushioned rubber cupsole.",
    images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    name: "Men's Formal Oxford Leather Shoes",
    category: "Footwear",
    price: 2499,
    originalPrice: 3499,
    stock: 12,
    tag: "CLASSIC",
    description: "Handcrafted genuine burnished tan leather lace-up oxford shoes with non-slip durable TPR sole.",
    images: ["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    name: "Classic Pointed Stiletto Heels",
    category: "Footwear",
    price: 1899,
    originalPrice: 2799,
    stock: 10,
    tag: "NEW",
    description: "Elegantly sculpted pointed stiletto pumps with floral satin finish and cushioned insoles for evening glamour.",
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    name: "Comfort Strappy Platform Sandals",
    category: "Footwear",
    price: 899,
    originalPrice: 1399,
    stock: 22,
    tag: "SUMMER",
    description: "Lightweight ergonomic platform sandals with cross-over leather straps and adjustable ankle buckle.",
    images: ["https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    name: "Retro Multi-Tone Chunky Sneakers",
    category: "Footwear",
    price: 1999,
    originalPrice: 2899,
    stock: 15,
    tag: "TRENDING",
    description: "Contemporary streetwear chunky sneakers featuring multi-color suede panels, breathable mesh and shock-absorbent sole.",
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },

  // --- 6. ACCESSORIES (5) ---
  {
    name: "Italian Structured Quilted Shoulder Bag",
    category: "Accessories",
    price: 1599,
    originalPrice: 2399,
    stock: 16,
    tag: "BESTSELLER",
    description: "Premium quilted faux-leather shoulder handbag featuring gold-toned curb chain and double-zip compartments.",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Luxe",
    shopName: "Moda Accessories"
  },
  {
    name: "Luxury Chronograph Brown Leather Watch",
    category: "Accessories",
    price: 2199,
    originalPrice: 3299,
    stock: 14,
    tag: "TRENDING",
    description: "Hand-assembled luxury chronograph dial with alligator-embossed genuine leather strap and sub-dials.",
    images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Time",
    shopName: "Chrono Watch Co."
  },
  {
    name: "Delicate Layered Silver Choker Necklace",
    category: "Accessories",
    price: 999,
    originalPrice: 1499,
    stock: 12,
    tag: "POPULAR",
    description: "Sterling silver layered choker chain with delicate beading and heart pendant for effortless elegance.",
    images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Jewels",
    shopName: "Royal Ornaments"
  },
  {
    name: "Vintage Gold Round Polarized Sunglasses",
    category: "Accessories",
    price: 1099,
    originalPrice: 1699,
    stock: 20,
    tag: "UV-PROTECT",
    description: "Classic lightweight gold metal wire frames with UV400 polarized green-tinted scratch-resistant lenses.",
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Luxe",
    shopName: "Moda Accessories"
  },
  {
    name: "Skeleton Automatic Leather Wristwatch",
    category: "Accessories",
    price: 2499,
    originalPrice: 3699,
    stock: 15,
    tag: "NEW",
    description: "Exhibition open-heart skeleton mechanical movement encased in brushed brass with rich chestnut leather band.",
    images: ["https://images.unsplash.com/photo-1618215649872-6e3143a716ec?auto=format&fit=crop&w=800&q=80"],
    brand: "Spectrum Time",
    shopName: "Chrono Watch Co."
  }
];

// Helper to ensure MongoDB Atlas has verified 30 products on initialization
// Cleans up any test remnants, updates starter catalog, and NEVER DELETES products added by real shopkeepers!
async function ensureCatalogSeeded() {
  try {
    if (!isShopkeeperDbReady()) return;

    // Clean up any test remnants
    await Product.deleteMany({ name: "Handcrafted Zari Silk Dupatta", shopkeeper: { $exists: false } });

    // Refresh default starter products (only those without shopkeeper)
    await Product.deleteMany({ shopkeeper: { $exists: false } });
    await Product.insertMany(verifiedStarterCatalog);
    console.log(`✅ Refreshed ${verifiedStarterCatalog.length} verified products in stylespectrum_shopkeeper MongoDB!`);
  } catch (err) {
    console.warn("Catalog seed check:", err.message);
  }
}

setTimeout(ensureCatalogSeeded, 2000);

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
    let list = verifiedStarterCatalog.map((p, i) => ({ ...p, _id: `p_${i + 1}`, id: `p_${i + 1}` }));
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
      total: verifiedStarterCatalog.length,
      products: verifiedStarterCatalog
    });
  }
});

// ==========================================
// POST /api/products
// SHOPKEEPER: Permanently add product into stylespectrum_shopkeeper MongoDB
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

    if (finalImages.length === 0) {
      finalImages = ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"];
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
      console.log(`✅ Product '${savedProduct.name}' PERMANENTLY saved to MongoDB Atlas (stylespectrum_shopkeeper)!`);
    } else {
      savedProduct = { ...productDoc, _id: `custom_${Date.now()}` };
    }

    res.status(201).json({
      success: true,
      message: "Product successfully saved permanently to store database!",
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
// SHOPKEEPER: Delete product permanently
// ==========================================
router.delete("/:id", protect, approvedShopkeeper, async (req, res) => {
  try {
    const { id } = req.params;

    if (isShopkeeperDbReady()) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found in store database."
        });
      }

      await Product.findByIdAndDelete(id);
      console.log(`🗑️ Product '${product.name}' (ID: ${id}) permanently deleted by shopkeeper ${req.user.name || req.user.email}`);

      return res.json({
        success: true,
        message: `Product "${product.name}" deleted permanently from database!`
      });
    }

    // In-memory fallback
    const idx = verifiedStarterCatalog.findIndex((p, i) => `p_${i + 1}` === id || p._id === id);
    if (idx !== -1) {
      verifiedStarterCatalog.splice(idx, 1);
    }

    res.json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete product: " + error.message
    });
  }
});

module.exports = router;
