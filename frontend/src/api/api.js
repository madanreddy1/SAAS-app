import axios from "axios";

function normalizeDirectApiBase(url) {
  const u = String(url).trim().replace(/\/+$/, "");
  // FastAPI has routes at /projects, /auth, etc. — not under /api. The Vite dev
  // proxy strips /api before forwarding; a mis-set VITE_API_URL like
  // http://127.0.0.1:8004/api sends /api/projects/… to the server → 404 {"detail":"Not Found"}.
  if (u.endsWith("/api")) {
    return u.slice(0, -4);
  }
  return u;
}

function resolveBaseURL() {
  if (import.meta.env.VITE_API_URL) {
    return normalizeDirectApiBase(import.meta.env.VITE_API_URL);
  }
  // Dev: use Vite proxy (see vite.config.js) so requests are same-origin — avoids CORS.
  if (import.meta.env.DEV) {
    return "/api";
  }
  return "http://127.0.0.1:8004";
}

const API = axios.create({
  baseURL: resolveBaseURL(),
});

function isPublicAuthRequest(config) {
  const path = config.url ?? "";
  const base = config.baseURL ?? "";
  const joined = `${base}${path}`.split("?")[0];
  return /\/auth\/(login|register)\b/.test(path) || /\/auth\/(login|register)\b/.test(joined);
}

// Attach token automatically (skip public auth routes — no token yet)
API.interceptors.request.use((req) => {
  if (isPublicAuthRequest(req)) {
    return req;
  }
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;