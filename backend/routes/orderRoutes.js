const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const { protect, approvedShopkeeper } = require("../middleware/authMiddleware");
const { isCustomerDbReady } = require("../config/db");

const router = express.Router();

// In-memory fallback if needed
const memoryOrders = [];

// ==========================================
// POST /api/orders
// Customer places a new order -> Stored in stylespectrum_customer MongoDB
// ==========================================
router.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = "COD", totalAmount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item"
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.mobile?.trim() ||
      !shippingAddress.addressLine?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address (Full Name, Mobile, Address, City, Pincode) is required"
      });
    }

    const calculatedTotal = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
      0
    );

    const finalAmount = totalAmount ? Number(totalAmount) : calculatedTotal;
    const uniqueOrderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderPayload = {
      orderId: uniqueOrderId,
      customer: req.user._id || req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerMobile: req.user.mobile,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        mobile: shippingAddress.mobile.trim(),
        addressLine: shippingAddress.addressLine.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state?.trim() || "India",
        pincode: shippingAddress.pincode.trim()
      },
      items: items.map((item) => ({
        productId: item.productId || item.id || "item",
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty) || 1,
        image: item.image || "",
        category: item.category || "",
        shopName: item.shopName || "StyleSpectrum"
      })),
      totalAmount: finalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Confirmed",
      createdAt: new Date()
    };

    let createdOrder = null;

    if (isCustomerDbReady()) {
      createdOrder = await Order.create(orderPayload);
      console.log(`✅ Order ${uniqueOrderId} saved directly to MongoDB Atlas (stylespectrum_customer)`);

      // Clear customer's active cart in MongoDB database
      try {
        const Customer = require("../models/Customer");
        await Customer.findByIdAndUpdate(req.user._id || req.user.id, { $set: { cart: [] } });
      } catch (e) {
        console.warn("Could not clear customer cart in DB:", e.message);
      }

      // Decrement product inventory in stylespectrum_shopkeeper database
      try {
        const Product = require("../models/Product");
        for (const item of items) {
          const pId = item.productId || item.id;
          if (pId && mongoose.isValidObjectId(pId)) {
            await Product.findByIdAndUpdate(pId, {
              $inc: { stock: -Math.max(1, Number(item.qty) || 1) }
            });
          }
        }
      } catch (e) {
        console.warn("Could not decrement product stock:", e.message);
      }
    } else {
      createdOrder = orderPayload;
      memoryOrders.unshift(orderPayload);
    }

    res.status(201).json({
      success: true,
      message: `Order placed successfully! ID: ${uniqueOrderId}`,
      order: createdOrder
    });
  } catch (error) {
    console.error("Place order error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to place order: " + error.message
    });
  }
});

// ==========================================
// GET /api/orders/my-orders
// Customer views their own orders
// ==========================================
router.get("/my-orders", protect, async (req, res) => {
  try {
    const custId = req.user._id || req.user.id;

    if (isCustomerDbReady()) {
      const orders = await Order.find({ customer: custId })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        count: orders.length,
        orders
      });
    }

    const userOrders = memoryOrders.filter(
      (o) => String(o.customer) === String(custId)
    );

    res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (error) {
    console.error("Customer orders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders: " + error.message
    });
  }
});

// ==========================================
// GET /api/orders/shop/all-orders
// SHOPKEEPER DASHBOARD: Shopkeeper views ALL customer orders received!
// ==========================================
router.get("/shop/all-orders", protect, approvedShopkeeper, async (req, res) => {
  try {
    if (isCustomerDbReady()) {
      const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        count: orders.length,
        orders
      });
    }

    res.json({
      success: true,
      count: memoryOrders.length,
      orders: memoryOrders
    });
  } catch (error) {
    console.error("Shopkeeper get all orders error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders: " + error.message
    });
  }
});

// ==========================================
// PATCH /api/orders/status/:id
// SHOPKEEPER: Updates order status (e.g. Confirmed -> Shipped -> Delivered)
// ==========================================
router.patch("/status/:id", protect, approvedShopkeeper, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    if (isCustomerDbReady()) {
      const query = mongoose.isValidObjectId(req.params.id)
        ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
        : { orderId: req.params.id };

      const order = await Order.findOneAndUpdate(
        query,
        { $set: { orderStatus: status } },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found"
        });
      }

      return res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order
      });
    }

    const memOrder = memoryOrders.find(
      (o) => o.orderId === req.params.id || o._id === req.params.id
    );

    if (memOrder) {
      memOrder.orderStatus = status;
      return res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order: memOrder
      });
    }

    res.status(404).json({ success: false, message: "Order not found" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status: " + error.message
    });
  }
});

module.exports = router;
