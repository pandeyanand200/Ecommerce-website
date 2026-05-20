# LuxeStore - General Ecommerce Web Application

A fully functional, production-ready general ecommerce store built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features

- **Storefront**: Browse products by category, search, filter, and view detailed product information.
- **Shopping Cart**: Add, update, and remove products. Cart is saved locally for guests and synced for logged-in users.
- **Checkout & Payments**: Secure checkout process with Razorpay integration for UPI, Cards, and NetBanking, plus Cash on Delivery.
- **User Accounts**: Registration, login, profile management, and order history.
- **Admin Panel**: Comprehensive dashboard to manage products, view orders, update order statuses, and manage customers.
- **Design System**: Beautiful, responsive design using Tailwind CSS with a deep navy and amber gold color scheme.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, React Router v6, Context API, Axios, Recharts, React Icons, React Toastify
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth, bcryptjs, Multer, Cloudinary, Razorpay

## Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for image uploads)
- Razorpay Account (for payments)

## Setup Instructions

### 1. Install Dependencies
Run the following from the root directory:
```bash
npm run install-all
```

### 2. Environment Variables
In the `backend` folder, verify the `.env` file matches your credentials.

### 3. Running the Application
From the root directory:
```bash
# Run both frontend and backend in development mode
npm run dev
```
The application will be available at `http://localhost:5173/`

## Deployment Guide
This project is configured for easy deployment on platforms like **Render**, **Railway**, or **DigitalOcean**.

1. **Build Step**: `npm run build` (This builds the frontend and places it in `frontend/dist`).
2. **Start Step**: `npm start` (This starts the backend, which is configured to serve the frontend in production).
3. **Environment Variables**:
   - `NODE_ENV`: set to `production`
   - `VITE_API_URL`: (Optional) The URL of your deployed backend if different from the host.
   - All backend variables from `.env` (MONGO_URI, JWT_SECRET, etc.)

### 4. Admin Access

To access the admin panel, register a new user normally through the frontend UI.
Then, open your MongoDB database (using MongoDB Compass or similar), find your user document in the `users` collection, and change the `"role"` field from `"user"` to `"admin"`.
Log back in to see the Admin Dashboard link.

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products/:id/review`

### Cart & Orders
- `GET/POST/PUT/DELETE /api/cart`
- `POST /api/orders`
- `POST /api/orders/razorpay/create`
- `POST /api/orders/razorpay/verify`

### Admin
- `GET /api/admin/dashboard`
- `GET/POST/PUT/DELETE /api/admin/products`
- `GET /api/admin/orders`
- `GET /api/admin/customers`
