# Iron Palace Podcast — Setup & Deployment Guide

This document explains how to get the admin system running locally and in production.

---

## What We Built

A complete content management system for the Iron Palace podcast site:

### **Public Site**
- **Home page** (`/`) — existing design, now with live data:
  - Upcoming Events (this month at-a-glance, links to `/calendar`)
  - Gallery carousel (pulls from MongoDB)
  - Resources preview (first 4 items, links to `/resources`)
- **Calendar** (`/calendar`) — dedicated events page with month grouping
- **Resources** (`/resources`) — downloadable files (PDFs, images, etc.)

### **Admin Dashboard** (`/admin`)
Secured by a single shared password. Admins can:
- **Create, edit, delete events** (title, date, time, location, description)
- **Upload gallery photos** (images only, with optional captions)
- **Upload library files** (any type, with title + description)

### **Tech Stack**
- **Frontend**: React + Vite, Tailwind, Motion (Framer Motion), Lucide icons
- **Backend**: Vercel Serverless Functions (Node.js) under `/api`
- **Database**: MongoDB Atlas (free tier)
  - Events stored in `events` collection
  - Gallery photos in GridFS `gallery` bucket (4 MB per file)
  - Library files in GridFS `library` bucket (4 MB per file)
- **Auth**: HMAC-signed session cookie (no JWT library, no DB lookup)
- **Hosting**: Vercel

---

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

You should now have `mongodb` (driver), React, Vite, Tailwind, Motion, and Lucide.

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
ADMIN_PASSWORD=your-secure-password-here
ADMIN_SESSION_SECRET=<48-byte hex string>
MONGODB_DB=ironpalace
MONGODB_URI=mongodb+srv://omniv:YOUR_PASSWORD@ironpalace.rwqth5b.mongodb.net/?appName=Ironpalace
```

**To generate a secure session secret:**

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**MONGODB_URI notes:**
- Replace `YOUR_PASSWORD` with the actual Atlas password for user `omniv`
- If the password contains special characters (`@`, `:`, `/`, `?`, `#`, `&`, `%`), URL-encode them:
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - etc.

### 3. Configure MongoDB Atlas

1. **Create a cluster** at [cloud.mongodb.com](https://cloud.mongodb.com) (free M0 tier is fine)
2. **Database Access** → Create user `omniv` with "Read and write to any database" role
3. **Network Access** → Add IP `0.0.0.0/0` (allows Vercel serverless functions to connect)
4. **Get connection string** from "Connect" → "Drivers" → copy the `mongodb+srv://...` URI

### 4. Run Locally with Vercel Dev

**Important:** Use `npx vercel dev`, not `npm run dev`. Vite alone won't run the `/api` functions.

```bash
npx vercel dev
```

- First time: Vercel CLI will ask you to link the project. Choose "owen-lindseys-projects" → "iron-palace" (or create new)
- Dev server starts at `http://localhost:3000`
- Visit `http://localhost:3000/admin` and log in with `ADMIN_PASSWORD`

### 5. Stealth Admin Entry

Public visitors won't see an obvious "Admin" link. To access the dashboard, **click the © symbol** in the footer copyright text (no cursor change, no hover hint). Or just visit `/admin` directly.

---

## Production Deployment

### 1. Push Environment Variables to Vercel

Since Vercel's "Sensitive" env vars can't target Development, you have two choices:

#### **Option A: Non-Sensitive (easier)**
All four vars become regular (non-Sensitive) and can target Production + Preview + Development. Anyone with project access can view them on the Vercel dashboard, but `vercel pull` will auto-populate `.env.local` for you.

```bash
# Remove existing Sensitive vars if present
npx vercel env rm MONGODB_URI -y
npx vercel env rm ADMIN_PASSWORD -y
npx vercel env rm ADMIN_SESSION_SECRET -y
npx vercel env rm MONGODB_DB -y

# Re-add as non-Sensitive (mark as "no" when prompted)
npx vercel env add MONGODB_URI          # Scope: Production, Preview, Development
npx vercel env add ADMIN_PASSWORD       # Scope: Production, Preview, Development
npx vercel env add ADMIN_SESSION_SECRET # Scope: Production, Preview, Development
npx vercel env add MONGODB_DB           # Scope: Production, Preview, Development
```

#### **Option B: Sensitive (manual `.env.local`)**
Mark vars as Sensitive. Vercel only allows Production + Preview scope (not Development). You maintain `.env.local` manually (don't run `vercel pull` or it'll wipe local vars).

```bash
npx vercel env add MONGODB_URI          # Sensitive: yes, Scope: Production, Preview
npx vercel env add ADMIN_PASSWORD       # Sensitive: yes, Scope: Production, Preview
npx vercel env add ADMIN_SESSION_SECRET # Sensitive: yes, Scope: Production, Preview
npx vercel env add MONGODB_DB           # Sensitive: yes, Scope: Production, Preview
```

**Recommendation:** Use Option A unless you need extra security.

### 2. Deploy to Production

```bash
npx vercel --prod
```

Vercel will build and deploy. The custom domain (www.ironpalace.live) should already be configured in the Vercel dashboard.

### 3. Verify Deployment

1. Visit `https://www.ironpalace.live/api/events`
   - Should return `{"events":[]}` (200 OK)
   - If you see `bad auth : authentication failed`, the MONGODB_URI password doesn't match the Atlas user password — rotate the password in Atlas and update the var on Vercel.

2. Visit `https://www.ironpalace.live/admin`
   - Log in with `ADMIN_PASSWORD`
   - Add a test event
   - Go back to the home page — the event should appear in "Upcoming Events" if it's this month.

---

## Common Issues

### `MONGODB_URI is not set`

**Cause:** `.env.local` is missing or has malformed syntax (spaces around `=`).

**Fix:**
- No spaces: `MONGODB_URI=value`, not `MONGODB_URI = value`
- Restart `npx vercel dev` after editing `.env.local`

### `bad auth : authentication failed`

**Cause:** The password in `MONGODB_URI` doesn't match the Atlas user `omniv`.

**Fix:**
1. Atlas → Database Access → Edit user `omniv` → Autogenerate Secure Password → Copy
2. Update `.env.local` (local dev)
3. Update Vercel env var (production):
   ```bash
   npx vercel env rm MONGODB_URI -y
   npx vercel env add MONGODB_URI  # paste new URI
   npx vercel --prod  # redeploy
   ```

### `ADMIN_PASSWORD is not set` (in `npx vercel dev`)

**Cause:** Vercel "Sensitive" vars can't target Development, so they won't be in `.env.local` if you ran `vercel pull`.

**Fix:**
- Manually add `ADMIN_PASSWORD=...` and `ADMIN_SESSION_SECRET=...` to `.env.local`
- OR switch to non-Sensitive vars (Option A above)

### Vite errors like `Failed to parse source for import analysis`

**Cause:** Old `vercel.json` had a catch-all rewrite that broke Vite's dev server.

**Fix:**
- Verify `vercel.json` only rewrites `/admin*`, `/calendar*`, `/resources*` (not `/(.*)`).
- Current config should be:
  ```json
  {
    "rewrites": [
      { "source": "/admin", "destination": "/index.html" },
      { "source": "/admin/(.*)", "destination": "/index.html" },
      { "source": "/calendar", "destination": "/index.html" },
      { "source": "/calendar/(.*)", "destination": "/index.html" },
      { "source": "/resources", "destination": "/index.html" },
      { "source": "/resources/(.*)", "destination": "/index.html" }
    ]
  }
  ```

### File upload fails with "payload too large"

**Cause:** Vercel Hobby free tier caps request bodies at ~4.5 MB.

**Fix:**
- Resize images before upload
- Compress large PDFs
- For bigger files, upgrade to Vercel Pro or use external storage (Cloudflare R2, AWS S3)

---

## Architecture Notes

### Routing

`main.tsx` inspects `window.location.pathname` and renders:
- `/admin*` → `<AdminApp />`
- `/calendar*` → `<CalendarPage />`
- `/resources*` → `<ResourcesPage />`
- Everything else → `<App />` (home page)

Vercel's SPA rewrites ensure all three routes serve `index.html`, then React takes over.

### Auth Flow

1. User visits `/admin` → `<AdminApp />` renders
2. `useAuth()` hook calls `/api/me` (checks for valid session cookie)
3. If no session, shows `<LoginPage />`
4. User submits password → POST `/api/login` → server verifies against `ADMIN_PASSWORD` → sets HMAC-signed cookie
5. Cookie is HttpOnly, Secure, SameSite=Lax, 30-day expiry
6. Every admin endpoint (`POST /api/events`, `DELETE /api/gallery/:id`, etc.) calls `requireAdmin(req, res)` which re-validates the HMAC signature

No JWT library, no database lookup, no sessions table. Just crypto.createHmac.

### Data Flow

**Events:**
- Stored in MongoDB collection `events`
- Fields: `{ title, date, time, location, description, createdAt, updatedAt }`
- Public home page shows this month's events (first 3, sorted by date)
- Full calendar at `/calendar` groups by month

**Gallery:**
- Images stored in GridFS bucket `gallery` (MongoDB's file storage system)
- Each file has `{ filename, contentType, metadata: { caption }, uploadDate }`
- Public home page shows all photos in a carousel
- `/api/gallery/:id` streams the binary (public read, admin delete)

**Library:**
- Files stored in GridFS bucket `library`
- Each file has `{ filename, contentType, metadata: { title, description }, uploadDate }`
- Public home page shows first 4 files
- Full list at `/resources`
- `/api/library/:id?download` triggers browser download

---

## File Structure

```
iron_palace-/
├── api/                    # Vercel serverless functions
│   ├── _lib/
│   │   ├── auth.js         # HMAC session cookie helpers
│   │   ├── body.js         # JSON + binary body parsers
│   │   └── mongo.js        # MongoDB client (cached globally)
│   ├── events/
│   │   ├── index.js        # GET (list) + POST (create)
│   │   └── [id].js         # PUT (update) + DELETE
│   ├── gallery/
│   │   ├── index.js        # GET (list) + POST (upload)
│   │   └── [id].js         # GET (stream binary) + DELETE
│   ├── library/
│   │   ├── index.js        # GET (list) + POST (upload)
│   │   └── [id].js         # GET (download) + DELETE
│   ├── login.js            # POST — verify password, set cookie
│   ├── logout.js           # POST — clear cookie
│   └── me.js               # GET — check if authenticated
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── AdminApp.tsx      # Admin shell (tabs, logout)
│   │   │   ├── EventsAdmin.tsx   # Event CRUD UI
│   │   │   ├── GalleryAdmin.tsx  # Photo upload UI
│   │   │   ├── LibraryAdmin.tsx  # File upload UI
│   │   │   └── LoginPage.tsx     # Password form
│   │   ├── hooks/
│   │   │   ├── useAuth.ts        # Session management
│   │   │   ├── useEvents.ts      # Fetch events
│   │   │   ├── useGallery.ts     # Fetch gallery
│   │   │   └── useLibrary.ts     # Fetch library
│   │   ├── pages/
│   │   │   ├── CalendarPage.tsx  # Dedicated /calendar
│   │   │   └── ResourcesPage.tsx # Dedicated /resources
│   │   ├── api.ts                # Fetch wrapper for all endpoints
│   │   └── App.tsx               # Home page (public)
│   └── main.tsx                  # Router (chooses root component)
├── .env.local                    # Local secrets (gitignored)
├── .env.example                  # Template for .env.local
├── .gitignore                    # Excludes .env.local, dist/, etc.
├── vercel.json                   # SPA rewrites for /admin, /calendar, /resources
└── package.json
```

---

## Security Considerations

1. **Single shared password** — fine for a small team. If you need per-user accounts, you'll need a users table and a different auth strategy.

2. **No rate limiting** — `/api/login` is vulnerable to brute-force. For production, add a rate limiter (Vercel Edge Middleware or Upstash Redis).

3. **4 MB file cap** — Vercel Hobby free tier. If you need larger uploads, use external storage (S3, R2, Cloudinary) and store URLs in Mongo.

4. **MongoDB password in env var** — rotate it periodically. Don't reuse it elsewhere.

5. **ADMIN_SESSION_SECRET** — treat like a private key. If it leaks, anyone can forge admin sessions. Rotate it (invalidates all sessions).

6. **Network Access 0.0.0.0/0** — required for Vercel, but it means your cluster accepts connections from anywhere. Atlas enforces authentication, so it's safe as long as your password is strong.

---

## Next Steps / Future Enhancements

- **Draft/publish workflow** — currently everything goes live immediately
- **Event edit UI** — right now admins can only create + delete, not edit inline
- **Image optimization** — resize/compress uploads server-side (sharp library)
- **Pagination** — `/calendar` and `/resources` will get slow with 100+ items
- **Search + filters** — by date range, keyword, file type
- **Social media auto-sync** — pull Instagram/Facebook posts into gallery
- **Analytics** — track which events get the most interest
- **Email notifications** — alert subscribers when new events are posted
- **Multi-user roles** — editor vs. admin permissions

---

## Support

If something breaks, check the Vercel logs:

```bash
npx vercel logs --prod
```

Or visit the dashboard → iron-palace → Logs.

Common log errors:
- `bad auth : authentication failed` → Mongo password mismatch
- `unauthorized` → session cookie expired or invalid
- `payload too large` → file > 4 MB

---

**Built by AI assistant for Owen Lindsey, May 2026.**  
Questions? Check the logs, inspect the Network tab, or review this doc.
