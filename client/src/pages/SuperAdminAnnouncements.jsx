import { useState } from "react";
import api from "../lib/api.js";

const targetRoles = [
  { label: "Students", value: "STUDENT" },
  { label: "Parents", value: "PARENT" },
  { label: "Faculty", value: "FACULTY" },
];

const SuperAdminAnnouncements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [expiry, setExpiry] = useState("");
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [status, setStatus] = useState(null);

  const toggleTarget = (value) => {
    setSelectedTargets((prev) =>
      prev.includes(value) ? prev.filter((target) => target !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    try {
      await api.post("/super-admin/announcements", {
        title,
        message,
        targetRoles: selectedTargets,
        expiryDate: expiry || undefined,
      });
      setStatus({ type: "success", message: "Announcement created successfully." });
      setTitle("");
      setMessage("");
      setExpiry("");
      setSelectedTargets([]);
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Unable to create announcement." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Communication</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Create Announcement</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Draft announcements for students, parents, and faculty with scheduling support.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-300">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                required
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Message
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter announcement details"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                required
              />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recipients</p>
            <div className="mt-4 space-y-3">
              {targetRoles.map((target) => (
                <label key={target.value} className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedTargets.includes(target.value)}
                    onChange={() => toggleTarget(target.value)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  {target.label}
                </label>
              ))}
            </div>
            <label className="mt-6 space-y-2 text-sm text-slate-300">
              Expiry date
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </label>
            <button
              type="submit"
              className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Save announcement
            </button>
            {status && (
              <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-300" : "text-rose-400"}`}>
                {status.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminAnnouncements;
