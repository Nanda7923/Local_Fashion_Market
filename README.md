# Fashion Marketplace

A full-stack e-commerce platform for fashion apparel, featuring product browsing, shopping cart functionality, user wishlists, order management, and a dedicated admin portal.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js (App Router, React, TypeScript)
- **State Management:** Redux Toolkit & RTK Query
- **Styling:** CSS Modules / Tailwind CSS

### Backend
- **Runtime:** Node.js & Express
- **Architecture:** Controller-Service Pattern
- **Database / ODM:** MongoDB / Mongoose *(update if using PostgreSQL/Prisma)*
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Local storage (`backend/uploads/`) *(or Cloudinary/S3)*

---

## 📂 Project Structure

```text
fashion_market_place/
├── backend/
│   ├── bin/www              # Server entry point
│   ├── controllers/         # Request handling & input validation
│   ├── models/              # Database models/schemas
│   ├── routes/              # Express API endpoints
│   ├── services/            # Business logic
│   └── uploads/             # Static file storage (avatars, products, logos)
├── frontend/
│   ├── app/                 # Next.js App Router (pages & components)
│   │   ├── admin/           # Admin dashboard & product management
│   │   ├── cart/            # Cart & checkout workflow
│   │   ├── products/        # Product catalog, filters, & detail pages
│   │   └── profile/         # User dashboard & settings
│   └── lib/                 # Redux store, slices, and RTK Query APIs
└── README.md
