# 🧶 Utsaah — Handcrafted with Zeal

A full-stack e-commerce platform for handmade crochet, customised gifts and home decor, built on the **MERN stack** (MongoDB, Express, React, Node.js) based on the Utsaah SRS v1.0.

The project has **three independent apps** in this folder:

```
utsaah/
├── backend/     Node.js + Express + MongoDB REST API
├── frontend/    Customer-facing storefront (React + Vite + Tailwind)
└── admin/       Admin dashboard for managing the store (React + Vite + Tailwind)
```

This mirrors a standard production MERN e-commerce split: one API, and two separate single-page apps (customers never see admin code, and vice versa).

---

## ✨ What's included

**Storefront (frontend)**
- Home page with categories, featured/new/bestseller collections, custom-order CTA, Instagram teaser, newsletter signup
- Shop page with search, category/price filters, sorting, pagination
- Product detail page with gallery, specs, reviews, "you might also love"
- Cart (guest cart in browser storage, merges into account on login) & Wishlist (account required)
- Full checkout: saved addresses (+ "use my current location" via browser geolocation), gift wrap & chocolate add-on, coupon codes, Utsaah Wallet, **Razorpay** payment
- Account area: profile, addresses, wallet & history, orders with a visual status tracker, cancel/reorder, reviews, returns & refund method choice, custom order request history
- Dedicated Custom Orders request form (with inspiration photo upload)
- Contact page + a lightweight built-in FAQ chat widget (no external API key needed)
- In-app notification bell + transactional emails (order confirmed, shipped, delivered, refunds, etc.)

**Admin dashboard (admin)**
- Secure admin-only login
- Dashboard: revenue chart, top products, average order value, birthdays this month, repeat customers
- Products: full CRUD with multi-image upload, specs, tags, featured/new/bestseller flags, show/hide
- Categories: CRUD with icon & image
- Orders: filter by status, update lifecycle status (with automatic customer notification), assign shipping provider/courier/tracking, internal notes
- Customers: list with spend/orders, detail view, activate/deactivate accounts
- Coupons: create % or flat discounts with usage limits & expiry
- Returns & Refunds: approve/reject, process refund to wallet (instant) or original payment method
- Custom Order Requests: view inspiration photos, quote a price, reply, change status
- Reviews: approve/hide/delete
- Contact Messages: view & mark resolved

**Backend (API)**
- JWT auth (customer + admin roles), bcrypt password hashing
- Full REST API for every feature above, with image uploads via Multer
- Razorpay order creation + signature verification
- Wallet system, coupon engine, order status history, birthday tracking
- Nodemailer email hooks (skip gracefully if SMTP isn't configured, so the app still works locally without it)
- Seed script with an admin account, categories, ~18 sample products and 2 sample coupons

---

## 🧰 Tech stack

| Layer | Choice |
|---|---|
| Database | MongoDB + Mongoose |
| API | Node.js + Express |
| Auth | JWT + bcrypt |
| Storefront & Admin | React 19 (Vite) + Tailwind CSS + React Router |
| Charts | Recharts |
| Payments | Razorpay (test mode ready) |
| Emails | Nodemailer (any SMTP) |
| Icons | lucide-react |

MERN was chosen over a MySQL stack because the catalog (variable specs, image arrays, embedded gift options, status-history timelines) maps naturally onto MongoDB's flexible documents, and it keeps the whole stack in JavaScript end-to-end.

---

## 🚀 Getting started

You'll need **Node.js 18+** and a **MongoDB** database (either installed locally, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster — recommended if you don't want to install MongoDB yourself).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — get free **test mode** keys at https://dashboard.razorpay.com/app/keys (checkout works without these too — it'll just tell you payments aren't configured yet)
- `SMTP_*` — optional. Without these, the app just logs "email skipped" to the console instead of sending — everything else still works
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the admin login the seed script will create

Then seed the database and start the server:

```bash
npm run seed     # creates admin account, categories, sample products & coupons
npm run dev      # starts the API on http://localhost:5000
```

### 2. Storefront

```bash
cd frontend
npm install
cp .env.example .env   # defaults already point at http://localhost:5000/api
npm run dev             # http://localhost:5173
```

### 3. Admin dashboard

```bash
cd admin
npm install
cp .env.example .env
npm run dev             # http://localhost:5174
```

Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env`.

### 4. Try it out

- Browse the seeded catalog on the storefront, add to cart, and check out (Razorpay test cards: card number `4111 1111 1111 1111`, any future expiry, any CVV)
- Log into the admin dashboard and update an order's status — the customer will see it update live in their account (and get an email, if SMTP is configured)

---

## 📁 Project structure

```
backend/
├── config/db.js            MongoDB connection
├── models/                 Mongoose schemas (User, Product, Order, etc.)
├── controllers/             Route logic
├── routes/                  Express routers
├── middleware/               auth, file upload, error handling
├── utils/                    JWT, email, notifications, query helpers
├── seed/seed.js              Sample data
└── server.js                 App entry point

frontend/src/
├── api/axios.js              Shared API client
├── context/                  Auth, Cart, Wishlist, Toast (React Context)
├── components/               Navbar, Footer, ProductCard, ChatWidget, etc.
├── pages/                     One file per route
└── pages/profile/             Nested "My Account" pages

admin/src/                     Same shape as frontend, admin-specific pages
```

---

## 🎨 Design notes

The brand system leans into what "Utsaah" (Hindi for enthusiasm/zeal) actually means — a bright, festive, handmade-craft palette (rani pink, marigold, mehendi green, deep indigo) on a warm ivory base, Fredoka + Nunito Sans + Caveat type, and a signature **scalloped "crochet-edge" divider** between homepage sections instead of plain lines. Every product card sits on the same soft blush backdrop so the catalog reads as one cohesive shelf, regardless of each photo's own background — swap in real product photography any time via the admin Products page and they'll still look consistent.

---

## 🔧 What you'll want to configure for production

These are stubbed to keep the app fully functional locally without external accounts, but you should wire up real credentials before going live:

- **Razorpay** — switch from test to live keys
- **SMTP** — any provider works (Gmail App Password, Brevo, SES, etc.)
- **Image storage** — currently images save to `backend/uploads/` on local disk. For a host like Render/Vercel/Railway where disks aren't persistent, swap the Multer disk storage in `backend/middleware/upload.js` for a Cloudinary/S3 storage engine
- **Shiprocket / delivery partner APIs** — the SRS treats these as a later phase; today, admins manually record the shipping provider, courier and tracking number per order. Swap in live tracking APIs when ready
- **AI Assistant** — the chat widget is a fast, dependency-free keyword-matching FAQ bot (`frontend/src/components/ChatWidget.jsx`) so it works instantly with no API key. Swap `answerFor()` for a real LLM API call whenever you want smarter answers

## 📝 A note on `npm audit`

`react-router-dom` currently shows a "high" advisory for an RSC (React Server Components) CSRF issue. This app is a plain client-side SPA (`BrowserRouter`, no server rendering or actions), so that attack surface doesn't apply here — but keep an eye out for a patched release.

---

Made with 💛 for Utsaah.
