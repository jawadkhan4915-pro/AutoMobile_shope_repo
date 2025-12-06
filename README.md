# Quick Start Guide: MERN Easy POS

This project has been converted from Laravel to a MERN (MongoDB, Express, React, Node.js) stack application.

## Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

## Folder Structure
- `backend/`: Node.js + Express API server
- `frontend/`: React + Vite client application

---

## 🚀 Getting Started

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` if needed
   ```bash
   cp .env.example .env
   ```

4. Seed the Database (Create Admin & Demo Data):
   ```bash
   npm run seed
   ```

5. Start the Server:
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```

4. Start the Development Server:
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:5173`

---

## 🔑 Default Login Credentials

**Admin User:**
- Email: `admin@admin.com`
- Password: `pass@123`

**Cashier User:**
- Email: `cashier@cashier.com`
- Password: `pass@123`

---

## 🛠️ Features

- **POS Terminal**: Fast checkout with barcode scanning simulation
- **Product Management**: Add, edit, delete products with image support
- **Customer Management**: track customer orders
- **Order History**: View past transactions
- **Dashboard**: Real-time sales statistics
- **Role-Based Access**: Admin and Cashier roles

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - List orders
- `GET /api/orders/stats/summary` - Sales statistics
