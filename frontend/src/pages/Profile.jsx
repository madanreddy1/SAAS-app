import { useEffect, useState } from "react";
import API from "../api/api";
import AppLayout from "../components/AppLayout";
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";
import { useToast } from "../context/ToastContext";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get("/users/me");
        if (!cancelled) setUser(res.data);
      } catch (err) {
        if (!cancelled) {
          toast.error("Could not load your profile.");
          console.error(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast stable
  }, []);

  return (
    <AppLayout title="Profile" subtitle="Your account details">
      {loading ? (
        <ProfileSkeleton />
      ) : user ? (
        <div className="card-surface max-w-lg overflow-hidden p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div
              className="mb-4 flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-bg)] to-[color-mix(in_oklab,var(--accent)_22%,transparent)] text-2xl font-bold text-[var(--accent)] shadow-inner ring-2 ring-[var(--accent-border)] ring-offset-2 ring-offset-[color-mix(in_oklab,var(--bg)_90%,transparent)]"
              aria-hidden
            >
              {(user.email || "?").slice(0, 1).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-h)]">Signed in</h2>
            <p className="mt-1 text-sm text-[var(--text)] opacity-80">Workspace member</p>
          </div>

          <dl className="space-y-5 text-left">
            <div>
              <dt className="label mb-1.5">User ID</dt>
              <dd className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--code-bg)_35%,var(--bg))] px-4 py-3 font-mono text-sm text-[var(--text-h)]">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="label mb-1.5">Email</dt>
              <dd className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--code-bg)_35%,var(--bg))] px-4 py-3 text-[var(--text-h)]">
                {user.email}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="text-[var(--text)]">Unable to load profile.</p>
      )}
    </AppLayout>
  );
}

export default Profile;
