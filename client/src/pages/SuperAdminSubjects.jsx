import { useEffect, useState } from "react";
import api from "../lib/api.js";

const SuperAdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", classId: "" });

  const fetchClasses = async () => {
    const response = await api.get("/super-admin/classes");
    setClasses(response.data.data);
  };

  const fetchSubjects = async (classId = "") => {
    setLoading(true);
    setError(null);
    try {
      const query = classId ? `?classId=${encodeURIComponent(classId)}` : "";
      const response = await api.get(`/super-admin/subjects${query}`);
      setSubjects(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
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
      await api.post("/super-admin/subjects", form);
      setForm({ name: "", code: "", classId: "" });
      await fetchSubjects(selectedClassId);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create subject.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subjectId) => {
    setError(null);
    try {
      await api.delete(`/super-admin/subjects/${subjectId}`);
      await fetchSubjects(selectedClassId);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete subject.");
    }
  };

  const handleFilterChange = async (event) => {
    const classId = event.target.value;
    setSelectedClassId(classId);
    await fetchSubjects(classId);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Subjects</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Subject catalog</h2>
            <p className="mt-2 text-slate-400">Create subjects and link them to academic classes.</p>
          </div>
        </div>

        <form className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]" onSubmit={handleCreate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Subject name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Physics"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Subject code
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. PHY101"
                className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
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
            <p className="mt-3 text-slate-400">Add a subject to the academy catalog and assign it to the correct class.</p>
            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60"
            >
              {saving ? "Saving subject..." : "Create subject"}
            </button>
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Subject list</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Available subjects</h3>
          </div>
          <label className="text-sm text-slate-300">
            Filter by class
            <select
              value={selectedClassId}
              onChange={handleFilterChange}
              className="mt-2 block w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400 sm:w-72"
            >
              <option value="">All classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name} ({cls.code})</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading subjects…</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/80">
                {subjects.map((subject) => (
                  <tr key={subject._id} className="border-b border-slate-800 last:border-none">
                    <td className="px-4 py-4 font-medium text-white">{subject.name}</td>
                    <td className="px-4 py-4 text-slate-300">{subject.code}</td>
                    <td className="px-4 py-4 text-slate-300">{subject.classId?.name || "—"}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(subject._id)}
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

export default SuperAdminSubjects;
