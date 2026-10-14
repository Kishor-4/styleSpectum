const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { isCustomerDbReady } = require("../config/db");

const router = express.Router();

// Fallback in-memory order history
const memoryOrders = [];

// ==========================================
// POST /api/orders
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

    const orderData = {
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

    if (isCustomerDbReady()) {
      const dbOrder = await Order.create(orderData);
      memoryOrders.unshift(dbOrder.toObject());
      return res.status(201).json({
        success: true,
        message: "Order placed successfully! Stored in customer database.",
        order: dbOrder
      });
    }

    // In-memory addition
    memoryOrders.unshift(orderData);

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Thank you for shopping with StyleSpectrum.",
      order: orderData
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
// ==========================================
router.get("/my-orders", protect, async (req, res) => {
  try {
    const custId = String(req.user._id || req.user.id);

    if (isCustomerDbReady()) {
      const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).lean();
      return res.json({
        success: true,
        count: orders.length,
        orders
      });
    }

    const userOrders = memoryOrders.filter(o => String(o.customer) === custId);
    res.json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders: " + error.message
    });
  }
});

module.exports = router;
