import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { IconChart, IconFolder, IconMenu, IconUser } from "./icons";

const navItems = [
  { to: "/dashboard", label: "Projects", end: true, Icon: IconFolder },
  { to: "/analytics", label: "Analytics", Icon: IconChart },
  { to: "/profile", label: "Profile", Icon: IconUser },
];

function sidebarLinkClass({ isActive }) {
  return `group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.9375rem] font-medium no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] [&_svg]:shrink-0 ${
    isActive
      ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--text-h)] ring-1 ring-[var(--accent-border)] shadow-sm [&_svg]:opacity-100"
      : "text-[var(--text)] hover:bg-[color-mix(in_oklab,var(--accent-bg)_55%,transparent)] hover:text-[var(--text-h)] [&_svg]:opacity-[0.68] hover:[&_svg]:opacity-100"
  }`;
}

function SidebarNav({ showNav, onNavigate }) {
  if (!showNav) return null;
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Main">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={sidebarLinkClass}
          onClick={onNavigate}
        >
          <item.Icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function AppLayout({ children, title, subtitle, navLeft, showLogout = true, showNav = true }) {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const sidebarChrome = (
    <>
      <div className="border-b border-[var(--border)]/50 px-5 py-5">
        <NavLink
          to="/dashboard"
          className="flex items-start gap-3 text-left no-underline focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          onClick={closeMobileNav}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-violet-600 text-sm font-bold tracking-tight text-white shadow-md shadow-[color-mix(in_oklab,var(--accent)_28%,transparent)]"
            aria-hidden
          >
            W
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              Workspace
            </span>
            <span className="mt-0.5 block font-semibold leading-snug tracking-tight text-[var(--text-h)]">
              SaaS Kit
            </span>
          </span>
        </NavLink>
      </div>
      <SidebarNav showNav={showNav} onNavigate={closeMobileNav} />
      <div className="mt-auto border-t border-[var(--border)]/50 px-5 py-4">
        <p className="text-xs leading-relaxed text-[var(--text)] opacity-60">
          Plan, track, and ship — all in one place.
        </p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-svh bg-[var(--bg)] text-[var(--text)]">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[color-mix(in_oklab,#000_45%,transparent)] backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={closeMobileNav}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-[var(--border)]/50 bg-[var(--sidebar-surface)] shadow-[var(--shadow-elevated)] backdrop-blur-2xl transition-transform duration-200 ease-out md:static md:z-0 md:w-60 md:translate-x-0 md:shadow-none lg:w-64 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {sidebarChrome}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--border)]/70 bg-[var(--topbar-surface)] shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--bg)_82%,transparent)]">
          <div className="flex min-h-[3.75rem] items-start gap-3 px-4 py-3 sm:items-center sm:gap-4 lg:px-6">
            <button
              type="button"
              className="btn btn-ghost btn-compact mt-0.5 shrink-0 md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 sm:gap-4">
              {navLeft ? <div className="shrink-0">{navLeft}</div> : null}
              <div className="min-w-0 flex-1">
                <h1 className="page-title truncate">{title}</h1>
                {subtitle ? (
                  <p className="page-subtitle mt-0.5 truncate">{subtitle}</p>
                ) : null}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <ThemeToggle />
              {showLogout ? (
                <button type="button" className="btn btn-ghost btn-compact" onClick={logout}>
                  Sign out
                </button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="app-main-surface flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
