import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { setAuthData } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/auth/change-password", form);
      const authData = response.data.data;
      if (authData?.user && authData?.accessToken) {
        setAuthData(authData.user, authData.accessToken);
      }
      setSuccess("Password changed successfully. Redirecting to your dashboard...");

      const roleMap = {
        SUPER_ADMIN: "/super-admin/dashboard",
        ADMIN: "/admin",
        ACCOUNTANT: "/accountant",
        FACULTY: "/faculty",
        PARENT: "/parent",
        STUDENT: "/student",
      };
      const targetRoute = location.state?.from || roleMap[authData?.user?.role] || roleMap[location.state?.role] || "/login";

      setTimeout(() => navigate(targetRoute, { replace: true }), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to change password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-800 bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Security</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Change your temporary password</h1>
        <p className="mt-3 text-slate-400">{location.state?.message || "For your first login, please set a new password to continue."}</p>

        {error && <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        {success && <p className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{success}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2 text-sm text-slate-300">
            Current temporary password
            <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
          </label>
          <label className="block space-y-2 text-sm text-slate-300">
            New password
            <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
          </label>
          <label className="block space-y-2 text-sm text-slate-300">
            Confirm new password
            <input type="password" name="confirmNewPassword" value={form.confirmNewPassword} onChange={handleChange} required className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
          </label>

          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center rounded-3xl bg-violet-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-500/60">
            {submitting ? "Updating password..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
