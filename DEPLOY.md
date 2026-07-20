# Deploy — Render (API) + Vercel (frontend)

Repo: `https://github.com/ojetolaferanmi510-prog/x-portfolio`  
Layout: `frontend/` static site · `backend/` Express API · MongoDB Atlas

Configs in this repo:

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint for the API |
| `vercel.json` | Static host → `frontend/` |
| `backend/.env.example` | Env template (copy locally; set real values in dashboards) |
| `.gitignore` | Ignores `node_modules`, `.env`, logs, etc. |

---

## 0. Before you click Deploy

1. **MongoDB Atlas**
   - Cluster → Database user + password
   - Network Access → allow `0.0.0.0/0` (Render free tier has dynamic IPs)
   - Connect → copy URI → replace password → DB name e.g. `portfolio`

2. **Cloudinary** (admin image upload)
   - Dashboard → copy Cloud name, API Key, API Secret

3. **Resend** (contact email notify)
   - API key; for free tier you can use `EMAIL_FROM=Portfolio <onboarding@resend.dev>`
   - `EMAIL_TO` = your inbox

4. **Secrets to invent**
   - `JWT_SECRET` — long random string
   - `ADMIN_USER` / `ADMIN_PASS` (pass ≥ 8 chars) for `npm run seed:admin`

---

## 1. Backend → Render

### Option A — Blueprint (uses `render.yaml`)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect GitHub → select **`ojetolaferanmi510-prog/x-portfolio`**
3. Render reads `render.yaml` → service **`x-portfolio-api`**
4. Fill every `sync: false` env var (see table below)
5. Apply → wait for live URL, e.g. `https://x-portfolio-api.onrender.com`

### Option B — Manual Web Service (same settings)

| Setting | Value |
|---------|--------|
| **Repository** | `ojetolaferanmi510-prog/x-portfolio` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance** | Free |
| **Health Check Path** | `/api/health` |

### Environment variables (Render → Environment)

| Key | Example / notes |
|-----|-----------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Render also injects `PORT`; app already reads it) |
| `MONGODB_URI` | Atlas URI |
| `JWT_SECRET` | long random string |
| `CLIENT_URL` | your Vercel URL(s), comma-separated — **set after Vercel exists**; include preview if needed e.g. `https://x-portfolio.vercel.app,http://localhost:5500` |
| `ADMIN_USER` | admin login name |
| `ADMIN_PASS` | admin password (≥ 8) — only needed for seed |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `CLOUDINARY_FOLDER` | optional, default `portfolio` |
| `RESEND_API_KEY` | from Resend |
| `EMAIL_FROM` | `Portfolio <onboarding@resend.dev>` or verified domain |
| `EMAIL_TO` | your email |

### Smoke test

```
GET https://YOUR-API.onrender.com/api/health
→ { "ok": true, ... }
```

### Seed admin (once)

Render service → **Shell**:

```bash
npm run seed:admin
```

(Free tier may sleep; first request after idle can take ~30–60s.)

---

## 2. Frontend → Vercel

1. [Vercel](https://vercel.com) → **Add New Project** → import **`x-portfolio`**
2. Use these exact settings:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Other |
| **Root Directory** | `.` (repo root — `vercel.json` points at `frontend`) |
| **Build Command** | *leave empty* (or overridden by `vercel.json`) |
| **Output Directory** | `frontend` |
| **Install Command** | *leave empty* |

3. Deploy → note URL, e.g. `https://x-portfolio.vercel.app`

### Point the site at the API

Every public/admin HTML page should know the Render URL. Easiest: add this in `<head>` on all pages (before `js/config.js`):

```html
<meta name="api-base" content="https://YOUR-API.onrender.com" />
```

Pages that load the API:

- `frontend/index.html`
- `frontend/work.html`
- `frontend/work-single.html`
- `frontend/contact.html`
- `frontend/admin/index.html`
- `frontend/admin/dashboard.html`
- `frontend/admin/projects.html`
- `frontend/admin/messages.html`

`frontend/js/config.js` already reads that meta (and `window.__API_BASE__`).

### CORS loop-back

After Vercel URL is known:

1. Render → `CLIENT_URL` = `https://your-app.vercel.app` (add `http://localhost:5500` if you still dev locally)
2. **Save** → service restarts
3. Hard-refresh the Vercel site

---

## 3. Go-live checklist

- [ ] `GET /api/health` on Render returns `ok: true`
- [ ] Atlas Network Access allows Render (`0.0.0.0/0` or Render IPs)
- [ ] Admin seeded; login works at `/admin/`
- [ ] `CLIENT_URL` includes exact Vercel origin (https, no trailing slash issues)
- [ ] All frontend pages have `meta api-base` → Render URL
- [ ] Contact form creates a message + (optional) Resend email
- [ ] Project image upload works (Cloudinary env set)
- [ ] Custom domains (optional): add domain on Vercel **and** append it to Render `CLIENT_URL`

---

## 4. Local vs production quick map

| Piece | Local | Production |
|-------|--------|------------|
| Frontend | Live Server / `npx serve frontend -p 5500` | Vercel → `frontend/` |
| API | `cd backend && npm run dev` → `:5000` | Render → `rootDir: backend` |
| API base in browser | `http://localhost:5000` (auto on localhost) | `meta name="api-base"` |
| CORS `CLIENT_URL` | `http://localhost:5500` | Vercel URL(s) |
| DB | Atlas (same) | Atlas |

---

## 5. Common failures

| Symptom | Fix |
|---------|-----|
| Browser CORS error | `CLIENT_URL` must match the site origin exactly (scheme + host) |
| API empty / failed fetch on Vercel | Missing `meta api-base` (prod has no localhost fallback) |
| Render spin-up 502 | Free sleep — retry; check logs for `MONGODB_URI` / `JWT_SECRET` |
| Seed fails | `ADMIN_PASS` ≥ 8; `MONGODB_URI` set in Render env |
| Upload 503 | Cloudinary keys missing |
| Email silent | Resend optional; form still saves — check `RESEND_API_KEY` + `EMAIL_TO` |
