# Deploy: Render (API + Postgres) + Vercel (frontend)

## Overview

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Create **Postgres** + **Web Service** on Render (Blueprint or manual).
3. Deploy the **frontend** on Vercel with `VITE_API_URL` pointing at your Render API URL.
4. Set **CORS** so the browser may call the API from your Vercel domain.

### Deploy in this order (avoids CORS / env mistakes)

| Step | Where | What |
|------|--------|------|
| 1 | Git | Commit and push; confirm `render.yaml`, `requirements.txt`, `runtime.txt` are in the **repo root** (not only on your laptop). |
| 2 | Render | Create Blueprint (or Web + Postgres). Wait until the API **Live** and open `https://<your-api>.onrender.com/health` → should show `{"status":"ok"}`. |
| 3 | Vercel | New project → root **`frontend`** → add **`VITE_API_URL`** = your Render URL (no `/`, no `/api`) → Deploy. |
| 4 | Render | **Environment** → **`CORS_ORIGINS`** = your Vercel URL, e.g. `https://your-project.vercel.app` → **Save** → **Manual Deploy** (clear deploy). |
| 5 | Vercel | If you changed `VITE_API_URL`, **Redeploy** so the build picks it up. |

Until step 4 is done, the site may load but **login/API calls can fail** in the browser (CORS). That is expected.

**Do not commit** `frontend/.env` with secrets; use **Vercel → Settings → Environment Variables** for production.

---

## 1. Render — backend + database

### Option A: Blueprint (`render.yaml`)

1. In Render: **New** → **Blueprint** → connect the repo.
2. Confirm `render.yaml` is detected (repo root).
3. Apply the blueprint. Render creates:
   - Postgres `workspace-db`
   - Web service `workspace-api` with `DATABASE_URL` and a generated `SECRET_KEY`
4. The Blueprint sets **`CORS_ALLOW_VERCEL=true`** so any `https://*.vercel.app` can call the API (no empty “Enter value” fields). For stricter production CORS later: add **`CORS_ORIGINS`** in **Environment**, set **`CORS_ALLOW_VERCEL`** to `false`, and redeploy.

### Option B: Manual

1. **New** → **PostgreSQL** — create a database; copy **Internal Database URL**.
2. **New** → **Web Service** — same repo, **root directory** = repo root (where `requirements.txt` lives).
3. **Build command:** `pip install -r requirements.txt`  
   **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Internal Database URL from Postgres (Render injects this if you link the DB). |
   | `SECRET_KEY` | Long random string (e.g. `openssl rand -hex 32`). |
   | `CORS_ORIGINS` | **Required** for Vercel: your site URL(s), comma-separated, e.g. `https://my-app.vercel.app` |
   | `CORS_ALLOW_VERCEL` | Optional: `true` = allow any `https://*.vercel.app` (previews). Omit for strict production. |

5. **Health check path:** `/health`

Copy the public URL of the web service, e.g. `https://workspace-api-xxxx.onrender.com` (no trailing slash).

**Note:** Free web services **spin down** after idle time; first request can take ~30–60s (cold start).

---

## 2. Vercel — frontend

1. **New Project** → import the same repo.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite  
   **Build Command:** `npm run build`  
   **Output Directory:** `dist`
4. **Environment Variables:**

   | Name | Value |
   |------|--------|
   | `VITE_API_URL` | `https://your-service.onrender.com` |

   Use the exact Render URL — **no** `/api` suffix (the API serves `/auth`, `/projects`, etc. at the root).

5. Deploy. Vercel sets `https://<project>.vercel.app` (and preview URLs for branches).

---

## 3. Connect API ↔ browser

- The SPA calls `VITE_API_URL` + paths like `/auth/login`, `/projects/`.
- **CORS** on Render must allow your Vercel origin(s). Use `CORS_ORIGINS` and/or `CORS_ALLOW_VERCEL` as above.
- **JWT `SECRET_KEY`** must stay stable; changing it invalidates all tokens.

---

## 4. Python version on Render

The repo includes **`runtime.txt`** (`3.12.7`) so Render uses a fixed Python version. Change the file if you need another [supported version](https://render.com/docs/python-version).

---

## 5. Local development

- Backend: leave `DATABASE_URL` unset to use SQLite (`app.db` in the repo root), or point `DATABASE_URL` at a local Postgres.
- Copy `.env.example` → `.env` and adjust.
- Frontend: omit `VITE_API_URL` in dev so the Vite proxy (`/api` → local API) is used, or set `VITE_API_URL=http://127.0.0.1:8004`.

---

## 6. Checklist after deploy

- [ ] `GET https://<render-url>/health` returns `{"status":"ok"}`
- [ ] Register + login from the Vercel site works
- [ ] If CORS errors appear, fix `CORS_ORIGINS` / `CORS_ALLOW_VERCEL` on Render and redeploy
