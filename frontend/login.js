const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginRoleInput = document.getElementById("loginRole");
const tabCustomer = document.getElementById("tabCustomer");
const tabShopkeeper = document.getElementById("tabShopkeeper");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginTitle = document.getElementById("loginTitle");
const loginSubtitle = document.getElementById("loginSubtitle");
const registeredBanner = document.getElementById("registeredBanner");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

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
// 1. Role Tabs Switching (Customer vs Shopkeeper)
// --------------------------------------------------------------------------
function setRole(role) {
  loginRoleInput.value = role;

  if (role === "shopkeeper") {
    tabShopkeeper.classList.add("active");
    tabShopkeeper.setAttribute("aria-selected", "true");
    tabCustomer.classList.remove("active");
    tabCustomer.setAttribute("aria-selected", "false");

    loginTitle.textContent = "Shopkeeper Portal";
    loginSubtitle.textContent = "Access your seller inventory and customer orders.";
    loginSubmitBtn.textContent = "Login as Shopkeeper ↗";
    loginSubmitBtn.style.background = "#6b333e";
  } else {
    tabCustomer.classList.add("active");
    tabCustomer.setAttribute("aria-selected", "true");
    tabShopkeeper.classList.remove("active");
    tabShopkeeper.setAttribute("aria-selected", "false");

    loginTitle.textContent = "Customer Sign In";
    loginSubtitle.textContent = "Access your shopping bag, orders, and curated collections.";
    loginSubmitBtn.textContent = "Login as Customer ↗";
    loginSubmitBtn.style.background = "#8c3b4a";
  }
}

tabCustomer.addEventListener("click", () => setRole("customer"));
tabShopkeeper.addEventListener("click", () => setRole("shopkeeper"));

// --------------------------------------------------------------------------
// 2. Read URL Parameters (e.g. after Registration redirect)
// --------------------------------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("registered") === "true") {
  registeredBanner.style.display = "block";
}
if (urlParams.get("role") === "shopkeeper") {
  setRole("shopkeeper");
} else {
  setRole("customer");
}
if (urlParams.get("email")) {
  emailInput.value = urlParams.get("email");
  passwordInput.focus();
}

// --------------------------------------------------------------------------
// 3. Form Submission
// --------------------------------------------------------------------------
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedRole = loginRoleInput.value;
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  loginMessage.textContent = `Signing in to ${selectedRole === "shopkeeper" ? "Shopkeeper Portal" : "Customer Account"}...`;
  loginMessage.style.color = "#8c3b4a";
  loginSubmitBtn.disabled = true;

  try {
    const response = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password, role: selectedRole })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.message || "Login failed. Please check your credentials.");
    }

    // Save tokens and user session
    localStorage.setItem("stylespectrum_token", data.token);
    sessionStorage.setItem("stylespectrum_token", data.token);

    if (data.user) {
      localStorage.setItem("stylespectrum_user", JSON.stringify(data.user));
      sessionStorage.setItem("stylespectrum_user", JSON.stringify(data.user));
    }

    loginMessage.style.color = "green";
    loginMessage.textContent = data.user.role === "shopkeeper"
      ? `✅ Welcome back, ${data.user.shopName || data.user.name}! Opening seller dashboard...`
      : `✅ Welcome back, ${data.user.name}! Opening store...`;

    // Flow: Register -> Login -> Website
    setTimeout(() => {
      window.location.replace("index.html");
    }, 700);

  } catch (error) {
    loginMessage.style.color = "red";
    loginMessage.textContent =
      error.message === "Failed to fetch"
        ? "Unable to connect to StyleSpectrum server. Please verify backend is running on http://localhost:5000."
        : error.message || "Unable to sign in. Please try again.";
  } finally {
    loginSubmitBtn.disabled = false;
  }
});
