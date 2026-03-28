import { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function pickAccessToken(payload) {
  if (payload == null) return null;
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return parsed?.access_token ?? parsed?.accessToken ?? null;
    } catch {
      return null;
    }
  }
  if (typeof payload === "object") {
    return payload.access_token ?? payload.accessToken ?? null;
  }
  return null;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", trimmed);
      formData.append("password", password);

      const res = await API.post("/auth/login", formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const accessToken = pickAccessToken(res.data);
      if (!accessToken) {
        const msg = "Login response had no access token. Check API URL and CORS.";
        setError(msg);
        console.error(msg, res.data);
        return;
      }

      try {
        localStorage.setItem("token", accessToken);
      } catch (storageErr) {
        setError("Could not save session (browser blocked storage).");
        console.error(storageErr);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      if (!err.response && (err.code === "ERR_NETWORK" || err.message === "Network Error")) {
        const msg =
          "Cannot reach the API. Start the backend on port 8004 and run the frontend with npm run dev (uses /api proxy).";
        setError(msg);
        console.error(msg, err);
        return;
      }
      const detail = err.response?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join(", ")
            : err.message || "Login failed";
      setError(msg);
      console.error("LOGIN ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col justify-center bg-[var(--app-main-gradient)] px-4 py-14 sm:px-6">
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)] opacity-[0.07] blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[24rem] w-[24rem] rounded-full bg-violet-500 opacity-[0.1] blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Workspace
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-h)] sm:text-4xl">
            Welcome back
          </h2>
          <p className="mt-2 text-[var(--text)] opacity-90">
            Sign in to manage your projects and issues.
          </p>
        </div>

        <div className="card-surface auth-card-enter p-6 sm:p-8">
          {error ? (
            <p className="alert-error mb-5" role="alert">
              {error}
            </p>
          ) : null}

          <form
            className="flex flex-col gap-4 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div>
              <label className="label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                data-testid="login-email"
                className="input-field"
                placeholder="you@company.com"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                data-testid="login-password"
                className="input-field"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              data-testid="login-submit"
              type="submit"
              className="btn btn-primary mt-2 w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text)] opacity-85">
            New here?{" "}
            <Link className="link-accent" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
