const http = require("http");

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const reqHeaders = { ...headers };
    let postData = null;

    if (body) {
      postData = JSON.stringify(body);
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      { method, headers: reqHeaders },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("==========================================");
  console.log("   StyleSpectrum Automated Test Suite    ");
  console.log("==========================================");

  // 1. Health Check
  try {
    const health = await request("GET", "/api/health");
    console.log("1. /api/health status:", health.status, health.body.success ? "✅ OK" : "❌ FAIL");
  } catch (err) {
    console.error("1. /api/health error:", err.message);
  }

  // 2. Fetch Products
  try {
    const prods = await request("GET", "/api/products");
    console.log("2. /api/products status:", prods.status, "Products received:", prods.body?.products?.length ?? 0);
  } catch (err) {
    console.error("2. /api/products error:", err.message);
  }

  // 3. Register Customer (Customer DB)
  const testCustomerEmail = `customer_${Date.now()}@example.com`;
  let customerToken = null;
  try {
    const custRes = await request("POST", "/api/auth/register", {
      name: "Rohan Verma",
      email: testCustomerEmail,
      mobile: "9876543210",
      password: "password123",
      role: "customer"
    });
    console.log("3. Register Customer status:", custRes.status, custRes.body.success ? "✅ OK" : custRes.body.message);
    customerToken = custRes.body.token;
  } catch (err) {
    console.error("3. Register Customer error:", err.message);
  }

  // 4. Register Shopkeeper (Shopkeeper DB)
  const testShopkeeperEmail = `shopkeeper_${Date.now()}@example.com`;
  let shopkeeperToken = null;
  try {
    const shopRes = await request("POST", "/api/auth/register", {
      name: "Sunil Sharma",
      email: testShopkeeperEmail,
      mobile: "9876543211",
      password: "password123",
      role: "shopkeeper",
      shopName: "Sharma Textiles & Sarees",
      shopAddress: "M.I. Road, Jaipur"
    });
    console.log("4. Register Shopkeeper status:", shopRes.status, shopRes.body.success ? "✅ OK" : shopRes.body.message);
    shopkeeperToken = shopRes.body.token;
  } catch (err) {
    console.error("4. Register Shopkeeper error:", err.message);
  }

  // 5. Login Customer
  try {
    const loginRes = await request("POST", "/api/auth/login", {
      email: testCustomerEmail,
      password: "password123"
    });
    console.log("5. Customer Login status:", loginRes.status, "Role:", loginRes.body?.user?.role, loginRes.body.success ? "✅ OK" : "❌ FAIL");
  } catch (err) {
    console.error("5. Customer Login error:", err.message);
  }

  // 6. Login Shopkeeper
  try {
    const loginShopRes = await request("POST", "/api/auth/login", {
      email: testShopkeeperEmail,
      password: "password123"
    });
    console.log("6. Shopkeeper Login status:", loginShopRes.status, "Role:", loginShopRes.body?.user?.role, "Shop:", loginShopRes.body?.user?.shopName, loginShopRes.body.success ? "✅ OK" : "❌ FAIL");
  } catch (err) {
    console.error("6. Shopkeeper Login error:", err.message);
  }

  // 7. Shopkeeper Adds Product (Shopkeeper DB)
  if (shopkeeperToken) {
    try {
      const addProdRes = await request("POST", "/api/products", {
        name: "Jaipuri Bandhani Silk Saree",
        category: "Sarees",
        price: 2899,
        originalPrice: 3999,
        stock: 12,
        description: "Handcrafted authentic Jaipuri bandhani silk saree with royal golden zari border.",
        brand: "Sharma Textiles"
      }, {
        Authorization: `Bearer ${shopkeeperToken}`
      });
      console.log("7. Shopkeeper Add Product status:", addProdRes.status, addProdRes.body.success ? "✅ OK" : addProdRes.body.message);
    } catch (err) {
      console.error("7. Shopkeeper Add Product error:", err.message);
    }
  }

  // 8. Customer Places Order (Customer DB)
  if (customerToken) {
    try {
      const orderRes = await request("POST", "/api/orders", {
        items: [
          {
            productId: "prod_01",
            name: "Floral Everyday Kurti",
            price: 899,
            qty: 2,
            shopName: "StyleSpectrum Ethnic"
          }
        ],
        shippingAddress: {
          fullName: "Rohan Verma",
          mobile: "9876543210",
          addressLine: "Flat 402, Royal Palms, Civil Lines",
          city: "Jaipur",
          state: "Rajasthan",
          pincode: "302006"
        },
        paymentMethod: "COD",
        totalAmount: 1798
      }, {
        Authorization: `Bearer ${customerToken}`
      });
      console.log("8. Customer Place Order status:", orderRes.status, "Order ID:", orderRes.body?.order?.orderId, orderRes.body.success ? "✅ OK" : orderRes.body.message);
    } catch (err) {
      console.error("8. Customer Place Order error:", err.message);
    }

    // 9. Customer Fetches Order History
    try {
      const myOrdersRes = await request("GET", "/api/orders/my-orders", null, {
        Authorization: `Bearer ${customerToken}`
      });
      console.log("9. Customer Order History status:", myOrdersRes.status, "Orders count:", myOrdersRes.body?.count ?? 0, myOrdersRes.body.success ? "✅ OK" : "❌ FAIL");
    } catch (err) {
      console.error("9. Customer Order History error:", err.message);
    }
  }

  console.log("==========================================");
  console.log("         Testing Finished                 ");
  console.log("==========================================");
}

runTests();
