import { useEffect, useState } from "react";
import api from "../lib/api.js";

const SuperAdminSections = () => {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", classId: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sectionsResponse, classesResponse] = await Promise.all([
        api.get("/super-admin/sections"),
        api.get("/super-admin/classes"),
      ]);
      setSections(sectionsResponse.data.data);
      setClasses(classesResponse.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load sections or classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post("/super-admin/sections", form);
      setForm({ name: "", classId: "" });
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create section.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sectionId) => {
    setError(null);
    try {
      await api.delete(`/super-admin/sections/${sectionId}`);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete section.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Sections</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Section management</h2>
            <p className="mt-2 text-slate-400">Create sections and attach them to a class group.</p>
          </div>
        </div>

        <form className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]" onSubmit={handleCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Section name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Section A"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Class
              <select
                name="classId"
                value={form.classId}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name} ({cls.code})</option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quick create</p>
            <p className="mt-3 text-slate-400">Add a section and assign it to a class for scheduling.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
            >
              {saving ? "Saving section..." : "Create section"}
            </button>
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Available sections</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Section list</h3>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading sections…</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/80">
                {sections.map((section) => (
                  <tr key={section._id} className="border-b border-slate-800 last:border-none">
                    <td className="px-4 py-4 font-medium text-white">{section.name}</td>
                    <td className="px-4 py-4 text-slate-300">{section.classId?.name || "—"}</td>
                    <td className="px-4 py-4 text-slate-300">{new Date(section.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(section._id)}
                        className="rounded-3xl border border-rose-500 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
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

export default SuperAdminSections;
