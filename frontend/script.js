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

if (!currentToken || !currentUser) {
  window.location.replace("login.html");
}

const isShopkeeper = currentUser?.role === "shopkeeper";

// Base API URL resolver (works on local port 5000, different dev ports, or Render)
function getApiUrl(endpoint) {
  if (window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")) {
    return window.location.port === "5000" ? endpoint : `http://localhost:5000${endpoint}`;
  }
  return endpoint;
}

// --------------------------------------------------------------------------
// 2. Profile & Role-Based UI Display
// --------------------------------------------------------------------------
const profileName = $("#profileName");
const profileEmail = $("#profileEmail");
const profileRoleBadge = $("#profileRoleBadge");
const profileToggle = $("#profileToggle");
const profileMenu = $("#profileMenu");
const logoutBtn = $("#logoutBtn");

const headerAddProductBtn = $("#headerAddProductBtn");
const shopkeeperBanner = $("#shopkeeperBanner");
const myOrdersBtn = $("#myOrdersBtn");

if (currentUser) {
  profileName.textContent = currentUser.name || "My Account";
  profileEmail.textContent = currentUser.email || "";

  if (isShopkeeper) {
    // SHOPKEEPER VIEW
    profileRoleBadge.innerHTML = `<span class="role-badge badge-shopkeeper">🏪 Shopkeeper (${escapeHTML(currentUser.shopName || "Seller")})</span>`;
    headerAddProductBtn.style.display = "inline-block";
    shopkeeperBanner.style.display = "flex";
    if (myOrdersBtn) myOrdersBtn.style.display = "none";
  } else {
    // CUSTOMER VIEW: STRICTLY HIDE "Add a Product" features
    profileRoleBadge.innerHTML = `<span class="role-badge badge-customer">🛒 Customer</span>`;
    headerAddProductBtn.style.display = "none";
    shopkeeperBanner.style.display = "none"; // GUARANTEED HIDDEN for customers!
    if (myOrdersBtn) myOrdersBtn.style.display = "inline-block";
  }
}

profileToggle.addEventListener("click", () => {
  profileMenu.hidden = !profileMenu.hidden;
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("stylespectrum_token");
  localStorage.removeItem("stylespectrum_user");
  sessionStorage.removeItem("stylespectrum_token");
  sessionStorage.removeItem("stylespectrum_user");
  window.location.replace("login.html");
});

// --------------------------------------------------------------------------
// 3. Local Storage Helpers & Starter Fallback
// --------------------------------------------------------------------------
const STORAGE = {
  cart: "stylespectrum_cart_v2",
  wishlist: "stylespectrum_wishlist_v2",
  productsBackup: "stylespectrum_products_cache"
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

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    showToast("Browser storage full or unavailable.");
    return false;
  }
}

let cart = readStorage(STORAGE.cart, []);
let wishlist = readStorage(STORAGE.wishlist, []);
let products = readStorage(STORAGE.productsBackup, []);

let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let wishlistMode = false;
let toastTimer;

// Filter invalid cart/wishlist items
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
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// --------------------------------------------------------------------------
// 4. Fetch Products from Live MongoDB API
// --------------------------------------------------------------------------
async function fetchProductsFromBackend() {
  try {
    const res = await fetch(getApiUrl("/api/products"));
    const data = await res.json();

    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      // Map MongoDB _id to id for seamless UI rendering
      products = data.products.map(p => ({
        ...p,
        id: p._id || p.id,
        image: (p.images && p.images[0]) || p.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80"
      }));
      saveStorage(STORAGE.productsBackup, products);
    }
  } catch (err) {
    console.warn("Using offline / cached products:", err.message);
  }

  renderProducts();
}

function getImage(product) {
  if (product.image && (product.image.startsWith("http://") || product.image.startsWith("https://"))) {
    return product.image;
  }
  if (Array.isArray(product.images) && product.images[0]) {
    return product.images[0];
  }
  return "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80";
}

// --------------------------------------------------------------------------
// 5. Product Filtering & Rendering
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
      product.tag
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

  $("#resultCount").textContent = `${list.length} piece${list.length === 1 ? "" : "s"} found`;

  $("#shopTitle").innerHTML = wishlistMode
    ? "Your <em>wishlist.</em>"
    : activeCategory === "All"
      ? "Pieces you'll <em>love.</em>"
      : `${escapeHTML(activeCategory)} <em>collection.</em>`;

  $("#categoryFilter").value = activeCategory;

  grid.innerHTML = list.map(product => {
    const liked = wishlist.includes(product.id);
    const stock = Number(product.stock) || 0;

    return `
      <article class="product-card">
        <div class="product-image">
          <img
            src="${escapeHTML(getImage(product))}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80'"
          >
          ${product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : ""}
          <button
            class="wish-btn ${liked ? "active" : ""}"
            data-action="wishlist"
            data-id="${escapeHTML(product.id)}"
            aria-label="${liked ? "Remove from" : "Add to"} wishlist"
          >${liked ? "♥" : "♡"}</button>
          <button
            class="quick-add"
            data-action="add"
            data-id="${escapeHTML(product.id)}"
            ${stock < 1 ? "disabled" : ""}
          >${stock < 1 ? "Out of stock" : "＋ Add to Bag"}</button>
        </div>
        <div class="product-info">
          <div class="product-category">${escapeHTML(product.category)} ${product.shopName ? `• <small>${escapeHTML(product.shopName)}</small>` : ""}</div>
          <h3 class="product-name">${escapeHTML(product.name)}</h3>
          <div class="product-bottom">
            <span class="product-price">${money(product.price)}</span>
            <span class="product-stock">${stock > 0 ? `${stock} left` : "Sold out"}</span>
          </div>
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
// 6. Wishlist Management
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
// 7. Shopping Bag (Cart) Operations
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
        <p style="font-size: 16px; font-weight: 500;">Your bag is empty.</p>
        <p class="muted">Explore the collection and find your style.</p>
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
// 8. Real Checkout Flow (Stores Orders in stylespectrum_customer MongoDB)
// --------------------------------------------------------------------------
const checkoutModal = $("#checkoutModal");
const checkoutForm = $("#checkoutForm");
const checkoutSummary = $("#checkoutSummary");
const checkoutTotalBtn = $("#checkoutTotalBtn");
const closeCheckout = $("#closeCheckout");

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your bag is empty! Add products first.");
    return;
  }

  closeCart();
  checkoutModal.hidden = false;
  document.body.classList.add("no-scroll");

  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.qty, 0);
  checkoutTotalBtn.textContent = money(total);

  // Pre-fill user details if available
  if (currentUser) {
    $("#checkFullName").value = currentUser.name || "";
    $("#checkMobile").value = currentUser.mobile || "";
  }

  // Render summary
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
    <div style="border-top: 1px solid #ddd; margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-weight: 700;">
      <span>Total Payable</span>
      <span>${money(total)}</span>
    </div>
  `;
}

function closeCheckoutModal() {
  checkoutModal.hidden = true;
  document.body.classList.remove("no-scroll");
}

$("#checkoutBtn").addEventListener("click", openCheckout);
closeCheckout.addEventListener("click", closeCheckoutModal);

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const placeBtn = $("#placeOrderBtn");
  placeBtn.disabled = true;
  placeBtn.textContent = "Placing Order...";

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

    // Order successfully saved in MongoDB!
    cart = [];
    saveStorage(STORAGE.cart, cart);
    updateHeader();
    renderCart();

    closeCheckoutModal();
    showToast(`🎉 Order Placed! ID: ${data.order.orderId}`);

    // Automatically show orders history
    setTimeout(openOrdersModal, 800);

  } catch (err) {
    showToast(err.message || "Could not place order.");
  } finally {
    placeBtn.disabled = false;
    placeBtn.textContent = `Confirm & Place Order (${money(total)}) ↗`;
  }
});

// --------------------------------------------------------------------------
// 9. Customer Order History Modal
// --------------------------------------------------------------------------
const ordersModal = $("#ordersModal");
const closeOrdersModal = $("#closeOrdersModal");
const ordersListContainer = $("#ordersListContainer");

async function openOrdersModal() {
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
          <p style="font-size: 16px;">You haven't placed any orders yet.</p>
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

      return `
        <div class="order-card">
          <div class="order-card-header">
            <div>
              <span class="order-id">${escapeHTML(order.orderId)}</span>
              <div style="font-size: 11px; color: #888;">${orderDate}</div>
            </div>
            <span class="order-status">${escapeHTML(order.orderStatus || "Confirmed")}</span>
          </div>

          <div style="margin: 8px 0;">
            ${(order.items || []).map(it => `
              <div class="order-item-mini">
                <span>${escapeHTML(it.name)} × ${it.qty}</span>
                <strong>${money(it.price * it.qty)}</strong>
              </div>
            `).join("")}
          </div>

          <div style="border-top: 1px solid #ebdcd2; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 13px;">
            <span>Payment: <strong>${escapeHTML(order.paymentMethod)} (${order.paymentStatus})</strong></span>
            <span>Total: <strong style="color: #8c3b4a; font-size: 15px;">${money(order.totalAmount)}</strong></span>
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 4px;">
            Deliver to: ${escapeHTML(order.shippingAddress?.fullName)}, ${escapeHTML(order.shippingAddress?.city)} (${escapeHTML(order.shippingAddress?.pincode)})
          </div>
        </div>
      `;
    }).join("");

  } catch (err) {
    ordersListContainer.innerHTML = `<p style="color: red;">Failed to load orders: ${err.message}</p>`;
  }
}

if (myOrdersBtn) {
  myOrdersBtn.addEventListener("click", openOrdersModal);
}
closeOrdersModal.addEventListener("click", () => {
  ordersModal.hidden = true;
  document.body.classList.remove("no-scroll");
});

// --------------------------------------------------------------------------
// 10. Shopkeeper Add Product Modal (Saves to stylespectrum_shopkeeper MongoDB)
// --------------------------------------------------------------------------
const productModal = $("#productModal");
const productForm = $("#productForm");
const openProductFormBtn = $("#openProductForm");
const closeProductFormBtn = $("#closeProductForm");

function openProductModal() {
  if (!isShopkeeper) {
    showToast("Only registered shopkeepers can add products.");
    return;
  }
  productModal.hidden = false;
  document.body.classList.add("no-scroll");
  $("#prodName").focus();
}

function closeProductModal() {
  productModal.hidden = true;
  document.body.classList.remove("no-scroll");
}

if (openProductFormBtn) openProductFormBtn.addEventListener("click", openProductModal);
if (headerAddProductBtn) headerAddProductBtn.addEventListener("click", openProductModal);
closeProductFormBtn.addEventListener("click", closeProductModal);

productModal.addEventListener("click", (e) => {
  if (e.target === productModal) closeProductModal();
});

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const saveBtn = $("#saveProductBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving to MongoDB...";

  const name = $("#prodName").value.trim();
  const price = Number($("#prodPrice").value);
  const originalPrice = Number($("#prodOrigPrice").value) || price;
  const category = $("#prodCategory").value;
  const stock = Number($("#prodStock").value) || 10;
  const image = $("#prodImage").value.trim();
  const description = $("#prodDesc").value.trim();

  const payload = {
    name,
    price,
    originalPrice,
    category,
    stock,
    images: image ? [image] : [],
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
    closeProductModal();
    showToast("🎉 Product saved to live store!");

    // Refresh products list
    await fetchProductsFromBackend();
    $("#shop").scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    showToast(err.message || "Error adding product.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save to Live Store ↗";
  }
});

// --------------------------------------------------------------------------
// 11. Event Listeners for Storefront Controls
// --------------------------------------------------------------------------
document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => {
    selectCategory(card.dataset.category);
  });
});

$("#productGrid").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "add") addToCart(id);
  if (action === "wishlist") toggleWishlist(id);
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
  wishlistMode = false;
  $("#searchInput").value = "";
  $("#categoryFilter").value = "All";
  renderProducts();
});

$("#resetFilters").addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  wishlistMode = false;
  $("#searchInput").value = "";
  $("#categoryFilter").value = "All";
  renderProducts();
});

$("#wishlistToggle").addEventListener("click", () => {
  wishlistMode = !wishlistMode;
  activeCategory = "All";
  $("#categoryFilter").value = "All";
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

$("#cartToggle").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#drawerBackdrop").addEventListener("click", closeCart);

// Mobile navigation
$("#menuToggle").addEventListener("click", () => {
  $(".nav").classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    $(".nav").classList.remove("open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeProductModal();
    closeCheckoutModal();
    ordersModal.hidden = true;
    document.body.classList.remove("no-scroll");
  }
});

// Footer year
$("#year").textContent = new Date().getFullYear();

// Initialize Store
updateHeader();
renderCart();
fetchProductsFromBackend();
