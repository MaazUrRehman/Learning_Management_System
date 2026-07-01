import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Admin Portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Welcome, {user?.firstName}</h1>
          </div>
          <button onClick={logout} className="rounded-3xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold transition hover:bg-slate-700/60">
            Sign out
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-white">Manage Staff</h3>
            <p className="mt-2 text-slate-400">View and update staff records.</p>
          </div>
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-white">Academics</h3>
            <p className="mt-2 text-slate-400">Manage classes and sections.</p>
          </div>
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-white">Reports</h3>
            <p className="mt-2 text-slate-400">Generate system reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
