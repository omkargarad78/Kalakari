# L'Aura Crochet | Premium Luxury E-Commerce Platform

Welcome to the production-ready code repository for **L'Aura Crochet**, an Apple-inspired luxury handcrafted crochet boutique. This full-stack e-commerce system is designed to allow customers to browse, search, purchase via direct UPI QR verification, and request custom handmade crochet wear, while offering the artisan (owner) a real-time admin control dashboard to oversee products and audit transfers.

---

## 🏗️ Architecture & Features

The platform follows a clean decoupled structure:
- **Backend:** Fast, asynchronous REST API powered by **FastAPI (Python)**, utilizing **SQLAlchemy ORM** and secure **JWT (access/refresh) authorization** schemas. Supports PostgreSQL and local SQLite sandboxes.
- **Frontend:** Server-side rendered, lightning-fast catalog client powered by **Next.js 15 (React 19)**, compiled using highly styled **Tailwind CSS v4** tokens, smooth micro-animations using **Framer Motion**, and persistent cart baskets.
- **UPI QR Code payment Engine:** Secure fee-free Indian UPI transaction flow displaying real-time scanned codes with 12-digit UTR verification logs matching and image screenshot audits.
- **Artisan Dashboard:** Real-time analytics, monthly sales bar graphs, low-yarn warning notifications, dragging image uploaders, and custom requests pricing quotations widgets.

---

## 📁 Repository Directory Structure

```
/ (Root)
├── backend/                  # FastAPI REST API (Python)
│   ├── app/
│   │   ├── api/v1/           # Modular routers (auth, products, orders, etc.)
│   │   ├── core/             # JWT config, security schemas, mail template engines
│   │   ├── db/               # SQLAlchemy Session generators, seed utilities
│   │   ├── models/           # Declarative mapping models
│   │   ├── schemas/          # Pydantic validation parameters
│   │   ├── services/         # Cloudinary fallbacks, Resend transactional emails
│   │   └── main.py           # Core server entry point
│   ├── Requirements.txt      # Backend libraries list
│   └── Dockerfile            # Dynamic Render deploy script
├── frontend/                 # Next.js 15 App Client (TypeScript)
│   ├── src/
│   │   ├── app/              # App router layouts & checkout wizards
│   │   ├── components/       # Magnifying zoom galleries, navigation headers, sidebars
│   │   ├── context/          # Persistent baskets, authorization tokens, wishlist caches
│   │   └── lib/              # Axios API clients
│   ├── tailwind.config.ts    # Custom luxury theme palettes
│   ├── package.json          # Node dependencies list
│   └── Dockerfile            # Multi-stage standalone node deploy compiler
└── README.md                 # Main Documentation
```

---

## 🛠️ Environment Variables Configuration

Both backend and frontend contain an `.env.example` file. Copy them as active configurations:

### 🐍 Backend (`/backend/.env`)
```ini
PROJECT_NAME="Premium Crochet Platform API"
ENVIRONMENT=development

# Database configuration (Defaults to SQLite for local sandboxing)
DATABASE_URL=sqlite:///./crochet.db

# JWT Cryptography details
JWT_SECRET=SUPER_SECRET_TOKEN_FOR_JWT_SIGNING_CHANGE_THIS_IN_PRODUCTION
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS configurations (comma separated)
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Cloudinary Integration (Leave blank to use local disk folder fallback uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend Mail Service (Leave blank to log emails to console terminal outbox)
RESEND_API_KEY=
SENDER_EMAIL=noreply@crochetboutique.com

# UPI merchant ID (for dynamically generating payment links)
UPI_ID=familycrochet@upibank
MERCH_NAME="L'Aura Crochet Atelier"
```

### ⚛️ Frontend (`/frontend/.env.local`)
```ini
# Address to the active FastAPI server
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🚀 Getting Started (Local Sandboxing)

You can run and test the complete production flow out-of-the-box in 3 minutes without requiring external accounts (PostgreSQL, Cloudinary, Resend are fully mocked/fallback by default!).

### 1. Initialize and Run Backend
1. Open a new terminal in `/backend`.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the automatic seed script to populate test categories, products, and admin credentials:
   ```bash
   python app/db/seed.py
   ```
5. Launch development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The Swagger API documentation is now live at `http://127.0.0.1:8000/docs`.*

### 2. Initialize and Run Frontend Client
1. Open a second terminal in `/frontend`.
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your web browser.

---

## 🧑‍💻 Seeding Accounts Credentials

The seeding script auto-populates the database with the following demo accounts:
- **Artisan (Admin):**
  - **Email:** `admin@crochet.com`
  - **Password:** `admin123`
- **Collector (Customer):**
  - **Email:** `customer@crochet.com`
  - **Password:** `customer123`

---

## ☁️ Deployment Guide (Render)

The project includes production-ready Dockerfiles optimized for zero-configuration deploys on **Render**:

### 1. PostgreSQL Database
- Create a new **PostgreSQL** database service on Render.
- Copy the internal/external database connection string.

### 2. FastAPI Backend Service
- Create a new **Web Service** on Render, linking to your repository.
- **Environment:** `Docker`
- **Root Directory:** `backend`
- Add environment variables:
  - `DATABASE_URL`: *Your Render PostgreSQL string*
  - `JWT_SECRET`: *A secure random string*
  - `PORT`: `8000`
  - Configure `CLOUDINARY_` and `RESEND_API_KEY` for live image/email delivery.

### 3. Next.js Frontend Service
- Create a second **Web Service** (or Static Site) on Render.
- **Environment:** `Docker`
- **Root Directory:** `frontend`
- Add environment variables:
  - `NEXT_PUBLIC_API_URL`: *The live URL of your backend FastAPI web service*
