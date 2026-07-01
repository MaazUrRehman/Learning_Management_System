import { useEffect, useState } from "react";
import api from "../lib/api.js";

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    academyName: "",
    contactInfo: { email: "", phone: "" },
    academyLogo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.get("/super-admin/settings");
      setSettings((prev) => ({
        ...prev,
        academyName: response.data.data.academyName || "",
        academyLogo: response.data.data.academyLogo || "",
        contactInfo: {
          email: response.data.data.contactInfo?.email || "",
          phone: response.data.data.contactInfo?.phone || "",
        },
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "email" || name === "phone") {
      setSettings((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [name]: value,
        },
      }));
      return;
    }
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch("/super-admin/settings", settings);
      setSuccess("Settings updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Settings</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Academy settings</h2>
          <p className="mt-2 text-slate-400">Update core institution details and contact information.</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-400">Loading settings…</p>
      ) : (
        <form className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.6fr]" onSubmit={handleSave}>
          <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <label className="space-y-2 text-sm text-slate-300">
              Academy name
              <input
                name="academyName"
                value={settings.academyName}
                onChange={handleChange}
                placeholder="Academy name"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Contact email
              <input
                name="email"
                value={settings.contactInfo.email}
                onChange={handleChange}
                type="email"
                placeholder="support@academy.com"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Contact phone
              <input
                name="phone"
                value={settings.contactInfo.phone}
                onChange={handleChange}
                placeholder="+1 234 567 890"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Academy logo URL
              <input
                name="academyLogo"
                value={settings.academyLogo}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Save changes</p>
            <p className="mt-3 text-slate-400">Use this section to store academy branding and contact settings.</p>
            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
            >
              {saving ? "Saving..." : "Save settings"}
            </button>
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
            {success && <p className="mt-4 text-sm text-emerald-300">{success}</p>}
          </div>
        </form>
      )}
    </div>
  );
};

export default SuperAdminSettings;
