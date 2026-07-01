import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SuperAdminNav from "../components/SuperAdminNav.jsx";
import SuperAdminHeader from "../components/SuperAdminHeader.jsx";

const SuperAdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="sticky top-6 flex min-h-[calc(100vh-48px)] flex-col justify-between rounded-[32px] border border-slate-800/70 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 p-6 shadow-2xl shadow-slate-950/30 text-white">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/25">
                  <span className="text-xl font-semibold">SA</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Super Admin</p>
                  <p className="text-lg font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="mt-1 text-sm text-slate-400">{user?.role?.replace("_", " ")}</p>
                </div>
              </div>

              <SuperAdminNav />
            </div>

            <div>
              <div className="rounded-[28px] border border-cyan-500/20 bg-slate-950/80 p-5 text-slate-200 shadow-inner shadow-blue-950/10">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">System status</p>
                <p className="mt-3 text-xl font-semibold text-white">Operational</p>
                <p className="mt-2 text-sm text-slate-400">All academy services are running smoothly.</p>
              </div>

              <button
                onClick={logout}
                className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Logout
              </button>
            </div>
          </aside>

          <main className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/30">
            <SuperAdminHeader />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
