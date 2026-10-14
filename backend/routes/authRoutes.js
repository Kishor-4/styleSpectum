const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Shopkeeper = require("../models/Shopkeeper");
const { isCustomerDbReady, isShopkeeperDbReady } = require("../config/db");

const router = express.Router();

// In-memory fallback registries (guarantees 100% uptime if Atlas IP whitelist is pending)
const memoryCustomers = new Map();
const memoryShopkeepers = new Map();

function createToken(user, role) {
  const secret = process.env.JWT_SECRET || "stylespectrum_fallback_secret_key_2026";
  return jwt.sign(
    {
      id: user._id || user.id,
      role: role || user.role,
      name: user.name,
      email: user.email
    },
    secret,
    { expiresIn: "7d" }
  );
}

// Helper for authMiddleware to look up user
async function getUserById(id, role) {
  if (role === "shopkeeper") {
    if (isShopkeeperDbReady()) {
      try {
        const u = await Shopkeeper.findById(id);
        if (u) return u;
      } catch (err) {}
    }
    return memoryShopkeepers.get(String(id));
  } else {
    if (isCustomerDbReady()) {
      try {
        const u = await Customer.findById(id);
        if (u) return u;
      } catch (err) {}
    }
    return memoryCustomers.get(String(id));
  }
}

// ==========================================
// POST /api/auth/register
// Customer -> stylespectrum_customer
// Shopkeeper -> stylespectrum_shopkeeper
// ==========================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password, role = "customer", shopName, shopAddress } = req.body;

    if (!name?.trim() || !email?.trim() || !mobile?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile and password are required"
      });
    }

    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. SHOPKEEPER REGISTRATION
    if (role === "shopkeeper") {
      if (!shopName?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Shop Name is required for shopkeeper registration"
        });
      }

      // Check DB if connected
      if (isShopkeeperDbReady()) {
        const existing = await Shopkeeper.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: "A shopkeeper account with this email already exists"
          });
        }

        const shopkeeper = await Shopkeeper.create({
          name: name.trim(),
          email: normalizedEmail,
          mobile: mobile.trim(),
          password: hashedPassword,
          shopName: shopName.trim(),
          shopAddress: shopAddress?.trim() || "",
          shopkeeperApproved: true
        });

        // Also keep in cache
        memoryShopkeepers.set(String(shopkeeper._id), shopkeeper);

        const token = createToken(shopkeeper, "shopkeeper");
        return res.status(201).json({
          success: true,
          message: "Shopkeeper account registered successfully!",
          token,
          user: {
            id: shopkeeper._id,
            name: shopkeeper.name,
            email: shopkeeper.email,
            mobile: shopkeeper.mobile,
            role: "shopkeeper",
            shopName: shopkeeper.shopName,
            shopkeeperApproved: true
          }
        });
      }

      // In-Memory Fallback
      for (const s of memoryShopkeepers.values()) {
        if (s.email === normalizedEmail) {
          return res.status(409).json({
            success: false,
            message: "A shopkeeper account with this email already exists"
          });
        }
      }

      const fallbackId = `shop_${Date.now()}`;
      const memShopkeeper = {
        _id: fallbackId,
        id: fallbackId,
        name: name.trim(),
        email: normalizedEmail,
        mobile: mobile.trim(),
        password: hashedPassword,
        role: "shopkeeper",
        shopName: shopName.trim(),
        shopAddress: shopAddress?.trim() || "",
        shopkeeperApproved: true,
        isActive: true
      };
      memoryShopkeepers.set(fallbackId, memShopkeeper);

      const token = createToken(memShopkeeper, "shopkeeper");
      return res.status(201).json({
        success: true,
        message: "Shopkeeper account registered successfully!",
        token,
        user: {
          id: memShopkeeper.id,
          name: memShopkeeper.name,
          email: memShopkeeper.email,
          mobile: memShopkeeper.mobile,
          role: "shopkeeper",
          shopName: memShopkeeper.shopName,
          shopkeeperApproved: true
        }
      });
    }

    // 2. CUSTOMER REGISTRATION
    if (isCustomerDbReady()) {
      const existing = await Customer.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A customer account with this email already exists"
        });
      }

      const customer = await Customer.create({
        name: name.trim(),
        email: normalizedEmail,
        mobile: mobile.trim(),
        password: hashedPassword,
        role: "customer"
      });

      memoryCustomers.set(String(customer._id), customer);

      const token = createToken(customer, "customer");
      return res.status(201).json({
        success: true,
        message: "Customer account created successfully!",
        token,
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          mobile: customer.mobile,
          role: "customer"
        }
      });
    }

    // In-Memory Fallback
    for (const c of memoryCustomers.values()) {
      if (c.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "A customer account with this email already exists"
        });
      }
    }

    const fallbackCustId = `cust_${Date.now()}`;
    const memCustomer = {
      _id: fallbackCustId,
      id: fallbackCustId,
      name: name.trim(),
      email: normalizedEmail,
      mobile: mobile.trim(),
      password: hashedPassword,
      role: "customer",
      isActive: true
    };
    memoryCustomers.set(fallbackCustId, memCustomer);

    const token = createToken(memCustomer, "customer");
    return res.status(201).json({
      success: true,
      message: "Customer account created successfully!",
      token,
      user: {
        id: memCustomer.id,
        name: memCustomer.name,
        email: memCustomer.email,
        mobile: memCustomer.mobile,
        role: "customer"
      }
    });

  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Registration failed: " + error.message
    });
  }
});

// ==========================================
// POST /api/auth/login
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. If role is explicitly 'shopkeeper'
    if (role === "shopkeeper") {
      let s = null;
      if (isShopkeeperDbReady()) {
        s = await Shopkeeper.findOne({ email: normalizedEmail }).select("+password");
      }
      if (!s) {
        for (const val of memoryShopkeepers.values()) {
          if (val.email === normalizedEmail) { s = val; break; }
        }
      }

      if (!s) {
        return res.status(401).json({
          success: false,
          message: "No shopkeeper account found with this email. If you are a customer, please select the 'Customer Login' tab."
        });
      }

      const match = await bcrypt.compare(password, s.password);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password for shopkeeper account."
        });
      }

      const token = createToken(s, "shopkeeper");
      return res.json({
        success: true,
        message: "Shopkeeper login successful",
        token,
        user: {
          id: s._id || s.id,
          name: s.name,
          email: s.email,
          mobile: s.mobile,
          role: "shopkeeper",
          shopName: s.shopName,
          shopkeeperApproved: true
        }
      });
    }

    // 2. If role is explicitly 'customer'
    if (role === "customer") {
      let c = null;
      if (isCustomerDbReady()) {
        c = await Customer.findOne({ email: normalizedEmail }).select("+password");
      }
      if (!c) {
        for (const val of memoryCustomers.values()) {
          if (val.email === normalizedEmail) { c = val; break; }
        }
      }

      if (!c) {
        return res.status(401).json({
          success: false,
          message: "No customer account found with this email. If you are a shopkeeper, please select the 'Shopkeeper Login' tab."
        });
      }

      const match = await bcrypt.compare(password, c.password);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password for customer account."
        });
      }

      const token = createToken(c, "customer");
      return res.json({
        success: true,
        message: "Customer login successful",
        token,
        user: {
          id: c._id || c.id,
          name: c.name,
          email: c.email,
          mobile: c.mobile,
          role: "customer"
        }
      });
    }

    // 3. Fallback if role was omitted
    if (isShopkeeperDbReady()) {
      const s = await Shopkeeper.findOne({ email: normalizedEmail }).select("+password");
      if (s && (await bcrypt.compare(password, s.password))) {
        const token = createToken(s, "shopkeeper");
        return res.json({
          success: true,
          message: "Shopkeeper login successful",
          token,
          user: {
            id: s._id,
            name: s.name,
            email: s.email,
            mobile: s.mobile,
            role: "shopkeeper",
            shopName: s.shopName,
            shopkeeperApproved: true
          }
        });
      }
    }

    if (isCustomerDbReady()) {
      const c = await Customer.findOne({ email: normalizedEmail }).select("+password");
      if (c && (await bcrypt.compare(password, c.password))) {
        const token = createToken(c, "customer");
        return res.json({
          success: true,
          message: "Customer login successful",
          token,
          user: {
            id: c._id,
            name: c.name,
            email: c.email,
            mobile: c.mobile,
            role: "customer"
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed: " + error.message
    });
  }
});

module.exports = router;
module.exports.getUserById = getUserById;
