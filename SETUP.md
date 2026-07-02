# Natural Ice — Standalone Version (no Base44)

This is a full rebuild of your Natural Ice site (storefront + admin backend)
running on your **own** database and server — completely independent from
Base44.

## What's inside
- `src/` — the same React frontend (storefront, admin dashboard, products,
  orders, delivery, special clients, etc.)
- `backend/` — a Node.js + SQLite backend that replaces Base44:
  - `server.js` — API server (auth, products, orders, users, special clients)
  - `db.js` — database schema (SQLite file created automatically)
  - `seed.js` — creates the admin account + loads your product catalog

## First-time setup
```bash
# 1. Install backend dependencies
cd backend
npm install
node seed.js        # creates admin user + seeds your 30 products

# 2. Install frontend dependencies (from project root)
cd ..
npm install
```

## Running it
```bash
# Terminal 1 — backend (API)
cd backend
PORT=4001 node server.js

# Terminal 2 — frontend (website)
npm run dev -- --port 5173 --host 0.0.0.0
```
Then open http://localhost:5173

## Admin login
- Email: `greenchartsuae@gmail.com`
- Password: `NaturalIce2026!`

**Please change this password after first login** (or ask me to add a
"change password" option).

## Deploying permanently
This currently runs locally in my sandbox for demo purposes (via a temporary
tunnel link that expires). To make it permanently live on the internet, it
needs to be deployed to a real host, for example:
- A small VPS (DigitalOcean, Hetzner, etc.) running both the Node backend and
  the built frontend (`npm run build` + serve `dist/`)
- Or split: frontend on Vercel/Netlify, backend on Railway/Render, with the
  API URL updated in `vite.config.js` proxy / `src/api/base44Client.js`

I can help set up either of these — just let me know which you'd prefer.

## How it differs from the Base44 version
- Login is now email/password (not Base44 SSO) — same admin roles apply
  (admin, client, special_client, production, delivery)
- "Invite user" creates an account with a temporary password (shown once)
  instead of sending an email invite
- All data (products, orders, clients) lives in your own SQLite database
  file (`backend/naturalice.db`), not in Base44's cloud
