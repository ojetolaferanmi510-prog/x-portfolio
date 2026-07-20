# Portfolio Site

Dark Web3 portfolio with a public static frontend and an Express + MongoDB API (admin, projects, hire requests).

## Structure

```
frontend/          # static HTML/CSS/JS + admin panel
backend/           # Express REST API
PLAN.md            # locked product plan
DEPLOY.md          # exact Render + Vercel steps
render.yaml        # Render Blueprint (API)
vercel.json        # Vercel static output → frontend/
```

## Backend

```bash
cd backend
cp .env.example .env
# fill MONGODB_URI, JWT_SECRET, ADMIN_*, Cloudinary, Resend
npm install
npm run seed:admin
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

### API

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/api/auth/login` | — | `{ username, password }` → JWT |
| GET | `/api/projects` | — | `?tag=&featured=true` |
| GET | `/api/projects/:id` | — | |
| POST | `/api/projects` | Bearer | create |
| PUT | `/api/projects/:id` | Bearer | update |
| DELETE | `/api/projects/:id` | Bearer | delete |
| POST | `/api/messages` | — | contact form (+ honeypot `website`) |
| GET | `/api/messages` | Bearer | `?status=&archived=` |
| PATCH | `/api/messages/:id` | Bearer | status / archive / note |
| DELETE | `/api/messages/:id` | Bearer | |
| GET | `/api/admin/stats` | Bearer | dashboard counts |
| POST | `/api/upload` | Bearer | multipart `image` → Cloudinary |

### Env

See `backend/.env.example`.

- **Email:** Resend (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`)
- **Images:** Cloudinary free tier
- **Admin seed:** `npm run seed:admin` uses `ADMIN_USER` / `ADMIN_PASS`

## Frontend

Static site — no build step. Open with any static server (VS Code Live Server on port **5500** is already allowed in `CLIENT_URL`).

```bash
# example
npx serve frontend -p 5500
# or use Live Server on frontend/
```

Pages:

| Page | Path |
|------|------|
| Home | `frontend/index.html` |
| About | `frontend/about.html` |
| Work | `frontend/work.html` |
| Work detail | `frontend/work-single.html?id=...` |
| Contact | `frontend/contact.html` |
| Admin login | `frontend/admin/index.html` |
| Dashboard | `frontend/admin/dashboard.html` |
| Projects CRUD | `frontend/admin/projects.html` |
| Messages | `frontend/admin/messages.html` |

API base defaults to `http://localhost:5000` on localhost. Override with:

```html
<meta name="api-base" content="https://your-api.onrender.com" />
```

or `window.__API_BASE__ = 'https://...'` before scripts.

Optional resume file: place PDF at `frontend/assets/resume.pdf`.

## Design

- Near-black `#0a0a0b`, cyan accent `#22d3ee`
- Hand-rolled CSS + DM Sans / JetBrains Mono
- Mobile-first nav, project filters, contact honeypot

## Deploy

Full checklist: **[DEPLOY.md](./DEPLOY.md)**

| Piece | Host | Config |
|-------|------|--------|
| API | **Render** | `render.yaml` — Root Directory `backend`, build `npm install`, start `npm start`, health `/api/health` |
| Site | **Vercel** | `vercel.json` — Output Directory `frontend`, no build |
| DB | **MongoDB Atlas** | URI in Render env `MONGODB_URI` |

**Render (manual if not using Blueprint)**

- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Health Check Path: `/api/health`
- Env: copy from `backend/.env.example` (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` = your Vercel URL, Cloudinary, Resend, `ADMIN_*`)

**Vercel**

- Framework: Other
- Root: repo root (uses `vercel.json`)
- Output Directory: `frontend`
- After deploy: set `<meta name="api-base" content="https://YOUR-API.onrender.com" />` on pages, then put the Vercel origin in Render `CLIENT_URL`

**Post-deploy**

```bash
# Render Shell (once)
npm run seed:admin
```

Repo already on GitHub: `origin` → `https://github.com/ojetolaferanmi510-prog/x-portfolio.git` (branch `main`).
