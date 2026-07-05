# SHIVAM GENERAL STORE

![Shivam General Store](https://via.placeholder.com/1200x400.png?text=Shivam+General+Store+-+Official+E-commerce+Platform)

A production-quality, mobile-first e-commerce website custom-built for a single physical retail store. 

This platform empowers the shop owner to transition their entire brick-and-mortar operation online, catering seamlessly to both **everyday retail customers** and **bulk-purchasing shopkeepers**, all managed from a powerful, centralized Admin Dashboard.

> **Note:** This is an exclusive single-vendor platform (like Blinkit or JioMart), not a multi-vendor marketplace like Amazon or Flipkart.

---

## 1. Project Overview

**Shivam General Store** solves the operational bottleneck of managing a physical store with dual customer bases (Retail and Wholesale). By digitizing the inventory, pricing tiers, and order management, this application allows the owner to:

- Accept orders 24/7 without manual intervention.
- Prevent pricing confusion by automatically showing wholesale rates only to verified shopkeepers.
- Drastically reduce checkout time with local-storage cart persistence and streamlined delivery options (Home Delivery & Store Pickup).
- Monitor daily sales, order volumes, and low-stock alerts dynamically.

---

## 2. Features

### 👤 Guest Users
- **Browse & Search:** Effortlessly browse product catalogs and search for specific items.
- **Dynamic Cart:** Add items to a persistent cart that saves locally to the device without requiring an account.
- **Transparent Pricing:** View standard retail pricing for all items.

### 🛒 Retail Customers
- **Authentication:** Secure Email & Password Login / Registration via Supabase.
- **Seamless Checkout:** Place orders for Home Delivery (with dynamic delivery charges) or Store Pickup (Free).
- **Order Tracking:** Track the status of active orders (Placed, Preparing, Out for Delivery).
- **Address Management:** Pre-filled address and contact details saved to the user profile.

### 🏪 Shopkeepers (Bulk Purchasers)
- **Specialized Onboarding:** Separate registration flow tailored for shopkeepers (requires GST/Business details).
- **Approval System:** Accounts remain in a "Pending" state, seeing only Retail prices until the Admin explicitly approves them.
- **Wholesale Pricing:** Once approved, the entire catalog dynamically updates to reveal discounted bulk pricing.
- **High-Volume Ordering:** Streamlined checkout process designed for bulk inventory restocking.

### 👑 Owner / Admin
The Owner/Admin has absolute control over the platform via a secure, protected dashboard route (`/admin`).

- **Executive Dashboard:** Live metrics including Today's Revenue, Order Volume, Total Customers, and Low Stock Alerts visualized via Recharts.
- **Product Management:** Full CRUD capabilities for the inventory. Set distinct Retail vs. Wholesale prices.
- **Order Management:** View all incoming orders, distinguish between Retail and Shopkeeper purchases, and manually update fulfillment statuses.
- **Customer & Approvals:** Tabbed interface to review the customer base and actively Approve or Reject pending Shopkeeper registrations.
- **Store Settings:** Toggle Home Delivery or Store Pickup globally, and dynamically adjust Free Delivery thresholds and delivery charges.

---

## 3. Technology Stack

Built with modern, scalable, and highly performant technologies.

### Frontend
- **Next.js (App Router):** Leveraging server components and server actions for optimal performance and SEO.
- **React (JavaScript):** Component-based architecture without the overhead of TypeScript, as requested.
- **Tailwind CSS (v3):** Utility-first styling ensuring a robust, mobile-first responsive design.
- **Shadcn UI:** Premium, accessible, and customizable UI components (Buttons, Tables, Tabs, Inputs, Radios).
- **Lucide React Icons:** Clean and modern iconography.

### Backend & Database
- **Supabase:** The complete backend-as-a-service.
- **Supabase PostgreSQL:** Highly relational data modeling utilizing Enums and complex constraints.
- **Supabase Auth:** Secure JWT-based authentication bridging Server Components, Middleware, and Client Components.

### Tooling & Integrations
- **React Hook Form & Zod:** Bulletproof client and server-side form validation.
- **Recharts:** Responsive, composable charting for the Admin Dashboard.
- **Sonner:** Beautiful, unobtrusive toast notifications for state mutations.

---

## 4. Database Schema & Security Strategy

The application uses a robust PostgreSQL schema (located in `supabase/schema.sql`). 

### Security & Row Level Security (RLS)
Security is handled natively at the database level using Supabase RLS, ensuring zero data leakage:

1. **Role-Based Access Control (RBAC):** Users are strictly categorized via a `user_role` Enum:
   - `retail`
   - `shopkeeper_pending`
   - `shopkeeper_approved`
   - `admin`
2. **Data Isolation:**
   - **Profiles:** Users can only `SELECT` and `UPDATE` their own profile data.
   - **Orders:** Customers can only view their own orders. Admins can view all orders.
   - **Products:** Anyone can view products, but only the `admin` role can `INSERT`, `UPDATE`, or `DELETE`.
3. **Automated Triggers:** A `handle_new_user()` trigger automatically intercepts Supabase Auth signups, extracting metadata to initialize the public `users` profile safely.

### Protected Routes
Next.js Middleware rigorously protects all `/admin` routes. Any unauthenticated or unauthorized access attempt is instantly redirected to the `/login` page before the server even renders the page.

---

## 5. Deployment Strategy

The application is architected to be deployed seamlessly on **Vercel**.

1. **Environment Variables:** Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Stateless Edge:** Uses Next.js Server Actions exclusively for data mutations, eliminating the need for a separate Node.js/Express backend.
3. **Database Migrations:** The `supabase/schema.sql` can be executed directly in the Supabase SQL Editor to instantly provision the database architecture.

---

## 6. Local Development

To run this project locally:

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env.local` and populate it with your Supabase credentials.
4. Execute `supabase/schema.sql` in your Supabase project.
5. Run `npm run dev` to start the development server at `http://localhost:3000`.

---
*Designed and built for production. Crafted with care.*
