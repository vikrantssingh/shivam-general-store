# SHIVAM GENERAL STORE

![Shivam General Store](https://via.placeholder.com/1200x400.png?text=Shivam+General+Store+-+Official+E-commerce+Platform)

**🌐 Live Demo / Official Website:** [https://shivam-general-store.vercel.app](https://shivam-general-store.vercel.app/)

A production-quality, mobile-first e-commerce website custom-built for a physical retail store. 

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
- **Advanced Product Management:** 
  - Full CRUD capabilities for the inventory.
  - Set distinct Retail vs. Wholesale prices.
  - **Dynamic Purchase Limits:** Enforce maximum purchase limits per order, customizable separately for Retailers and Wholesalers.
  - **Dual Units of Measurement:** Define separate packaging units for Retail (e.g., 1 Piece) and Wholesale (e.g., 1 Box).
- **Order Management:** View all incoming orders, distinguish between Retail and Shopkeeper purchases, and manually update fulfillment statuses.
- **Customer & Approvals:** Tabbed interface to review the customer base and actively Approve or Reject pending Shopkeeper registrations.
- **Store Settings:** Toggle Home Delivery or Store Pickup globally, and dynamically adjust Free Delivery thresholds and delivery charges.

---

## 3. High-Performance Optimizations

To ensure the platform scales flawlessly to 10,000+ items while remaining on Free Tier cloud plans, several advanced optimizations are integrated:

- **Aggressive Image Compression:** Uses `browser-image-compression` to force all admin uploads below **30 KB**, saving massive storage capacity.
- **Automated Square Cropping:** Custom HTML5 Canvas logic instantly crops photos into a perfect 1:1 square on the device before uploading, ensuring UI uniformity.
- **Auto Storage Cleanup:** The Supabase Admin Client automatically bypasses Row Level Security to hunt down and permanently delete old/orphaned images when a product is updated or deleted, maintaining pristine storage.
- **Bandwidth (Egress) Optimization:** The homepage is hard-capped to load only 24 items initially, preventing massive database queries and protecting cloud egress limits.
- **Dual Mobile Upload UI:** Features explicit "Direct Camera" and "Upload from Gallery" buttons for a native-like mobile admin experience.
- **Race Condition Prevention:** Validates live stock precisely at the millisecond of order placement to prevent over-selling.

---

## 4. Technology Stack

Built with modern, scalable, and highly performant technologies.

### Frontend
- **Next.js (App Router):** Leveraging server components and server actions for optimal performance and SEO.
- **React (JavaScript):** Component-based architecture without the overhead of TypeScript, as requested.
- **Tailwind CSS (v3):** Utility-first styling ensuring a robust, mobile-first responsive design.
- **Shadcn UI:** Premium, accessible, and customizable UI components.
- **Lucide React Icons:** Clean and modern iconography.

### Backend & Database
- **Supabase:** The complete backend-as-a-service.
- **Supabase PostgreSQL:** Highly relational data modeling utilizing Enums and complex constraints.
- **Supabase Auth:** Secure JWT-based authentication bridging Server Components, Middleware, and Client Components.

---

## 💬 Feedback & Suggestions

If you have any feedback or suggestions to make this platform even better, please feel free to email me:
📧 **Email:** [vikrantsingh112211@gmail.com](mailto:vikrantsingh112211@gmail.com)

---
*Designed and built for production. Crafted with care.*
