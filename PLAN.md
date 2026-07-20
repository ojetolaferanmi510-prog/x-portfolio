# Portfolio Site — Locked Plan

> Workspace: `c:\Users\ojeto\Documents\X portfolio`

---

## 1. Site Structure (separate pages)

| Page | Path | Purpose |
|------|------|---------|
| Home | `index.html` | Hero intro, featured projects, skills strip, CTA → hire |
| About | `about.html` | Bio, skills/tech stack, journey/timeline, resume download |
| Work | `work.html` | Project grid, filterable by category |
| Work detail | `work-single.html` | Single project (query param + API/MongoDB) |
| Contact | `contact.html` | Hire / contact form |
| Admin | `admin/` | Not linked in public nav; login-protected |

**Public nav:** Home · About · Work · Contact  
**Admin:** separate folder, no public nav link.

---

## 2. Public-Facing Features

### Home
- Animated hero (name, role; typewriter/terminal-style for Web3 feel)
- Featured projects from MongoDB (`featured: true`)
- Skills/stack strip with tech logos
- CTA → Contact

### About
- Story + specialization (Web3, fintech, e-commerce)
- Education: Precious Cornerstone University, CS
- Optional resume download (static PDF or Cloudinary link)

### Work
- Grid of all projects from MongoDB
- Filter by tag (Web3 / DeFi / Fintech / Utility / etc.)
- Cards → `work-single.html?id=...` with images, stack, live link, GitHub, description

### Contact / Hire
- Fields: name, email, project type, budget range, message
- Persist to MongoDB + email notify (Resend or Nodemailer)
- Success/error UI
- Basic spam protection: honeypot field

---

## 3. Admin Panel Features

- **Login** — single admin, JWT + bcrypt (no multi-user RBAC)
- **Dashboard** — stats: total messages, new requests, total projects
- **Manage Work** — CRUD projects (title, description, images, tags, stack, links, featured toggle)
- **Manage Requests** — view hire messages; status: New / In Review / Accepted / Declined; reply; delete/archive

---

## 4. Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | HTML, CSS, vanilla JS (`fetch`); Tailwind via CDN optional (no build step) |
| Backend | Node.js + Express (REST API) |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt (admin only) |
| Images | Cloudinary free tier (no base64 in Mongo) |
| Email | **Resend** |
| Deploy | Frontend → Vercel/Netlify; Backend → Render (same pattern as LoanAptech) |

---

## 5. Database Collections

### `projects`
- `title` (string)
- `description` (string)
- `images` (string[] — Cloudinary URLs)
- `tags` (string[] — e.g. Web3, DeFi, Fintech, Utility)
- `techStack` (string[])
- `liveUrl` (string, optional)
- `githubUrl` (string, optional)
- `featured` (boolean)
- `createdAt` (date)

### `messages`
- `name` (string)
- `email` (string)
- `projectType` (string)
- `budget` (string)
- `message` (string)
- `status` (enum: `new` | `in_review` | `accepted` | `declined`)
- `createdAt` (date)

### `admin`
- `username` (string)
- `passwordHash` (string)

---

## 6. API Shape (high level)

```
POST   /api/auth/login
GET    /api/projects          ?tag=&featured=
GET    /api/projects/:id
POST   /api/projects          (admin)
PUT    /api/projects/:id      (admin)
DELETE /api/projects/:id      (admin)

POST   /api/messages          (public contact form)
GET    /api/messages          (admin)
PATCH  /api/messages/:id      (admin — status / archive)
DELETE /api/messages/:id      (admin)

GET    /api/admin/stats       (admin)
POST   /api/upload            (admin — Cloudinary signed/unsigned upload helper)
```

JWT via `Authorization: Bearer <token>` on admin routes.

---

## 7. Repo / Folder Layout

```
/
├── frontend/                 # static site (step 2+)
│   ├── index.html
│   ├── about.html
│   ├── work.html
│   ├── work-single.html
│   ├── contact.html
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── admin/
│       ├── index.html        # login
│       ├── dashboard.html
│       ├── projects.html
│       └── messages.html
├── backend/                  # ✅ step 1 done
│   ├── src/
│   │   ├── index.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── scripts/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── PLAN.md
└── README.md
```

---

## 8. Design Direction

- Dark, high-contrast Web3 aesthetic
- Deep black / charcoal base
- **Accent:** Cyan `#22d3ee` on near-black `#0a0a0b`
- Monospace or geometric sans headings
- Subtle grid / scanline texture
- Smooth scroll-reveal animations
- Mobile-first: stacked cards, hamburger nav, touch-friendly controls

---

## 9. Build Order (strict)

1. **Backend first** — Express API, Mongoose models, admin auth, CORS, `.env.example` ✅
2. **Static pages** — placeholder content, responsive layout, design tokens
3. **Wire frontend → API** — projects, filters, contact form, work detail
4. **Admin dashboard** — login, stats, project CRUD, message management
5. **Polish** — animations, SEO meta, image optimization, deploy configs

---

## 10. Locked choices

| Item | Choice |
|------|--------|
| Email provider | **Resend** |
| CSS approach | **Hand-rolled CSS** + design tokens |
| Accent color | **Cyan** `#22d3ee` on `#0a0a0b` |
| Frontend folder | **`frontend/` + `backend/`** |
| Resume | **`frontend/assets/resume.pdf`** |
| Admin seed | **`npm run seed:admin`** (`ADMIN_USER` / `ADMIN_PASS`) |

---

## 11. Out of Scope (v1)

- Multi-admin / roles
- Blog / CMS pages
- i18n
- Real-time chat
- Storing images in MongoDB
- Public user accounts

---

## 12. Success Criteria

- [ ] Public site fully responsive, dark Web3 look
- [ ] Projects & featured list load from API
- [ ] Contact form saves + sends email; honeypot works
- [x] Admin login required for all mutate routes
- [x] Project CRUD + image upload via Cloudinary (API ready)
- [x] Message status workflow works (API ready)
- [ ] Deployed: static host + Render API + Atlas

---

**Status:** Build Order **step 1 (backend) complete**. Next: **step 2 — static pages**.
