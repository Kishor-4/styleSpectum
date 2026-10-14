const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function getApiUrl(endpoint) {
  if (window.location.protocol === "file:") {
    return `http://localhost:5000${endpoint}`;
  }
  if (window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")) {
    return window.location.port === "5000" ? endpoint : `http://localhost:5000${endpoint}`;
  }
  return endpoint;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "Signing in...";
  loginMessage.style.color = "#8c3b4a";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.message || "Login failed. Please check your email and password.");
    }

    // Persist session across all browser tabs using localStorage
    localStorage.setItem("stylespectrum_token", data.token);
    sessionStorage.setItem("stylespectrum_token", data.token);

    if (data.user) {
      localStorage.setItem("stylespectrum_user", JSON.stringify(data.user));
      sessionStorage.setItem("stylespectrum_user", JSON.stringify(data.user));
    }

    loginMessage.style.color = "green";
    loginMessage.textContent = data.user.role === "shopkeeper"
      ? `Welcome back, ${data.user.shopName || data.user.name}! Opening store manager...`
      : `Welcome back, ${data.user.name}! Opening store...`;

    setTimeout(() => {
      window.location.replace("index.html");
    }, 600);
  } catch (error) {
    loginMessage.style.color = "red";
    loginMessage.textContent =
      error.message === "Failed to fetch"
        ? "Unable to connect to the server. Please verify backend is running on http://localhost:5000."
        : error.message || "Unable to sign in. Please try again.";
  }
});
