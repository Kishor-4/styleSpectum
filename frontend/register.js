const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const shopkeeperFields = document.getElementById("shopkeeperFields");
const shopNameInput = document.getElementById("shopName");
const submitBtn = document.getElementById("submitBtn");
const roleRadios = document.querySelectorAll('input[name="role"]');

// Toggle shopkeeper fields visibility
roleRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "shopkeeper") {
      shopkeeperFields.style.display = "block";
      shopNameInput.setAttribute("required", "required");
      submitBtn.textContent = "Create Shopkeeper Account";
    } else {
      shopkeeperFields.style.display = "none";
      shopNameInput.removeAttribute("required");
      submitBtn.textContent = "Create Account";
    }
  });
});

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const selectedRole = document.querySelector('input[name="role"]:checked').value;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const password = document.getElementById("password").value;
  const shopName = document.getElementById("shopName").value.trim();
  const shopAddress = document.getElementById("shopAddress").value.trim();

  registerMessage.style.color = "#8c3b4a";
  registerMessage.textContent = "Creating your account...";

  const payload = {
    name,
    email,
    mobile,
    password,
    role: selectedRole
  };

  if (selectedRole === "shopkeeper") {
    if (!shopName) {
      registerMessage.style.color = "red";
      registerMessage.textContent = "Please enter your Shop Name.";
      return;
    }
    payload.shopName = shopName;
    payload.shopAddress = shopAddress;
  }

  // Determine API base url (works both locally and when deployed)
  const apiUrl = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? (window.location.port === "5000" ? "/api/auth/register" : "http://localhost:5000/api/auth/register")
    : "/api/auth/register";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "Registration failed.");
    }

    registerMessage.style.color = "green";
    registerMessage.textContent =
      data.message || "Account created successfully! Opening login...";

    registerForm.reset();

    // Auto-save session if token provided
    if (data.token && data.user) {
      localStorage.setItem("stylespectrum_token", data.token);
      localStorage.setItem("stylespectrum_user", JSON.stringify(data.user));
    }

    setTimeout(function () {
      window.location.href = "login.html";
    }, 1200);

  } catch (error) {
    registerMessage.style.color = "red";
    registerMessage.textContent =
      error.message === "Failed to fetch"
        ? "Unable to connect to StyleSpectrum server. Please ensure the backend server is running."
        : error.message || "Something went wrong. Please try again.";
  }
});
