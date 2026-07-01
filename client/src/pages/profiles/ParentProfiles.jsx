import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api.js";
import TableToolbar from "../../components/TableToolbar.jsx";
import { filterItemsBySearch, sortItems } from "../../lib/tableUtils.js";

const ParentProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [pageSize, setPageSize] = useState(25);

  const [form, setForm] = useState({
    userId: "",
    occupation: "",
    companyName: "",
    annualIncome: "",
    relationshipWithStudent: "",
    secondaryContact: "",
    street: "", city: "", state: "", country: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profilesRes, usersRes] = await Promise.all([
        api.get("/super-admin/profiles/parents"),
        api.get("/super-admin/profiles/users/role/PARENT")
      ]);
      setProfiles(profilesRes.data.data);
      setUsers(usersRes.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        userId: form.userId,
        occupation: form.occupation,
        companyName: form.companyName,
        annualIncome: form.annualIncome ? Number(form.annualIncome) : null,
        relationshipWithStudent: form.relationshipWithStudent,
        secondaryContact: form.secondaryContact,
        address: {
          street: form.street, city: form.city, state: form.state, country: form.country,
        }
      };

      if (editingId) {
        await api.patch(`/super-admin/profiles/parents/${editingId}`, payload);
        setSuccess("Profile updated successfully.");
        setEditingId(null);
      } else {
        await api.post("/super-admin/profiles/parents", payload);
        setSuccess("Profile created successfully.");
      }
      setForm({ userId: "", occupation: "", companyName: "", annualIncome: "", relationshipWithStudent: "", secondaryContact: "", street: "", city: "", state: "", country: "" });
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || (editingId ? "Unable to update profile." : "Unable to create profile."));
    } finally {
      setSubmitting(false);
    }
  };

  const editProfile = (profile) => {
    setEditingId(profile._id);
    setForm({
      userId: profile.userId?._id || "",
      occupation: profile.occupation || "",
      companyName: profile.companyName || "",
      annualIncome: profile.annualIncome || "",
      relationshipWithStudent: profile.relationshipWithStudent || "",
      secondaryContact: profile.secondaryContact || "",
      street: profile.address?.street || "",
      city: profile.address?.city || "",
      state: profile.address?.state || "",
      country: profile.address?.country || "",
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ userId: "", occupation: "", companyName: "", annualIncome: "", relationshipWithStudent: "", secondaryContact: "", street: "", city: "", state: "", country: "" });
    setError(null);
    setSuccess(null);
  };

  const deleteProfile = async (profileId) => {
    if (!window.confirm("Delete this profile?")) return;
    try {
      await api.delete(`/super-admin/profiles/parents/${profileId}`);
      setSuccess("Profile deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete profile.");
    }
  };

  const availableUsers = users.filter(u => !profiles.some(p => p.userId?._id === u._id));
  const sortOptions = [
    { value: "userId.firstName", label: "Name" },
    { value: "occupation", label: "Occupation" },
    { value: "companyName", label: "Company Name" },
    { value: "relationshipWithStudent", label: "Relationship" },
    { value: "secondaryContact", label: "Secondary Contact" },
  ];

  const filteredProfiles = useMemo(() => {
    const filtered = filterItemsBySearch(profiles, searchQuery);
    const sorted = sortItems(filtered, sortBy);
    return sorted.slice(0, pageSize);
  }, [profiles, searchQuery, sortBy, pageSize]);

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Profile Management</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Parent Profiles</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Select User
              <select name="userId" value={form.userId} onChange={handleInput} required disabled={editingId !== null} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">-- Choose User --</option>
                {editingId ? (
                  <option value={form.userId}>{profiles.find(p => p._id === editingId)?.userId?.firstName} {profiles.find(p => p._id === editingId)?.userId?.lastName}</option>
                ) : (
                  availableUsers.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)
                )}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Occupation
              <input name="occupation" value={form.occupation} onChange={handleInput} placeholder="Engineer" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Company Name
              <input name="companyName" value={form.companyName} onChange={handleInput} placeholder="Tech Corp" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Relationship
              <input name="relationshipWithStudent" value={form.relationshipWithStudent} onChange={handleInput} placeholder="Father" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Secondary Contact
              <input name="secondaryContact" value={form.secondaryContact} onChange={handleInput} placeholder="+1 987 654" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
          </div>
          
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{editingId ? 'Edit Profile' : 'Create Profile'}</p>
            <button type="submit" disabled={submitting || (!editingId && availableUsers.length === 0)} className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50">
              {submitting ? "Saving..." : editingId ? "Update Profile" : "Save Profile"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="mt-3 inline-flex w-full items-center justify-center rounded-3xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
                Cancel Edit
              </button>
            )}
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
            {success && <p className="mt-4 text-sm text-emerald-300">{success}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <h3 className="text-2xl font-semibold text-white mb-6">Parent Directory</h3>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
          sortBy={sortBy}
          onSortChange={setSortBy}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          sortOptions={sortOptions}
          placeholder="Search parent profiles..."
        />
        {loading ? <p className="text-slate-400">Loading...</p> : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Occupation</th>
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Relationship</th>
                  <th className="px-4 py-3">Secondary Contact</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProfiles.map(p => (
                  <tr key={p._id} className="border-b border-slate-800">
                    <td className="px-4 py-4">{p.userId?.firstName} {p.userId?.lastName}</td>
                    <td className="px-4 py-4">{p.occupation || "-"}</td>
                    <td className="px-4 py-4">{p.companyName || "-"}</td>
                    <td className="px-4 py-4">{p.relationshipWithStudent || "-"}</td>
                    <td className="px-4 py-4">{p.secondaryContact || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => editProfile(p)} className="rounded-3xl bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20">Edit</button>
                        <button onClick={() => deleteProfile(p._id)} className="rounded-3xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">Delete</button>
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

export default ParentProfiles;
