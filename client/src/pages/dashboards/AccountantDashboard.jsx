import { useAuth } from "../../context/AuthContext.jsx";

const AccountantDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Accountant Portal</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Welcome, {user?.firstName}</h1>
          </div>
          <button onClick={logout} className="rounded-3xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold transition hover:bg-slate-700/60">
            Sign out
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-white">Fee Management</h3>
            <p className="mt-2 text-slate-400">Track and collect student fees.</p>
          </div>
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-white">Payroll</h3>
            <p className="mt-2 text-slate-400">Manage staff salaries.</p>
          </div>
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/90 p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-white">Invoices</h3>
            <p className="mt-2 text-slate-400">Generate and view invoices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
