import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api.js";
import TableToolbar from "../../components/TableToolbar.jsx";
import { filterItemsBySearch, sortItems } from "../../lib/tableUtils.js";

const AdminProfiles = () => {
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
    employeeId: "",
    designation: "",
    joiningDate: "",
    department: "",
    qualification: "",
    experience: "",
    salary: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profilesRes, usersRes] = await Promise.all([
        api.get("/super-admin/profiles/admins"),
        api.get("/super-admin/profiles/users/role/ADMIN")
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
      if (editingId) {
        // Update existing profile
        await api.patch(`/super-admin/profiles/admins/${editingId}`, {
          employeeId: form.employeeId,
          designation: form.designation,
          joiningDate: form.joiningDate || null,
          department: form.department || null,
          qualification: form.qualification || null,
          experience: form.experience || null,
          salary: form.salary ? Number(form.salary) : null,
        });
        setSuccess("Profile updated successfully.");
        setEditingId(null);
      } else {
        // Create new profile
        await api.post("/super-admin/profiles/admins", {
          userId: form.userId,
          employeeId: form.employeeId,
          designation: form.designation,
          joiningDate: form.joiningDate || null,
          department: form.department || null,
          qualification: form.qualification || null,
          experience: form.experience || null,
          salary: form.salary ? Number(form.salary) : null,
        });
        setSuccess("Profile created successfully.");
      }
      setForm({ userId: "", employeeId: "", designation: "", joiningDate: "", department: "", qualification: "", experience: "", salary: "" });
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || `Unable to ${editingId ? 'update' : 'create'} profile.`);
    } finally {
      setSubmitting(false);
    }
  };

  const editProfile = (profile) => {
    setEditingId(profile._id);
    setForm({
      userId: profile.userId?._id || "",
      employeeId: profile.employeeId || "",
      designation: profile.designation || "",
      joiningDate: profile.joiningDate ? new Date(profile.joiningDate).toISOString().split('T')[0] : "",
      department: profile.department || "",
      qualification: profile.qualification || "",
      experience: profile.experience || "",
      salary: profile.salary || "",
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ userId: "", employeeId: "", designation: "", joiningDate: "", street: "", city: "", state: "", country: "" });
    setError(null);
    setSuccess(null);
  };

  const deleteProfile = async (profileId) => {
    if (!window.confirm("Delete this profile?")) return;
    try {
      await api.delete(`/super-admin/profiles/admins/${profileId}`);
      setSuccess("Profile deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete profile.");
    }
  };

  // Filter out users who already have a profile
  const availableUsers = users.filter(u => !profiles.some(p => p.userId?._id === u._id));
  const sortOptions = [
    { value: "userId.firstName", label: "Name" },
    { value: "employeeId", label: "Employee ID" },
    { value: "designation", label: "Designation" },
    { value: "department", label: "Department" },
    { value: "qualification", label: "Qualification" },
    { value: "experience", label: "Experience" },
    { value: "salary", label: "Salary" },
    { value: "joiningDate", label: "Joined" },
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
            <h2 className="mt-2 text-3xl font-semibold text-white">Admin Profiles</h2>
            <p className="mt-2 text-slate-400">Add detailed admin information to existing user accounts.</p>
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
              Employee ID
              <input name="employeeId" value={form.employeeId} onChange={handleInput} required placeholder="ADM-001" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Designation
              <input name="designation" value={form.designation} onChange={handleInput} placeholder="Senior Admin" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Joining Date
              <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleInput} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            
            <label className="space-y-2 text-sm text-slate-300">
              Department
              <input name="department" value={form.department} onChange={handleInput} placeholder="Administration" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Qualification
              <input name="qualification" value={form.qualification} onChange={handleInput} placeholder="MBA / BSc" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Experience
              <input name="experience" value={form.experience} onChange={handleInput} placeholder="5 years" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Salary
              <input type="number" name="salary" value={form.salary} onChange={handleInput} placeholder="60000" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
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
            {!editingId && availableUsers.length === 0 && <p className="mt-4 text-sm text-slate-400">All Admin users already have profiles.</p>}
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
            {success && <p className="mt-4 text-sm text-emerald-300">{success}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Profile list</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Admin Directory</h3>
          </div>
        </div>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
          sortBy={sortBy}
          onSortChange={setSortBy}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          sortOptions={sortOptions}
          placeholder="Search admin profiles..."
        />
        {loading ? <p className="text-slate-400">Loading...</p> : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Qualification</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProfiles.map(p => (
                  <tr key={p._id} className="border-b border-slate-800 last:border-none">
                    <td className="px-4 py-4">{p.userId?.firstName} {p.userId?.lastName}</td>
                    <td className="px-4 py-4">{p.employeeId}</td>
                    <td className="px-4 py-4">{p.designation || "-"}</td>
                    <td className="px-4 py-4">{p.department || "-"}</td>
                    <td className="px-4 py-4">{p.qualification || "-"}</td>
                    <td className="px-4 py-4">{p.experience || "-"}</td>
                    <td className="px-4 py-4">{p.salary || "-"}</td>
                    <td className="px-4 py-4">{p.joiningDate ? new Date(p.joiningDate).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => editProfile(p)} className="rounded-3xl bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20">Edit</button>
                        <button onClick={() => deleteProfile(p._id)} className="rounded-3xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20">Delete</button>
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

export default AdminProfiles;
