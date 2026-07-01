import { useState } from "react";
import api from "../lib/api.js";

const notifyRoles = [
  { label: "Admin", value: "ADMIN" },
  { label: "Accountant", value: "ACCOUNTANT" },
  { label: "Faculty", value: "FACULTY" },
];

const SuperAdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const toggleRole = (value) => {
    setSelectedRoles((prev) =>
      prev.includes(value) ? prev.filter((role) => role !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      await api.post("/super-admin/notifications", {
        title,
        message,
        recipientRoles: selectedRoles,
      });
      setStatus({ type: "success", message: "Notification sent successfully." });
      setTitle("");
      setMessage("");
      setSelectedRoles([]);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Unable to send notification.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Communication</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Send Notification</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Broadcast a message to selected staff groups and keep the academy informed.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-300">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
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
                placeholder="Write your notification message here"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                required
              />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recipients</p>
            <p className="mt-3 text-sm text-slate-400">Select one or more staff groups for this notification.</p>
            <div className="mt-6 space-y-3">
              {notifyRoles.map((role) => (
                <label key={role.value} className="flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  {role.label}
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
            >
              {sending ? "Sending..." : "Send notification"}
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

export default SuperAdminNotifications;
