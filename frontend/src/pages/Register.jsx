import { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useToast } from "../context/ToastContext";

function formatError(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg || String(d)).join(", ");
  return err.message || "Registration failed.";
}

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setError("Enter email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await API.post("/auth/register", { email: trimmed, password });
      toast.success("Account created. You can sign in now.");
      navigate("/", { replace: true });
    } catch (err) {
      const msg = formatError(err);
      setError(msg);
      console.error(err);
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-h)] sm:text-4xl">
            Create an account
          </h1>
          <p className="mt-2 text-[var(--text)] opacity-90">
            Start organizing projects and issues in one place.
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
              handleRegister();
            }}
          >
            <div>
              <label className="label" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                className="input-field"
                placeholder="you@company.com"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                className="input-field"
                placeholder="At least 8 characters"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="register-confirm">
                Confirm password
              </label>
              <input
                id="register-confirm"
                className="input-field"
                placeholder="Repeat password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2 w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text)] opacity-85">
            Already have an account?{" "}
            <Link className="link-accent" to="/">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
