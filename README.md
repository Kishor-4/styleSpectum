# StyleSpectrum ✦ Multi-Category Fashion E-Commerce Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Kishor-4/styleSpectum)

A modern, full-stack Indian fashion e-commerce web application featuring dual MongoDB Atlas database segregation (Customer vs Shopkeeper), role-based workflows, dynamic catalog management, and seamless order tracking.

---

## 🚀 1-Click Hosting on Render

You can deploy this application directly to **Render** with a single click:

👉 **[Deploy to Render Now](https://render.com/deploy?repo=https://github.com/Kishor-4/styleSpectum)**

### Render Manual Setup (If preferred):
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository: `https://github.com/Kishor-4/styleSpectum`.
3. Fill in the following:
   - **Name:** `stylespectrum` (your custom name)
   - **Region:** `Singapore` (or Frankfurt)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. In **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://kishorchoudhary00045_db_user:Soyr5zz3ruG3Yyg8@stylespectrum.bmo50f8.mongodb.net/stylespectrum?retryWrites=true&w=majority&appName=Stylespectrum`
   - `JWT_SECRET`: `761884b53b32bb22a9d4d02c6000717b619f201e3ed9de4096a67f9b96d1bc31`
   - `NODE_ENV`: `production`
5. Click **Create Web Service**. Your live HTTPS URL (e.g., `https://stylespectrum.onrender.com`) will be active in 1-2 minutes!

> **⚠️ Important:** In your [MongoDB Atlas Console](https://cloud.mongodb.com/) ➔ **Network Access**, ensure IP `0.0.0.0/0` (Allow Access from Anywhere) is active so Render's cloud servers can connect to your database.

---

## ⚡ Superfast Instant Loading & Cold-Start Prevention

Render's free tier automatically puts inactive web services into "sleep mode" after 15 minutes of inactivity, which causes a **50-90 second delay (Cold Start)** when you next click the link.

We have integrated 3 powerful solutions so your project starts **instantly within 1-2 seconds**:

1. **Automatic Keep-Alive Pinger (Built-in Server):**
   - The server includes an internal self-ping mechanism that pings `/ping` every 10 minutes when running on Render, keeping the container warm 24/7.
2. **Automated GitHub Actions Cron:**
   - A GitHub Action (`.github/workflows/keep-alive.yml`) runs every 10 minutes automatically to keep the server awake.
3. **UptimeRobot Free Monitoring (Recommended for 100% 24/7 Uptime):**
   - Go to [UptimeRobot.com](https://uptimerobot.com/) (Free account).
   - Click **Add New Monitor** ➔ Type: `HTTP(s)`.
   - Friendly Name: `StyleSpectrum`.
   - URL: `https://stylespectrum-store.onrender.com/ping` (or your Render URL).
   - Monitoring Interval: `5 minutes` or `10 minutes`.
   - Click **Create Monitor**. Render will now **NEVER** go to sleep, opening instantly on every click!

---

## 🔄 User Journey & Role Segregation

1. **Step 1: Registration (`register.html`)**
   - New visitors must register first. Choose between **🛒 Customer** or **🏪 Shopkeeper**.
   - Customer details are saved in `stylespectrum_customer`.
   - Shopkeeper details are saved in `stylespectrum_shopkeeper`.
2. **Step 2: Role-Segregated Login (`login.html`)**
   - Dedicated tabs for **🛒 Customer Login** and **🏪 Shopkeeper Login**.
   - Secure verification with bcrypt and JWT tokens.
3. **Step 3: Store Access (`index.html`)**
   - **Customer:** Browse 30+ distinct fashion products, add to cart & wishlist (saved in MongoDB), checkout with full shipping details, and view order history in "My Orders".
   - **Shopkeeper:** View customer orders dashboard, add new products with custom images, and permanently delete products from the store catalog.
