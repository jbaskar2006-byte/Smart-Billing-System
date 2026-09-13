# 🍽️ Smart Tiffin Shop — POS & Merchant Payment System

A modern, fast, and resilient Point of Sale (POS) and Merchant Payment System built for tiffin shops and small restaurants. Features a **React + Vite** responsive web frontend, a **Golang + Gin** high-performance REST API backend, and a **MySQL** persistent database.

---

## 🌟 Key Features

### 🛒 Customer POS & Self-Ordering
- **Visual Menu Selection**: Interactive food menu featuring standard tiffin items (`Idli`, `Vadai`, `Poori`, `Chapati`, `Pongal`, `Omelette`, `Half Boil`).
- **Cart & Order Summary**: Real-time quantity increment/decrement with subtotal calculations.
- **Persistent Cart & State**: Customer orders and cart contents persist in `localStorage` and MySQL across browser restarts until cleared or completed.

### 💳 Merchant Payment Sensing & Instant Verification
- **Dynamic UPI QR Code**: Instant UPI QR code generation with exact order totals.
- **20-Second Background Merchant Sensing**: Built-in 20-second sensing window for seamless payment verification.
- **Strict Bill Verification**: Receipt generation and view access are **strictly locked** until payment status is confirmed as `SUCCESS`. Pre-payment receipt viewing is blocked.

### 🛡️ Admin Dashboard & Inventory Control
- **Secure Admin Authentication**: Protected login portal for shop managers.
- **Permanent Product Price Updates**: Real-time price edits saved permanently to MySQL.
- **Sales Analytics & Reports**: Daily, monthly, and yearly revenue breakdowns.
- **System Reset ("RESET DATA TO 0")**: One-click system reset button that clears order sales history back to zero while preserving menu products and catalog pricing.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | SPA with smooth transitions, custom CSS design system, and responsive layout. |
| **Backend** | Golang 1.22 + Gin Framework | Ultra-fast RESTful API server handling payments, orders, and products. |
| **Database** | MySQL 8.0 | Relational database storage with 6 structured schema tables. |
| **Styling** | Custom Vanilla CSS | Glassmorphism, modern typography (Inter & Outfit fonts), dynamic micro-animations. |
| **Deployment** | GitHub Pages / Vercel / Netlify | Optimized production build with relative asset path entrypoint (`index.html`). |

---

## 📂 Project Architecture

```
smart-billing-system/
├── index.html                   # Production web app entrypoint
├── assets/                      # Built CSS & JavaScript bundle chunks
├── images/                      # Food item images (Idli, Poori, Vadai, etc.)
├── upi_qr.jpg                   # UPI Payment QR Code
├── smart_tiffin_shop.sql        # Complete MySQL database export dump
├── start_smart_tiffin_shop.bat  # 1-Click Windows batch launcher
│
├── database/                    # Database creation & seed scripts
│   ├── schema.sql               # DDL table creation scripts
│   └── seed.sql                 # Initial catalog seed data
│
└── smart-tiffin-shop/           # Full Source Code
    ├── backend/                 # Golang backend server
    │   ├── main.go              # Server launcher
    │   ├── config/              # MySQL connection setup
    │   ├── controllers/         # API business logic (order, product, payment, admin)
    │   ├── models/              # GORM / Struct data models
    │   └── routes/              # API endpoints registration
    │
    └── frontend/                # React source code
        ├── src/
        │   ├── components/      # Navbar, Sidebar, Badges
        │   ├── pages/           # BillingPage, PaymentPage, BillPage, AdminDashboard
        │   └── services/        # Axios API client services
        └── package.json
```

---

## 🗄️ Database Schema & Setup

The system automatically initializes the database schema upon first launch. Alternatively, import `smart_tiffin_shop.sql` into **MySQL Workbench** or command line:

### MySQL Credentials (Default)
- **Host**: `127.0.0.1:3306`
- **User**: `root`
- **Password**: `Root@123`
- **Database**: `smart_tiffin_shop`

### Schema Tables
1. **`products`**: Product catalog (`id`, `name`, `price`, `image_url`, `is_available`).
2. **`orders`**: Customer order headers (`order_id`, `customer_name`, `total_amount`, `status`, `created_at`).
3. **`order_items`**: Line items for each order (`item_id`, `order_id`, `product_id`, `quantity`, `subtotal`).
4. **`payments`**: Payment transaction logs (`payment_id`, `order_id`, `payment_status`, `amount`, `verified_at`).
5. **`bills`**: Verified customer bills (`bill_id`, `order_id`, `receipt_number`, `created_at`).
6. **`admins`**: Shop manager credentials (`admin_id`, `username`, `password_hash`).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Go** (v1.20+)
- **MySQL** Server running locally on port `3306`

### 2. 1-Click Launch (Windows)
Double-click `start_smart_tiffin_shop.bat` in the root folder. It will start both the backend API and frontend dev server automatically!

### 3. Manual Launch

#### Start Backend:
```bash
cd smart-tiffin-shop/backend
go run main.go
```
*Backend runs on `http://localhost:8080`*

#### Start Frontend:
```bash
cd smart-tiffin-shop/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔒 Security & Verification Rules

- **Bill Access Protection**: Receipt routes (`/bill/:orderId`) strictly query payment verification status. Attempts to view unverified bills return a `403 Payment Verification Required` notice.
- **Admin Authentication**: Admin routes (`/admin/dashboard`, `/admin/products`) require valid authentication tokens stored securely in session headers.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
