const $ = (selector) => document.querySelector(selector);

// --------------------------------------------------------------------------
// 1. Session & Role Verification
// --------------------------------------------------------------------------
const currentToken =
  localStorage.getItem("stylespectrum_token") ||
  sessionStorage.getItem("stylespectrum_token");

const currentUser = JSON.parse(
  localStorage.getItem("stylespectrum_user") ||
    sessionStorage.getItem("stylespectrum_user") ||
    "null"
);

const isGuest = !currentToken || !currentUser;
const isShopkeeper = currentUser?.role === "shopkeeper";

function getApiUrl(endpoint) {
  if (window.location.protocol === "file:") {
    return `http://localhost:5000${endpoint}`;
  }
  if (window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")) {
    return window.location.port === "5000" ? endpoint : `http://localhost:5000${endpoint}`;
  }
  return endpoint;
}

// --------------------------------------------------------------------------
// 2. Verified 30 High-Resolution Starter Products (Instant 0ms Fallback)
// --------------------------------------------------------------------------
const FALLBACK_CATALOG = [
  // --- 1. LADIES WEAR (5) ---
  {
    id: "fallback-lw-1",
    name: "Embroidered Anarkali Kurti Set",
    category: "Ladies Wear",
    price: 1299,
    originalPrice: 1899,
    stock: 20,
    tag: "BESTSELLER",
    description: "Graceful Chanderi silk Anarkali kurti adorned with intricate Zari neckline embroidery and dupatta.",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Heritage",
    shopName: "Rajwada Boutique"
  },
  {
    id: "fallback-lw-2",
    name: "Royal Velvet Festive Kurta Set",
    category: "Ladies Wear",
    price: 1999,
    originalPrice: 2699,
    stock: 14,
    tag: "NEW",
    description: "Plush micro-velvet festive straight suit with detailed gota patti borders and matching pants.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Heritage",
    shopName: "Rajwada Boutique"
  },
  {
    id: "fallback-lw-3",
    name: "Designer Pastel Sharara Outfit",
    category: "Ladies Wear",
    price: 2499,
    originalPrice: 3299,
    stock: 12,
    tag: "TRENDING",
    description: "Contemporary flared georgette sharara set in soft blush tones with handcrafted sequin work.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Luxe",
    shopName: "Glamour Threads"
  },
  {
    id: "fallback-lw-4",
    name: "Bohemian Floral Tiered Maxi",
    category: "Ladies Wear",
    price: 1499,
    originalPrice: 2199,
    stock: 16,
    tag: "POPULAR",
    description: "Flowing breathable cotton tiered maxi dress with floral handblock print and tassel details.",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Modern",
    shopName: "Urban Vogue"
  },
  {
    id: "fallback-lw-5",
    name: "Chic Linen Tunic & Palazzo Set",
    category: "Ladies Wear",
    price: 1699,
    originalPrice: 2399,
    stock: 15,
    tag: "ESSENTIAL",
    description: "Relaxed pure organic linen kurta paired with wide-leg cropped palazzo trousers.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Modern",
    shopName: "Urban Vogue"
  },

  // --- 2. SAREES (5) ---
  {
    id: "fallback-sa-1",
    name: "Banarasi Katan Silk Saree",
    category: "Sarees",
    price: 2899,
    originalPrice: 3999,
    stock: 10,
    tag: "ROYAL",
    description: "Pure Banarasi Katan silk saree woven with traditional floral jaal and antique golden zari work.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=85",
    brand: "Varanasi Weaves",
    shopName: "Kashi Handlooms"
  },
  {
    id: "fallback-sa-2",
    name: "Kanjivaram Bridal Temple Saree",
    category: "Sarees",
    price: 3499,
    originalPrice: 4799,
    stock: 8,
    tag: "BRIDAL",
    description: "Exquisite ruby red Kanjivaram silk saree featuring pure zari pallu and authentic temple border.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=85",
    brand: "Varanasi Weaves",
    shopName: "Kashi Handlooms"
  },
  {
    id: "fallback-sa-3",
    name: "Floral Organza Digital Print Saree",
    category: "Sarees",
    price: 1499,
    originalPrice: 2199,
    stock: 18,
    tag: "POPULAR",
    description: "Lightweight and airy pure organza silk saree finished with soft pastel blooming florals.",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Ethnic",
    shopName: "Surat Sarees Hub"
  },
  {
    id: "fallback-sa-4",
    name: "Handcrafted Chanderi Zari Saree",
    category: "Sarees",
    price: 2199,
    originalPrice: 2999,
    stock: 14,
    tag: "HERITAGE",
    description: "Sheer Chanderi handloom cotton silk saree with golden booti motifs and delicate resham work.",
    image: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Ethnic",
    shopName: "Surat Sarees Hub"
  },
  {
    id: "fallback-sa-5",
    name: "Traditional Bandhani Silk Saree",
    category: "Sarees",
    price: 2599,
    originalPrice: 3499,
    stock: 12,
    tag: "FESTIVE",
    description: "Vibrant dual-toned Jaipuri Bandhej saree on pure gajji silk with heavy zari pallu.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Ethnic",
    shopName: "Rajasthan Weaves"
  },

  // --- 3. GENTS WEAR (5) ---
  {
    id: "fallback-gw-1",
    name: "Classic Casual Oxford Shirt",
    category: "Gents Wear",
    price: 1199,
    originalPrice: 1699,
    stock: 25,
    tag: "BESTSELLER",
    description: "Crisp button-down collar casual shirt made with 100% breathable organic cotton.",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Man",
    shopName: "Urban Stitch Co."
  },
  {
    id: "fallback-gw-2",
    name: "Tailored Royal Navy Blazer",
    category: "Gents Wear",
    price: 2999,
    originalPrice: 4299,
    stock: 10,
    tag: "NEW",
    description: "Structured slim-fit single breasted blazer crafted for evening celebrations and formal occasions.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Man",
    shopName: "Gentleman Suite"
  },
  {
    id: "fallback-gw-3",
    name: "Modern Everyday Ribbed T-Shirt",
    category: "Gents Wear",
    price: 599,
    originalPrice: 899,
    stock: 35,
    tag: "ESSENTIAL",
    description: "Heavyweight combed cotton t-shirt with ribbed crew neck for ultimate everyday comfort.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Man",
    shopName: "Urban Stitch Co."
  },
  {
    id: "fallback-gw-4",
    name: "Royal Heritage Kurta Pajama",
    category: "Gents Wear",
    price: 1899,
    originalPrice: 2599,
    stock: 14,
    tag: "ROYAL",
    description: "Classic silk-blend ethnic kurta with embroidered mandarin collar and matching churidar.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Man",
    shopName: "Gentleman Suite"
  },
  {
    id: "fallback-gw-5",
    name: "Italian Cut Slim Formal Suit",
    category: "Gents Wear",
    price: 4499,
    originalPrice: 5999,
    stock: 8,
    tag: "PREMIUM",
    description: "Sophisticated two-piece charcoal formal suit tailored from wrinkle-resistant poly-viscose fabric.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Man",
    shopName: "Gentleman Suite"
  },

  // --- 4. KIDS WEAR (5) ---
  {
    id: "fallback-kw-1",
    name: "Little Explorer Denim Dungaree Set",
    category: "Kids Wear",
    price: 899,
    originalPrice: 1299,
    stock: 16,
    tag: "POPULAR",
    description: "Soft bio-washed denim dungaree with playful striped inner tee for all-day comfort and play.",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },
  {
    id: "fallback-kw-2",
    name: "Princess Birthday Party Tulle Frock",
    category: "Kids Wear",
    price: 1399,
    originalPrice: 1999,
    stock: 12,
    tag: "NEW",
    description: "Magical multi-layered tulle party frock with soft satin lining and delicate floral accents.",
    image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },
  {
    id: "fallback-kw-3",
    name: "Cheerful Cotton Everyday Tee Set",
    category: "Kids Wear",
    price: 499,
    originalPrice: 799,
    stock: 28,
    tag: "ESSENTIAL",
    description: "Ultra-soft tagless cotton t-shirt designed for energetic kids and daily wash durability.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Kids",
    shopName: "Junior Closet"
  },
  {
    id: "fallback-kw-4",
    name: "Playtime Pastel Romper & Shorts",
    category: "Kids Wear",
    price: 699,
    originalPrice: 999,
    stock: 18,
    tag: "COMFORT",
    description: "Breathable jersey cotton romper with snap buttons for easy dressing and breezy summer days.",
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Kids",
    shopName: "Junior Closet"
  },
  {
    id: "fallback-kw-5",
    name: "Kids Festive Kurta Pajama Set",
    category: "Kids Wear",
    price: 1199,
    originalPrice: 1699,
    stock: 14,
    tag: "FESTIVE",
    description: "Festive printed cotton silk kurta with contrast pyjama, skin-friendly for traditional festivities.",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Kids",
    shopName: "Tiny Tots Fashion"
  },

  // --- 5. FOOTWEAR (5) ---
  {
    id: "fallback-fw-1",
    name: "Urban Minimalist White Sneakers",
    category: "Footwear",
    price: 1699,
    originalPrice: 2499,
    stock: 18,
    tag: "BESTSELLER",
    description: "Cushioned memory-foam sole sneakers in sleek white vegan leather for modern streetwear style.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    id: "fallback-fw-2",
    name: "Handcrafted Embroidered Mojari",
    category: "Footwear",
    price: 1099,
    originalPrice: 1599,
    stock: 15,
    tag: "TRADITIONAL",
    description: "Authentic Jaipuri genuine leather jutti hand-embroidered with dabka and zardozi threadwork.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Walk",
    shopName: "Rajasthan Craft Shoes"
  },
  {
    id: "fallback-fw-3",
    name: "Classic Pointed Stiletto Heels",
    category: "Footwear",
    price: 1899,
    originalPrice: 2799,
    stock: 10,
    tag: "NEW",
    description: "Elegantly sculpted stiletto pumps with padded insoles to elevate any evening look.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    id: "fallback-fw-4",
    name: "Men's Formal Oxford Leather Shoes",
    category: "Footwear",
    price: 2499,
    originalPrice: 3499,
    stock: 12,
    tag: "CLASSIC",
    description: "Hand-burnished genuine leather lace-up oxford shoes with non-slip durable TPR sole.",
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },
  {
    id: "fallback-fw-5",
    name: "Comfort Strappy Summer Sandals",
    category: "Footwear",
    price: 799,
    originalPrice: 1199,
    stock: 22,
    tag: "SUMMER",
    description: "Ergonomic flexible footbed sandals with adjustable buckle straps for everyday walkability.",
    image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Walk",
    shopName: "Sole Studio"
  },

  // --- 6. ACCESSORIES (5) ---
  {
    id: "fallback-acc-1",
    name: "Italian Structured Shoulder Bag",
    category: "Accessories",
    price: 1499,
    originalPrice: 2199,
    stock: 16,
    tag: "BESTSELLER",
    description: "Premium textured faux-leather shoulder tote featuring gold-toned hardware and double compartments.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Luxe",
    shopName: "Moda Accessories"
  },
  {
    id: "fallback-acc-2",
    name: "Steel Mesh Chronograph Watch",
    category: "Accessories",
    price: 1899,
    originalPrice: 2999,
    stock: 14,
    tag: "TRENDING",
    description: "Minimalist brushed stainless steel dial with interchangeable quick-release mesh strap.",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Time",
    shopName: "Chrono Watch Co."
  },
  {
    id: "fallback-acc-3",
    name: "Kundan Pearl Statement Choker",
    category: "Accessories",
    price: 1299,
    originalPrice: 1899,
    stock: 12,
    tag: "POPULAR",
    description: "Handcrafted royal Kundan necklace set with fresh water pearl drop earrings.",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Jewels",
    shopName: "Royal Ornaments"
  },
  {
    id: "fallback-acc-4",
    name: "Classic Polarized Aviator Sunglasses",
    category: "Accessories",
    price: 999,
    originalPrice: 1499,
    stock: 20,
    tag: "UV-PROTECT",
    description: "Lightweight metal frame aviators with UV400 polarized scratch-resistant gradient lenses.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Luxe",
    shopName: "Moda Accessories"
  },
  {
    id: "fallback-acc-5",
    name: "Designer Minimalist Leather Watch",
    category: "Accessories",
    price: 1699,
    originalPrice: 2499,
    stock: 15,
    tag: "NEW",
    description: "Clean sunray dial with genuine tan leather band, Japanese quartz movement, and 3ATM water resistance.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    brand: "Spectrum Time",
    shopName: "Chrono Watch Co."
  }
];

// --------------------------------------------------------------------------
// 3. Profile & Role-Based UI Display
// --------------------------------------------------------------------------
const profileToggle = $("#profileToggle");
const profileMenu = $("#profileMenu");

function logout() {
  localStorage.removeItem("stylespectrum_token");
  localStorage.removeItem("stylespectrum_user");
  sessionStorage.removeItem("stylespectrum_token");
  sessionStorage.removeItem("stylespectrum_user");
  window.location.replace("login.html");
}

function updateRoleUI() {
  const profileName = $("#profileName");
  const profileEmail = $("#profileEmail");
  const profileRoleBadge = $("#profileRoleBadge");
  const profileActionsBox = $("#profileActionsBox");

  const headerAddProductBtn = $("#headerAddProductBtn");
  const shopOrdersBtn = $("#shopOrdersBtn");
  const shopkeeperBanner = $("#shopkeeperBanner");
  const myOrdersBtn = $("#myOrdersBtn");

  const mobileUserName = $("#mobileUserName");
  const mobileUserSub = $("#mobileUserSub");
  const mobileRoleBadge = $("#mobileRoleBadge");
  const mobileMyOrdersBtn = $("#mobileMyOrdersBtn");
  const mobileShopOrdersBtn = $("#mobileShopOrdersBtn");
  const mobileAddProductBtn = $("#mobileAddProductBtn");
  const mobileAuthAction = $("#mobileAuthAction");

  if (!isGuest && currentUser) {
    if (profileName) profileName.textContent = currentUser.name ? currentUser.name.split(" ")[0] : "Account";
    if (profileEmail) profileEmail.textContent = currentUser.email || "";

    if (mobileUserName) mobileUserName.textContent = currentUser.name || "My Account";
    if (mobileUserSub) mobileUserSub.textContent = currentUser.email || "Active Session";

    if (isShopkeeper) {
      const badgeHtml = `<span class="role-badge badge-shopkeeper">🏪 Shopkeeper (${escapeHTML(currentUser.shopName || "Seller")})</span>`;
      if (profileRoleBadge) profileRoleBadge.innerHTML = badgeHtml;
      if (mobileRoleBadge) mobileRoleBadge.innerHTML = badgeHtml;

      if (headerAddProductBtn) headerAddProductBtn.style.display = "inline-flex";
      if (shopOrdersBtn) shopOrdersBtn.style.display = "inline-flex";
      if (shopkeeperBanner) shopkeeperBanner.style.display = "flex";
      if (myOrdersBtn) myOrdersBtn.style.display = "none";

      if (mobileAddProductBtn) mobileAddProductBtn.style.display = "inline-flex";
      if (mobileShopOrdersBtn) mobileShopOrdersBtn.style.display = "inline-flex";
      if (mobileMyOrdersBtn) mobileMyOrdersBtn.style.display = "none";
    } else {
      const badgeHtml = `<span class="role-badge badge-customer">🛒 Customer</span>`;
      if (profileRoleBadge) profileRoleBadge.innerHTML = badgeHtml;
      if (mobileRoleBadge) mobileRoleBadge.innerHTML = badgeHtml;

      if (headerAddProductBtn) headerAddProductBtn.style.display = "none";
      if (shopOrdersBtn) shopOrdersBtn.style.display = "none";
      if (shopkeeperBanner) shopkeeperBanner.style.display = "none";
      if (myOrdersBtn) myOrdersBtn.style.display = "inline-flex";

      if (mobileAddProductBtn) mobileAddProductBtn.style.display = "none";
      if (mobileShopOrdersBtn) mobileShopOrdersBtn.style.display = "none";
      if (mobileMyOrdersBtn) mobileMyOrdersBtn.style.display = "inline-flex";
    }

    if (profileActionsBox) {
      profileActionsBox.innerHTML = `
        <button class="primary-btn full-btn" id="logoutBtn" type="button" style="padding: 9px; font-size: 12px;">
          Log Out
        </button>
      `;
      $("#logoutBtn")?.addEventListener("click", logout);
    }

    if (mobileAuthAction) {
      mobileAuthAction.innerHTML = `
        <button class="outline-btn full-btn" id="mobileLogoutBtn" type="button" style="padding: 11px; font-size: 13px; color: var(--danger); border-color: #fecaca;">
          🚪 Log Out
        </button>
      `;
      $("#mobileLogoutBtn")?.addEventListener("click", logout);
    }
  } else {
    // GUEST USER
    if (profileName) profileName.textContent = "Sign In";
    if (profileEmail) profileEmail.textContent = "Browse as Guest";
    if (profileRoleBadge) profileRoleBadge.innerHTML = `<span class="role-badge" style="background: var(--bg-tertiary); color: var(--ink-muted);">👋 Guest Shopper</span>`;

    if (mobileUserName) mobileUserName.textContent = "Guest Shopper";
    if (mobileUserSub) mobileUserSub.textContent = "Sign in to save your wishlist & place orders";
    if (mobileRoleBadge) mobileRoleBadge.innerHTML = `<span class="role-badge" style="background: var(--bg-tertiary); color: var(--ink-muted);">👋 Guest</span>`;

    if (headerAddProductBtn) headerAddProductBtn.style.display = "none";
    if (shopOrdersBtn) shopOrdersBtn.style.display = "none";
    if (shopkeeperBanner) shopkeeperBanner.style.display = "none";
    if (myOrdersBtn) myOrdersBtn.style.display = "none";

    if (mobileAddProductBtn) mobileAddProductBtn.style.display = "none";
    if (mobileShopOrdersBtn) mobileShopOrdersBtn.style.display = "none";
    if (mobileMyOrdersBtn) mobileMyOrdersBtn.style.display = "none";

    if (profileActionsBox) {
      profileActionsBox.innerHTML = `
        <a href="login.html" class="primary-btn full-btn" style="padding: 9px; font-size: 12px; text-align: center;">
          Sign In / Register ↗
        </a>
      `;
    }

    if (mobileAuthAction) {
      mobileAuthAction.innerHTML = `
        <a href="login.html" class="primary-btn full-btn" style="padding: 11px 14px; text-align: center;">
          Sign In / Register ↗
        </a>
      `;
    }
  }
}

if (profileToggle) {
  profileToggle.addEventListener("click", () => {
    profileMenu.hidden = !profileMenu.hidden;
  });
}

// --------------------------------------------------------------------------
// 4. Local Storage Helpers & State
// --------------------------------------------------------------------------
const STORAGE = {
  cart: "stylespectrum_cart_v4",
  wishlist: "stylespectrum_wishlist_v4",
  productsBackup: "stylespectrum_products_cache_v4"
};

const categories = [
  "Ladies Wear", "Sarees", "Gents Wear",
  "Kids Wear", "Footwear", "Accessories"
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

// Sync Customer Selections (Cart & Wishlist) directly to MongoDB Atlas
async function syncCartWithDatabase() {
  if (isShopkeeper || !currentToken) return;
  try {
    await fetch(getApiUrl("/api/auth/customer/cart"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`
      },
      body: JSON.stringify({ items: cart })
    });
  } catch (err) {
    console.warn("DB Cart Sync:", err.message);
  }
}

async function syncWishlistWithDatabase() {
  if (isShopkeeper || !currentToken) return;
  try {
    await fetch(getApiUrl("/api/auth/customer/wishlist"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`
      },
      body: JSON.stringify({ wishlist })
    });
  } catch (err) {
    console.warn("DB Wishlist Sync:", err.message);
  }
}

async function loadCustomerSelectionsFromDatabase() {
  if (isShopkeeper || !currentToken) return;
  try {
    const res = await fetch(getApiUrl("/api/auth/customer/cart"), {
      headers: { Authorization: `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      if (Array.isArray(data.cart) && data.cart.length > 0) {
        cart = data.cart;
        saveStorage(STORAGE.cart, cart);
        updateHeader();
        renderCart();
      }
      if (Array.isArray(data.wishlist) && data.wishlist.length > 0) {
        wishlist = data.wishlist;
        saveStorage(STORAGE.wishlist, wishlist);
        updateHeader();
        renderProducts();
      }
    }
  } catch (err) {
    console.warn("Could not load DB selections:", err.message);
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === STORAGE.cart) syncCartWithDatabase();
    if (key === STORAGE.wishlist) syncWishlistWithDatabase();
    return true;
  } catch {
    return false;
  }
}

let cart = readStorage(STORAGE.cart, []);
let wishlist = readStorage(STORAGE.wishlist, []);
const cachedProds = readStorage(STORAGE.productsBackup, null);
let products = (Array.isArray(cachedProds) && cachedProds.length > 0) ? cachedProds : FALLBACK_CATALOG;

let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let wishlistMode = false;
let toastTimer;

cart = Array.isArray(cart) ? cart.filter(item => item && item.id && item.qty > 0) : [];
wishlist = Array.isArray(wishlist) ? wishlist.filter(id => typeof id === "string") : [];

function money(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// --------------------------------------------------------------------------
// 5. Fetch Products from MongoDB Atlas
// --------------------------------------------------------------------------
async function fetchProductsFromBackend() {
  try {
    const res = await fetch(getApiUrl("/api/products"));
    const data = await res.json();

    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      products = data.products.map(p => ({
        ...p,
        id: p._id || p.id,
        image: (p.images && p.images[0]) || p.image || "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80"
      }));
      saveStorage(STORAGE.productsBackup, products);
    }
  } catch (err) {
    console.warn("Using fallback/cached products:", err.message);
  }

  renderProducts();
}

function getImage(product) {
  if (product.image && (product.image.startsWith("http://") || product.image.startsWith("https://") || product.image.startsWith("data:image/"))) {
    return product.image;
  }
  if (Array.isArray(product.images) && product.images[0]) {
    return product.images[0];
  }
  return "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80";
}

// --------------------------------------------------------------------------
// 6. Product Rendering & Filters (High-Contrast, Zero Image Obstruction)
// --------------------------------------------------------------------------
function getFilteredProducts() {
  let list = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    const searchable = [
      product.name,
      product.category,
      product.description,
      product.brand,
      product.tag,
      product.shopName
    ].join(" ").toLowerCase();

    const matchesSearch = searchable.includes(searchTerm);
    const matchesWishlist = !wishlistMode || wishlist.includes(product.id);

    return matchesCategory && matchesSearch && matchesWishlist;
  });

  if (sortMode === "low") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortMode === "high") {
    list.sort((a, b) => b.price - a.price);
  } else if (sortMode === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}

function renderProducts() {
  const grid = $("#productGrid");
  const list = getFilteredProducts();

  $("#emptyState").hidden = list.length > 0;
  grid.hidden = list.length === 0;

  $("#resultCount").textContent = `${list.length} item${list.length === 1 ? "" : "s"} found`;

  $("#shopTitle").innerHTML = wishlistMode
    ? "Your <em>wishlist.</em>"
    : activeCategory === "All"
      ? "Pieces you'll <em>love.</em>"
      : `${escapeHTML(activeCategory)} <em>collection.</em>`;

  $("#categoryFilter").value = activeCategory;

  grid.innerHTML = list.map(product => {
    const liked = wishlist.includes(product.id);
    const stock = Number(product.stock) || 0;
    const origPrice = product.originalPrice || Math.round(product.price * 1.35);
    const discount = Math.round(((origPrice - product.price) / origPrice) * 100);

    return `
      <article class="product-card">
        <div class="product-image">
          <img
            src="${escapeHTML(getImage(product))}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'"
          >
          ${product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : ""}
          <button
            class="wish-btn ${liked ? "active" : ""}"
            data-action="wishlist"
            data-id="${escapeHTML(product.id)}"
            aria-label="${liked ? "Remove from" : "Add to"} wishlist"
          >${liked ? "♥" : "♡"}</button>
          ${isShopkeeper ? `
          <button
            class="product-delete-btn"
            data-action="delete-product"
            data-id="${escapeHTML(product.id)}"
            aria-label="Delete product"
            title="Delete this product from catalog"
          >🗑️</button>` : ""}
        </div>
        <div class="product-info">
          <div class="product-category">
            <span>${escapeHTML(product.category)}</span>
            ${product.shopName ? `<small style="font-weight: 600; text-transform: none; color: var(--ink-muted);">${escapeHTML(product.shopName)}</small>` : ""}
          </div>
          <h3 class="product-name" title="${escapeHTML(product.name)}">${escapeHTML(product.name)}</h3>
          <div class="product-rating">
            <span class="stars">★★★★★</span>
            <span>4.8</span>
            <span style="color: var(--ink-light); font-weight: 500;">(120+)</span>
          </div>
          <div class="product-bottom">
            <div class="product-price-box">
              <span class="product-price">${money(product.price)}</span>
              <span class="product-orig-price">${money(origPrice)}</span>
              ${discount > 0 ? `<span style="font-size: 11px; font-weight: 800; color: var(--success);">${discount}% OFF</span>` : ""}
            </div>
            <span class="product-stock ${stock < 1 ? "out-of-stock" : ""}">${stock > 0 ? `${stock} left` : "Sold out"}</span>
          </div>
          <button
            class="card-add-btn"
            data-action="add"
            data-id="${escapeHTML(product.id)}"
            ${stock < 1 ? "disabled" : ""}
          >${stock < 1 ? "Out of Stock" : "＋ Add to Bag"}</button>
          ${isShopkeeper ? `
          <div class="product-seller-actions">
            <button class="btn-delete-card" data-action="delete-product" data-id="${escapeHTML(product.id)}" type="button">
              🗑️ Delete Product
            </button>
          </div>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function selectCategory(category) {
  activeCategory = categories.includes(category) ? category : "All";
  wishlistMode = false;
  $("#categoryFilter").value = activeCategory;
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
}

// --------------------------------------------------------------------------
// 7. Wishlist Operations
// --------------------------------------------------------------------------
function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
    showToast("Removed from wishlist.");
  } else {
    wishlist.push(id);
    showToast("Added to wishlist.");
  }

  saveStorage(STORAGE.wishlist, wishlist);
  updateHeader();
  renderProducts();
}

// --------------------------------------------------------------------------
// 8. Shopping Bag (Cart) Operations
// --------------------------------------------------------------------------
function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const stock = Number(product.stock) || 0;
  const existing = cart.find(item => item.id === id);
  const currentQty = existing ? existing.qty : 0;

  if (currentQty >= stock) {
    showToast("Stock limit reached for this item.");
    return;
  }

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getImage(product),
      category: product.category,
      shopName: product.shopName || "StyleSpectrum",
      qty: 1
    });
  }

  saveStorage(STORAGE.cart, cart);
  updateHeader();
  renderCart();
  showToast("Added to your shopping bag.");
}

function changeQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  const product = products.find(entry => entry.id === id);
  if (!item) return;

  const maxStock = product ? Number(product.stock) || 99 : 99;
  const nextQty = item.qty + change;

  if (nextQty <= 0) {
    cart = cart.filter(entry => entry.id !== id);
  } else if (nextQty <= maxStock) {
    item.qty = nextQty;
  } else {
    showToast("Stock limit reached.");
  }

  saveStorage(STORAGE.cart, cart);
  updateHeader();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveStorage(STORAGE.cart, cart);
  updateHeader();
  renderCart();
  showToast("Removed from bag.");
}

function updateHeader() {
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  $("#cartCount").textContent = cartCount;
  $("#drawerCount").textContent = `(${cartCount})`;
  $("#wishlistCount").textContent = wishlist.length;
}

function renderCart() {
  const container = $("#cartItems");
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.qty, 0);

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty" style="text-align: center; padding: 40px 20px;">
        <p style="font-size: 16px; font-weight: 700; color: var(--ink);">Your bag is empty.</p>
        <p class="muted">Explore the collection and find your signature style.</p>
      </div>
    `;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${escapeHTML(item.image || getImage(item))}" alt="${escapeHTML(item.name)}">
        <div>
          <h3>${escapeHTML(item.name)}</h3>
          <p>${money(item.price)}</p>
          <div class="quantity-controls">
            <button data-action="minus" data-id="${escapeHTML(item.id)}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button data-action="plus" data-id="${escapeHTML(item.id)}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${escapeHTML(item.id)}">Remove</button>
      </div>
    `).join("");
  }

  $("#cartTotal").textContent = money(total);
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#drawerBackdrop").hidden = false;
  document.body.classList.add("no-scroll");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#drawerBackdrop").hidden = true;
  document.body.classList.remove("no-scroll");
}

// --------------------------------------------------------------------------
// 9. Checkout & Order Flow
// --------------------------------------------------------------------------
const checkoutModal = $("#checkoutModal");
const checkoutForm = $("#checkoutForm");
const checkoutSummary = $("#checkoutSummary");
const checkoutTotalBtn = $("#checkoutTotalBtn");
const closeCheckout = $("#closeCheckout");

const orderSuccessModal = $("#orderSuccessModal");
const successOrderId = $("#successOrderId");
const successTotalAmount = $("#successTotalAmount");
const successViewOrdersBtn = $("#successViewOrdersBtn");
const successContinueBtn = $("#successContinueBtn");

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your bag is empty! Add products first.");
    return;
  }

  if (isGuest) {
    closeCart();
    showToast("Please sign in or register to place your order.");
    setTimeout(() => {
      window.location.href = "login.html?redirect=checkout";
    }, 1200);
    return;
  }

  closeCart();
  checkoutModal.hidden = false;
  document.body.classList.add("no-scroll");

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.qty, 0);
  checkoutTotalBtn.textContent = money(total);

  if (currentUser) {
    $("#checkFullName").value = currentUser.name || "";
    $("#checkMobile").value = currentUser.mobile || "";
  }

  checkoutSummary.innerHTML = `
    <strong>Bag Summary (${cart.reduce((s, i) => s + i.qty, 0)} items)</strong>
    <div style="margin-top: 8px;">
      ${cart.map(i => `
        <div class="checkout-item-line">
          <span>${escapeHTML(i.name)} × ${i.qty}</span>
          <span>${money(i.price * i.qty)}</span>
        </div>
      `).join("")}
    </div>
    <div style="border-top: 1px solid var(--line); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 800; font-size: 14px;">
      <span>Total Payable</span>
      <span style="color: var(--accent);">${money(total)}</span>
    </div>
  `;
}

function closeCheckoutModal() {
  checkoutModal.hidden = true;
  document.body.classList.remove("no-scroll");
}

if ($("#checkoutBtn")) $("#checkoutBtn").addEventListener("click", openCheckout);
if (closeCheckout) closeCheckout.addEventListener("click", closeCheckoutModal);

// Handle Successful Order Placement
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const placeBtn = $("#placeOrderBtn");
    placeBtn.disabled = true;
    placeBtn.textContent = "Placing Order into MongoDB...";

    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.qty, 0);

    const payload = {
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
        category: item.category,
        shopName: item.shopName
      })),
      shippingAddress: {
        fullName: $("#checkFullName").value.trim(),
        mobile: $("#checkMobile").value.trim(),
        addressLine: $("#checkAddress").value.trim(),
        city: $("#checkCity").value.trim(),
        state: $("#checkState").value.trim() || "India",
        pincode: $("#checkPincode").value.trim()
      },
      paymentMethod: $("#checkPaymentMethod").value,
      totalAmount: total
    };

    try {
      const res = await fetch(getApiUrl("/api/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place order.");
      }

      // Clear cart permanently
      cart = [];
      saveStorage(STORAGE.cart, cart);
      updateHeader();
      renderCart();

      closeCheckoutModal();

      // Show Order Confirmed Modal
      successOrderId.textContent = data.order.orderId;
      successTotalAmount.textContent = money(total);
      orderSuccessModal.hidden = false;
      document.body.classList.add("no-scroll");

    } catch (err) {
      showToast(err.message || "Could not place order.");
    } finally {
      placeBtn.disabled = false;
      placeBtn.textContent = `Confirm & Place Order (${money(total)}) ↗`;
    }
  });
}

// Order Confirmation Modal Actions
if (successViewOrdersBtn) {
  successViewOrdersBtn.addEventListener("click", () => {
    orderSuccessModal.hidden = true;
    openOrdersModal();
  });
}

if (successContinueBtn) {
  successContinueBtn.addEventListener("click", () => {
    orderSuccessModal.hidden = true;
    document.body.classList.remove("no-scroll");
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });
}

// --------------------------------------------------------------------------
// 10. Customer Order History Modal
// --------------------------------------------------------------------------
const ordersModal = $("#ordersModal");
const closeOrdersModal = $("#closeOrdersModal");
const ordersListContainer = $("#ordersListContainer");

async function openOrdersModal() {
  if (isGuest) {
    showToast("Please sign in to view your orders.");
    window.location.href = "login.html";
    return;
  }

  ordersModal.hidden = false;
  document.body.classList.add("no-scroll");
  ordersListContainer.innerHTML = `<p class="muted">Loading your orders from StyleSpectrum database...</p>`;

  try {
    const res = await fetch(getApiUrl("/api/orders/my-orders"), {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to fetch orders.");
    }

    if (!data.orders || data.orders.length === 0) {
      ordersListContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 10px;">
          <p style="font-size: 16px; font-weight: 700;">You haven't placed any orders yet.</p>
          <p class="muted">Start browsing the collection and place your first order!</p>
        </div>
      `;
      return;
    }

    ordersListContainer.innerHTML = data.orders.map(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      const status = order.orderStatus || "Confirmed";

      return `
        <div class="order-card">
          <div class="order-card-header">
            <div>
              <span class="order-id">${escapeHTML(order.orderId)}</span>
              <div style="font-size: 11px; color: var(--ink-muted);">${orderDate}</div>
            </div>
            <span class="order-status status-${status.toLowerCase()}">${status === "Confirmed" ? "✓ Confirmed" : escapeHTML(status)}</span>
          </div>

          <div style="margin: 8px 0;">
            ${(order.items || []).map(it => `
              <div class="order-item-mini">
                <img src="${escapeHTML(it.image || getImage(it))}" alt="${escapeHTML(it.name)}">
                <div style="flex: 1;">
                  <strong>${escapeHTML(it.name)}</strong>
                  <div style="font-size: 12px; color: var(--ink-muted);">Qty: ${it.qty} × ${money(it.price)}</div>
                </div>
                <strong>${money(it.price * it.qty)}</strong>
              </div>
            `).join("")}
          </div>

          <div style="border-top: 1px solid var(--line); padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 13px;">
            <span>Payment: <strong>${escapeHTML(order.paymentMethod)} (${escapeHTML(order.paymentStatus || "Pending")})</strong></span>
            <span>Total: <strong style="color: var(--accent); font-size: 15px;">${money(order.totalAmount)}</strong></span>
          </div>
          <div style="font-size: 11px; color: var(--ink-muted); margin-top: 4px;">
            Deliver to: ${escapeHTML(order.shippingAddress?.fullName)}, ${escapeHTML(order.shippingAddress?.city)} (${escapeHTML(order.shippingAddress?.pincode)})
          </div>
        </div>
      `;
    }).join("");

  } catch (err) {
    ordersListContainer.innerHTML = `<p style="color: var(--danger);">Failed to load orders: ${err.message}</p>`;
  }
}

const myOrdersBtn = $("#myOrdersBtn");
const mobileMyOrdersBtn = $("#mobileMyOrdersBtn");
if (myOrdersBtn) myOrdersBtn.addEventListener("click", openOrdersModal);
if (mobileMyOrdersBtn) mobileMyOrdersBtn.addEventListener("click", () => {
  closeMobileDrawerMenu();
  openOrdersModal();
});

if (closeOrdersModal) {
  closeOrdersModal.addEventListener("click", () => {
    ordersModal.hidden = true;
    document.body.classList.remove("no-scroll");
  });
}

// --------------------------------------------------------------------------
// 11. Shopkeeper Customer Orders Dashboard
// --------------------------------------------------------------------------
const shopOrdersModal = $("#shopOrdersModal");
const closeShopOrdersModal = $("#closeShopOrdersModal");
const shopOrdersListContainer = $("#shopOrdersListContainer");

async function openShopOrdersModal() {
  if (!isShopkeeper) {
    showToast("Only shopkeepers can access customer orders.");
    return;
  }

  shopOrdersModal.hidden = false;
  document.body.classList.add("no-scroll");
  shopOrdersListContainer.innerHTML = `<p class="muted">Loading customer orders from stylespectrum_customer database...</p>`;

  try {
    const res = await fetch(getApiUrl("/api/orders/shop/all-orders"), {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to load orders.");
    }

    if (!data.orders || data.orders.length === 0) {
      shopOrdersListContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 10px;">
          <p style="font-size: 17px; font-weight: 700;">No customer orders received yet.</p>
          <p class="muted">When customers purchase items, their order details and delivery addresses will appear here.</p>
        </div>
      `;
      return;
    }

    shopOrdersListContainer.innerHTML = data.orders.map(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <div class="order-card">
          <div class="order-card-header">
            <div>
              <span class="order-id">${escapeHTML(order.orderId)}</span>
              <div style="font-size: 11px; color: var(--ink-muted);">Placed on: ${orderDate}</div>
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 700; margin-right: 4px;">Status:</label>
              <select class="status-select" data-order-id="${escapeHTML(order._id || order.orderId)}">
                <option value="Confirmed" ${order.orderStatus === "Confirmed" ? "selected" : ""}>Confirmed</option>
                <option value="Processing" ${order.orderStatus === "Processing" ? "selected" : ""}>Processing</option>
                <option value="Shipped" ${order.orderStatus === "Shipped" ? "selected" : ""}>Shipped</option>
                <option value="Delivered" ${order.orderStatus === "Delivered" ? "selected" : ""}>Delivered</option>
                <option value="Cancelled" ${order.orderStatus === "Cancelled" ? "selected" : ""}>Cancelled</option>
              </select>
            </div>
          </div>

          <div class="order-customer-box">
            <div>👤 <strong>Customer:</strong> ${escapeHTML(order.customerName)} | 📞 <strong>Phone:</strong> <a href="tel:${escapeHTML(order.customerMobile)}" style="color:var(--accent); font-weight:700;">${escapeHTML(order.customerMobile)}</a> | ✉️ ${escapeHTML(order.customerEmail)}</div>
            <div style="margin-top: 4px;">📍 <strong>Delivery Address:</strong> ${escapeHTML(order.shippingAddress?.addressLine)}, ${escapeHTML(order.shippingAddress?.city)}, ${escapeHTML(order.shippingAddress?.state)} - <strong>${escapeHTML(order.shippingAddress?.pincode)}</strong></div>
          </div>

          <div style="margin: 10px 0;">
            ${(order.items || []).map(it => `
              <div class="order-item-mini">
                <img src="${escapeHTML(it.image || getImage(it))}" alt="${escapeHTML(it.name)}">
                <div style="flex: 1;">
                  <strong>${escapeHTML(it.name)}</strong>
                  <div style="font-size: 11px; color: var(--ink-muted);">Store: ${escapeHTML(it.shopName || "StyleSpectrum")}</div>
                  <div style="font-size: 12px; color: var(--ink-secondary);">Quantity: ${it.qty} × ${money(it.price)}</div>
                </div>
                <strong>${money(it.price * it.qty)}</strong>
              </div>
            `).join("")}
          </div>

          <div style="border-top: 1px solid var(--line); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px;">Payment: <strong>${escapeHTML(order.paymentMethod)}</strong> (${escapeHTML(order.paymentStatus || "Pending")})</span>
            <span style="font-size: 14px;">Total Order Value: <strong style="color: var(--accent); font-size: 16px;">${money(order.totalAmount)}</strong></span>
          </div>
        </div>
      `;
    }).join("");

    shopOrdersListContainer.querySelectorAll(".status-select").forEach(select => {
      select.addEventListener("change", async (e) => {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.value;

        try {
          const res = await fetch(getApiUrl(`/api/orders/status/${orderId}`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentToken}`
            },
            body: JSON.stringify({ status: newStatus })
          });

          const data = await res.json();
          if (data.success) {
            showToast(`Order status updated to ${newStatus}`);
          } else {
            showToast(data.message || "Update failed");
          }
        } catch (err) {
          showToast("Failed to update status");
        }
      });
    });

  } catch (err) {
    shopOrdersListContainer.innerHTML = `<p style="color: var(--danger);">Failed to load customer orders: ${err.message}</p>`;
  }
}

const shopOrdersBtn = $("#shopOrdersBtn");
const mobileShopOrdersBtn = $("#mobileShopOrdersBtn");
if (shopOrdersBtn) shopOrdersBtn.addEventListener("click", openShopOrdersModal);
if (mobileShopOrdersBtn) mobileShopOrdersBtn.addEventListener("click", () => {
  closeMobileDrawerMenu();
  openShopOrdersModal();
});

if (closeShopOrdersModal) {
  closeShopOrdersModal.addEventListener("click", () => {
    shopOrdersModal.hidden = true;
    document.body.classList.remove("no-scroll");
  });
}

// --------------------------------------------------------------------------
// 12. Shopkeeper Add Product Modal (With Image Upload & Preview)
// --------------------------------------------------------------------------
const productModal = $("#productModal");
const productForm = $("#productForm");
const openProductFormBtn = $("#openProductForm");
const closeProductFormBtn = $("#closeProductForm");
const headerAddProductBtn = $("#headerAddProductBtn");
const mobileAddProductBtn = $("#mobileAddProductBtn");

const prodImageFile = $("#prodImageFile");
const prodImage = $("#prodImage");
const imagePreviewContainer = $("#imagePreviewContainer");
const imagePreview = $("#imagePreview");

let activeImagePayload = "";

if (prodImageFile) {
  prodImageFile.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) {
      imagePreviewContainer.style.display = "none";
      activeImagePayload = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      this.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      activeImagePayload = e.target.result;
      imagePreview.src = activeImagePayload;
      imagePreviewContainer.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
}

if (prodImage) {
  prodImage.addEventListener("input", function () {
    const url = this.value.trim();
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      activeImagePayload = url;
      imagePreview.src = url;
      imagePreviewContainer.style.display = "block";
    } else if (!prodImageFile?.files[0]) {
      imagePreviewContainer.style.display = "none";
      activeImagePayload = "";
    }
  });
}

function openProductModal() {
  if (!isShopkeeper) {
    showToast("Only registered shopkeepers can add products.");
    return;
  }
  productModal.hidden = false;
  document.body.classList.add("no-scroll");
  $("#prodName")?.focus();
}

function closeProductModal() {
  productModal.hidden = true;
  document.body.classList.remove("no-scroll");
}

if (openProductFormBtn) openProductFormBtn.addEventListener("click", openProductModal);
if (headerAddProductBtn) headerAddProductBtn.addEventListener("click", openProductModal);
if (mobileAddProductBtn) mobileAddProductBtn.addEventListener("click", () => {
  closeMobileDrawerMenu();
  openProductModal();
});
if (closeProductFormBtn) closeProductFormBtn.addEventListener("click", closeProductModal);

if (productModal) {
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeProductModal();
  });
}

if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const saveBtn = $("#saveProductBtn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving to MongoDB Database...";

    const name = $("#prodName").value.trim();
    const price = Number($("#prodPrice").value);
    const originalPrice = Number($("#prodOrigPrice").value) || price;
    const category = $("#prodCategory").value;
    const stock = Number($("#prodStock").value) || 15;
    const description = $("#prodDesc").value.trim();

    const finalImage = activeImagePayload || $("#prodImage").value.trim() || "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80";

    const payload = {
      name,
      price,
      originalPrice,
      category,
      stock,
      images: [finalImage],
      description,
      brand: currentUser?.shopName || "StyleSpectrum",
      tag: "NEW"
    };

    try {
      const res = await fetch(getApiUrl("/api/products"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add product.");
      }

      productForm.reset();
      activeImagePayload = "";
      imagePreviewContainer.style.display = "none";
      closeProductModal();
      showToast("🎉 Product saved permanently in store database!");

      // Refresh products list from live database
      await fetchProductsFromBackend();
      $("#shop").scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      showToast(err.message || "Error adding product.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Permanently to Store ↗";
    }
  });
}

// --------------------------------------------------------------------------
// 13. Shopkeeper Product Deletion (Permanent MongoDB sync)
// --------------------------------------------------------------------------
async function deleteProduct(id) {
  if (!isShopkeeper) {
    showToast("Only shopkeepers can delete products.");
    return;
  }

  const product = products.find(p => p.id === id);
  const prodName = product ? product.name : "this product";

  const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${prodName}" from the store?`);
  if (!confirmDelete) return;

  try {
    const res = await fetch(getApiUrl(`/api/products/${id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to delete product.");
    }

    showToast(`🗑️ "${prodName}" deleted permanently!`);

    // Remove from in-memory lists and local storage
    products = products.filter(p => p.id !== id);
    cart = cart.filter(p => p.id !== id);
    wishlist = wishlist.filter(itemId => itemId !== id);
    saveStorage(STORAGE.productsBackup, products);
    saveStorage(STORAGE.cart, cart);
    saveStorage(STORAGE.wishlist, wishlist);

    updateHeader();
    renderCart();
    renderProducts();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Could not delete product: " + err.message);
  }
}

// --------------------------------------------------------------------------
// 14. Event Delegation & Interactive Controls
// --------------------------------------------------------------------------
$("#productGrid").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "add") addToCart(id);
  if (action === "wishlist") toggleWishlist(id);
  if (action === "delete-product") deleteProduct(id);
});

$("#cartItems").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "plus") changeQuantity(id, 1);
  if (action === "minus") changeQuantity(id, -1);
  if (action === "remove") removeFromCart(id);
});

$("#searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  wishlistMode = false;
  renderProducts();
});

$("#categoryFilter").addEventListener("change", (e) => {
  activeCategory = e.target.value;
  wishlistMode = false;
  renderProducts();
});

$("#sortFilter").addEventListener("change", (e) => {
  sortMode = e.target.value;
  renderProducts();
});

$("#searchFocus").addEventListener("click", () => {
  $("#searchInput").focus();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

$("#showAll").addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  $("#searchInput").value = "";
  wishlistMode = false;
  $("#categoryFilter").value = "All";
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

$("#wishlistToggle").addEventListener("click", () => {
  wishlistMode = !wishlistMode;
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

$("#resetFilters")?.addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  wishlistMode = false;
  $("#searchInput").value = "";
  $("#categoryFilter").value = "All";
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => {
    selectCategory(card.dataset.category);
  });
});

$("#cartToggle").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#drawerBackdrop").addEventListener("click", closeCart);

// --------------------------------------------------------------------------
// 15. Mobile Navigation Drawer Listeners
// --------------------------------------------------------------------------
const menuToggle = $("#menuToggle");
const mobileNavDrawer = $("#mobileNavDrawer");
const mobileDrawerBackdrop = $("#mobileDrawerBackdrop");
const closeMobileDrawer = $("#closeMobileDrawer");

function openMobileDrawer() {
  if (mobileNavDrawer) mobileNavDrawer.classList.add("open");
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closeMobileDrawerMenu() {
  if (mobileNavDrawer) mobileNavDrawer.classList.remove("open");
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

if (menuToggle) menuToggle.addEventListener("click", openMobileDrawer);
if (closeMobileDrawer) closeMobileDrawer.addEventListener("click", closeMobileDrawerMenu);
if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener("click", closeMobileDrawerMenu);

document.querySelectorAll(".mobile-nav-link").forEach(link => {
  link.addEventListener("click", () => {
    closeMobileDrawerMenu();
  });
});

document.querySelectorAll(".cat-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const cat = chip.dataset.category;
    document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    selectCategory(cat);
    closeMobileDrawerMenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeMobileDrawerMenu();
    closeProductModal();
    closeCheckoutModal();
    if (ordersModal) ordersModal.hidden = true;
    if (shopOrdersModal) shopOrdersModal.hidden = true;
    if (orderSuccessModal) orderSuccessModal.hidden = true;
    document.body.classList.remove("no-scroll");
  }
});

if ($("#year")) $("#year").textContent = new Date().getFullYear();

// --------------------------------------------------------------------------
// 16. Initialize Store & Dynamic Renders
// --------------------------------------------------------------------------
updateRoleUI();
updateHeader();
renderCart();
renderProducts();
fetchProductsFromBackend();
loadCustomerSelectionsFromDatabase();
