# Shivam General Store - Modern E-Commerce Platform

Welcome to the official repository for **Shivam General Store**, a production-grade, highly scalable, and secure single-vendor e-commerce platform built specifically for mobile-first users.

## 🚀 Overview

Shivam General Store is designed to provide a premium shopping experience with seamless performance. It is built to support two distinct customer segments: **Retail Customers** and **Shopkeepers (Bulk Buyers)**, all managed through a robust **Owner/Admin Dashboard**.

This platform is NOT a multi-vendor marketplace; it is tailored exclusively for a single store to dominate its local market with features rivaling top-tier e-commerce giants.

## 🛠 Technology Stack

This project is built using modern, edge-ready technologies to ensure blazing-fast load times and unparalleled security:

- **Frontend:** Next.js 14 (App Router), React, JavaScript
- **Styling:** Tailwind CSS, Shadcn UI, Lucide Icons
- **Forms & Validation:** React Hook Form, Zod
- **State Management:** React Context API
- **Charts (Admin):** Recharts
- **Notifications:** Sonner
- **Backend & Database:** Supabase (PostgreSQL, Storage, Auth)
- **Deployment:** Vercel

---

## 🏗 Architecture & Strategy

Our codebase follows a strict separation of concerns to guarantee maintainability and ease of navigation:

```text
src/
├── app/          # Next.js App Router (Pages, Layouts, Route Groups)
├── frontend/     # UI Components, React Context, Custom Hooks
└── backend/      # Next.js Server Actions, Supabase Clients, Zod Validations
```

### 1. Mobile-First & Premium UI Strategy
The majority of customers will shop using their mobile devices. Therefore, the UI is meticulously designed for small screens first, featuring bottom navigation, touch-friendly touch targets, smooth micro-animations, and a "glassmorphism" premium aesthetic using Tailwind CSS and Shadcn.

### 2. The Hybrid Cart Strategy
Guests can browse, search, and add items to a **local cart** without logging in. Upon successful login or registration, the local cart seamlessly synchronizes with the user's database cart via Server Actions, ensuring zero friction in the conversion funnel.

### 3. Server Actions Over API Routes
To minimize client-side javascript and improve security, we heavily utilize **Next.js Server Actions**. Database mutations (e.g., adding to cart, placing orders, updating stock) happen entirely on the server, tightly coupled with our frontend forms via Zod validation.

---

## 🔐 Advanced Security Measures

Security is the backbone of this platform. We employ a multi-layered defense strategy:

1. **Supabase Authentication:** Secure Email/Password authentication with encrypted session management.
2. **Row Level Security (RLS):** Policies enforced directly at the PostgreSQL database level.
   - *Example:* A user can only `SELECT` their own orders. An Admin can `SELECT` all. If a hacker bypasses the frontend, the database will outright reject unauthorized queries.
3. **Role-Based Access Control (RBAC):** Users are assigned roles (`retail`, `shopkeeper_pending`, `shopkeeper_approved`, `admin`).
   - Shopkeeper pricing and bulk limits are strictly hidden at the server level unless the `role` evaluates to `shopkeeper_approved`.
4. **Middleware Protection:** Next.js Edge Middleware intercepts requests to `/admin` and `/shopkeeper` routes, instantly redirecting unauthorized users before the page even begins to render.
5. **Strict Input Validation:** Every form submission is validated on the client (for UX) and re-validated on the server (for security) using **Zod** to prevent SQL injection, XSS, and payload manipulation.

---

## 👥 User Roles & Features

### 1. Retail Customer
- **Access:** Open registration.
- **Features:** Browse products at retail prices, search & filter, local/synced cart, checkout, order tracking, invoice history, profile & address management.

### 2. Shopkeeper (Bulk Buyer)
- **Access:** Requires Admin Approval.
- **Features:** 
  - Submits business details (GST, Shop Name) during registration.
  - Until approved, cannot see bulk pricing.
  - Once approved, gains access to exclusive shopkeeper prices, separate bulk purchase limits, and priority dashboard features.

### 3. Owner / Admin
- **Access:** Manually provisioned secure accounts.
- **Features:** 
  - **Dashboard:** Analytics powered by Recharts (Sales, Orders, Stock Alerts).
  - **Product Management:** Full CRUD operations, image uploads, stock/price quick edits.
  - **Order Management:** Status tracking (Preparing -> Out for Delivery -> Delivered).
  - **Customer Management:** Approve/Reject shopkeeper requests, view customer history.
  - **Store Settings:** Configure dynamic location-based delivery charges and timeframes.

---

## 📦 Deployment Instructions

1. Link the repository to **Vercel**.
2. Set the following environment variables provided by your Supabase project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (For Admin Server Actions)
3. Deploy! Next.js and Vercel will automatically handle static generation and edge caching for optimal performance.
