import { Link } from "react-router-dom";

function NotFound() {
  const token = localStorage.getItem("token");
  const home = token ? "/dashboard" : "/";

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[var(--app-main-gradient)] px-4 py-16">
      <div
        className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.06] blur-3xl"
        aria-hidden
      />
      <div className="card-surface auth-card-enter relative max-w-md px-8 py-12 text-center shadow-[var(--shadow-elevated)]">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.35em] text-[var(--accent)]">404</p>
        <h1 className="mt-3 text-[1.65rem] font-bold leading-tight tracking-tight text-[var(--text-h)] sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-[var(--text)] opacity-90">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link
          to={home}
          className="btn btn-primary mt-8 inline-flex no-underline"
        >
          {token ? "Back to projects" : "Go to sign in"}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
