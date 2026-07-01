import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/super-admin/dashboard");
        setStats(response.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const metrics = [
    {
      label: "Total users",
      value: stats?.totalUsers ?? "—",
      description: "Active user accounts",
    },
    {
      label: "Total students",
      value: stats?.totalStudents ?? "—",
      description: "Active student profiles",
    },
    {
      label: "Total faculty",
      value: stats?.totalFaculty ?? "—",
      description: "Teacher accounts active",
    },
    {
      label: "Total classes",
      value: stats?.totalClasses ?? "—",
      description: "Class groups configured",
    },
    {
      label: "Total subjects",
      value: stats?.totalSubjects ?? "—",
      description: "Subjects available in catalog",
    },
    {
      label: "Active sessions",
      value: stats?.totalActiveSessions ?? "—",
      description: "Academic years tracked",
    },
  ];

  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-lg shadow-slate-950/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Welcome back</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Super Admin Dashboard</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              View academy insights and manage the LMS from a centralized administration workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 px-5 py-4 text-sm text-slate-300 shadow-sm shadow-slate-950/10">
              <p className="uppercase tracking-[0.25em] text-slate-500">Active users</p>
              <p className="mt-3 text-2xl font-semibold text-white">{stats?.totalUsers ?? "—"}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 px-5 py-4 text-sm text-slate-300 shadow-sm shadow-slate-950/10">
              <p className="uppercase tracking-[0.25em] text-slate-500">Active sessions</p>
              <p className="mt-3 text-2xl font-semibold text-white">{stats?.totalActiveSessions ?? "—"}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 px-5 py-4 text-sm text-slate-300 shadow-sm shadow-slate-950/10">
              <p className="uppercase tracking-[0.25em] text-slate-500">Total classes</p>
              <p className="mt-3 text-2xl font-semibold text-white">{stats?.totalClasses ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {user?.forcePasswordChange && (
        <div className="rounded-[28px] border border-amber-500/30 bg-amber-950/10 p-6 text-amber-100 shadow-sm shadow-amber-950/20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Action required</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Change your temporary password</h2>
              <p className="mt-2 text-sm text-amber-200">
                You have logged in with temporary credentials. Update your password now to unlock full access.
              </p>
            </div>
            <button
              onClick={() => window.location.assign("/change-password")}
              className="inline-flex rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Update password
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-6 text-slate-300 shadow-sm shadow-slate-950/20">
          Loading dashboard metrics...
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-rose-700 bg-rose-950/20 p-6 text-rose-200 shadow-sm shadow-slate-950/20">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-6 shadow-sm shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                <p className="mt-5 text-4xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-400">{metric.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-[28px] border border-slate-800 bg-slate-950/95 p-6 shadow-sm shadow-slate-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Recent activity</h2>
                  <p className="mt-2 text-sm text-slate-400">Latest user and login events from the academy.</p>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">Live</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900/90 p-5 text-slate-300">
                  <p className="text-sm text-slate-400">Newest user added</p>
                  <p className="mt-3 text-lg font-semibold text-white">{stats?.recentActivity?.latestUser?.email || "No recent user"}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-5 text-slate-300">
                  <p className="text-sm text-slate-400">Latest login</p>
                  <p className="mt-3 text-lg font-semibold text-white">{stats?.recentActivity?.latestLogin?.email || "No login found"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-800 bg-slate-950/95 p-6 shadow-sm shadow-slate-950/20">
              <h2 className="text-xl font-semibold text-white">Quick actions</h2>
              <p className="mt-2 text-sm text-slate-400">Jump to the most important admin areas.</p>
              <div className="mt-6 space-y-3">
                <button className="w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">Manage users</button>
                <button className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800">Manage sessions</button>
                <button className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800">Manage subjects</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
