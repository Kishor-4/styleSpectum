const jwt = require("jsonwebtoken");
const { getUserById } = require("../routes/authRoutes");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in to access this resource"
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "stylespectrum_fallback_secret_key_2026";

    const decoded = jwt.verify(token, secret);

    const user = await getUserById(decoded.id, decoded.role);

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive account"
      });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session"
    });
  }
}

function approvedShopkeeper(req, res, next) {
  if (!req.user || req.user.role !== "shopkeeper") {
    return res.status(403).json({
      success: false,
      message: "Only shopkeepers can add and manage store products"
    });
  }

  if (req.user.shopkeeperApproved === false) {
    return res.status(403).json({
      success: false,
      message: "Shopkeeper approval is pending"
    });
  }

  next();
}

function customerOnly(req, res, next) {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({
      success: false,
      message: "This action is for customers only"
    });
  }
  next();
}

module.exports = {
  protect,
  approvedShopkeeper,
  customerOnly
};
