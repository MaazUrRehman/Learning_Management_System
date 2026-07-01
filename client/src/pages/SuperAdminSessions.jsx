import { useEffect, useState } from "react";
import api from "../lib/api.js";

const SuperAdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", isCurrent: false });

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/super-admin/sessions");
      setSessions(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load academic sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/super-admin/sessions", form);
      setForm({ name: "", startDate: "", endDate: "", isCurrent: false });
      await fetchSessions();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create session.");
    } finally {
      setSaving(false);
    }
  };

  const updateSession = async (id, action) => {
    setError(null);
    try {
      if (action === "activate") {
        await api.patch(`/super-admin/sessions/${id}/activate`);
      } else {
        await api.patch(`/super-admin/sessions/${id}/archive`);
      }
      await fetchSessions();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update session.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Academic Sessions</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Manage Sessions</h2>
            <p className="mt-2 text-slate-400">Create, activate, and archive academic year sessions.</p>
          </div>
        </div>

        <form className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]" onSubmit={handleCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Session Name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. 2025-2026"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Start Date
              <input
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                type="date"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              End Date
              <input
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                type="date"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-300">
              <input
                name="isCurrent"
                type="checkbox"
                checked={form.isCurrent}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-violet-500 focus:ring-violet-500"
              />
              Mark session as current
            </label>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quick actions</p>
            <p className="mt-3 text-slate-400">Create a new academic year and choose whether it should become the current active session.</p>
            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
            >
              {saving ? "Saving session..." : "Create session"}
            </button>
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Session list</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Available sessions</h3>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading sessions…</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/80">
                {sessions.map((session) => (
                  <tr key={session._id} className="border-b border-slate-800 last:border-none">
                    <td className="px-4 py-4 font-medium text-white">{session.name}</td>
                    <td className="px-4 py-4 text-slate-300">{new Date(session.startDate).toLocaleDateString()} – {new Date(session.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${session.isCurrent ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-300"}`}>
                        {session.isCurrent ? "Current" : "Archived"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {!session.isCurrent && (
                          <button
                            type="button"
                            onClick={() => updateSession(session._id, "activate")}
                            className="rounded-3xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-400"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => updateSession(session._id, "archive")}
                          disabled={!session.isCurrent}
                          className="rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSessions;
