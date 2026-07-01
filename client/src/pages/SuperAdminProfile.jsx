import { useEffect, useState } from "react";
import api from "../lib/api.js";

const SuperAdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", street: "", city: "", state: "", zipCode: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setStatus(null);
      try {
        const response = await api.get("/super-admin/profile");
        const data = response.data.data;
        setProfile(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          zipCode: data.address?.zipCode || "",
        });
      } catch (err) {
        setStatus({ type: "error", message: err?.response?.data?.message || "Unable to load profile." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const response = await api.patch("/super-admin/profile", {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
      });

      setProfile(response.data.data);
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Unable to update profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Profile</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Your Super Admin profile</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Update your personal details and contact information securely.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 text-slate-400 shadow-xl shadow-slate-950/20">Loading profile…</div>
      ) : (
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
          <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                First name
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Last name
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Email
                <input
                  name="email"
                  value={form.email}
                  readOnly
                  className="w-full rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-400 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Street
                <input
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                State
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                ZIP Code
                <input
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Account overview</p>
              <p className="mt-3 text-sm text-slate-400">Manage your personal info and update contact details.</p>
              <button
                type="submit"
                disabled={saving}
                className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              {status && (
                <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-300" : "text-rose-400"}`}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SuperAdminProfile;
