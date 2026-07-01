import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api.js";
import TableToolbar from "../../components/TableToolbar.jsx";
import { filterItemsBySearch, sortItems } from "../../lib/tableUtils.js";

const emptyForm = {
  userId: "",
  studentId: "",
  admissionNumber: "",
  rollNumber: "",
  parentId: "",
  classId: "",
  sectionId: "",
  academicSessionId: "",
  admissionDate: "",
  dateOfBirth: "",
  gender: "",
  religion: "",
  nationality: "",
  street: "",
  city: "",
  state: "",
  country: "",
};

const StudentProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [pageSize, setPageSize] = useState(25);

  const [form, setForm] = useState({ ...emptyForm });
  const [editingProfileId, setEditingProfileId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        profilesRes,
        usersRes,
        parentsRes,
        classesRes,
        sectionsRes,
        sessionsRes
      ] = await Promise.all([
        api.get("/super-admin/profiles/students"),
        api.get("/super-admin/profiles/users/role/STUDENT"),
        api.get("/super-admin/profiles/users/role/PARENT"),
        api.get("/super-admin/classes"),
        api.get("/super-admin/sections"),
        api.get("/super-admin/sessions")
      ]);
      setProfiles(profilesRes.data.data);
      setUsers(usersRes.data.data);
      setParents(parentsRes.data.data);
      setClasses(classesRes.data.data);
      setSections(sectionsRes.data.data);
      setSessions(sessionsRes.data.data);
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

    if (name === "classId") {
      setForm((prev) => ({ ...prev, sectionId: "" }));
    }
  };

  const resetForm = () => {
    setEditingProfileId(null);
    setForm({ ...emptyForm });
  };

  const handleEditProfile = (profile) => {
    setEditingProfileId(profile._id);
    setForm({
      userId: profile.userId?._id || profile.userId || "",
      studentId: profile.studentId || "",
      admissionNumber: profile.admissionNumber || "",
      rollNumber: profile.rollNumber || "",
      parentId: profile.parentId?._id || profile.parentId || "",
      classId: profile.classId?._id || profile.classId || "",
      sectionId: profile.sectionId?._id || profile.sectionId || "",
      academicSessionId: profile.academicSessionId?._id || profile.academicSessionId || "",
      admissionDate: profile.admissionDate ? profile.admissionDate.slice(0, 10) : "",
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
      gender: profile.gender || "",
      religion: profile.religion || "",
      nationality: profile.nationality || "",
      street: profile.address?.street || "",
      city: profile.address?.city || "",
      state: profile.address?.state || "",
      country: profile.address?.country || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createProfile = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        userId: form.userId,
        studentId: form.studentId || undefined,
        admissionNumber: form.admissionNumber || undefined,
        rollNumber: form.rollNumber,
        parentId: form.parentId || null,
        classId: form.classId || null,
        sectionId: form.sectionId || null,
        academicSessionId: form.academicSessionId || null,
        admissionDate: form.admissionDate || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        religion: form.religion,
        nationality: form.nationality,
        address: {
          street: form.street, city: form.city, state: form.state, country: form.country,
        }
      };

      if (editingProfileId) {
        await api.patch(`/super-admin/profiles/students/${editingProfileId}`, payload);
        setSuccess("Profile updated successfully.");
      } else {
        await api.post("/super-admin/profiles/students", payload);
        setSuccess("Profile created successfully.");
      }
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProfile = async (profileId) => {
    if (!window.confirm("Delete this profile?")) return;
    try {
      await api.delete(`/super-admin/profiles/students/${profileId}`);
      setSuccess("Profile deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete profile.");
    }
  };

  const editingProfile = editingProfileId ? profiles.find((profile) => profile._id === editingProfileId) : null;
  const availableUsers = users.filter((u) => !profiles.some((p) => p._id !== editingProfileId && (p.userId?._id === u._id || p.userId === u._id)));
  const filteredSections = form.classId ? sections.filter(section => section.classId === form.classId || section.classId?._id === form.classId) : [];
  const sortOptions = [
    { value: "userId.firstName", label: "Name" },
    { value: "studentId", label: "Student ID" },
    { value: "admissionNumber", label: "Admission Number" },
    { value: "classId.name", label: "Class" },
    { value: "sectionId.name", label: "Section" },
    { value: "academicSessionId.name", label: "Academic Session" },
    { value: "gender", label: "Gender" },
    { value: "dateOfBirth", label: "Date of Birth" },
    { value: "parentId.firstName", label: "Parent" },
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
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">{editingProfileId ? "Update Profile" : "Profile Management"}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{editingProfileId ? "Edit Student Profile" : "Student Profiles"}</h2>
          </div>
        </div>

        <form onSubmit={createProfile} className="mt-8 grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Select User
              <select name="userId" value={form.userId} onChange={handleInput} required disabled={editingProfileId !== null} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">-- Choose User --</option>
                {editingProfileId ? (
                  <option value={form.userId}>
                    {editingProfile?.userId?.firstName || ""} {editingProfile?.userId?.lastName || ""}
                    {editingProfile?.userId?.email ? ` (${editingProfile.userId.email})` : ""}
                  </option>
                ) : (
                  availableUsers.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)
                )}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Parent/Guardian
              <select name="parentId" value={form.parentId} onChange={handleInput} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400">
                <option value="">-- Choose Parent --</option>
                {parents.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Student ID
              <input name="studentId" value={form.studentId} onChange={handleInput} placeholder="STU-001" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Admission Number
              <input name="admissionNumber" value={form.admissionNumber} onChange={handleInput} placeholder="ADM-001" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Class
              <select name="classId" value={form.classId} onChange={handleInput} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400">
                <option value="">-- Choose Class --</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Section
              <select name="sectionId" value={form.sectionId} onChange={handleInput} disabled={!form.classId} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400 disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">{form.classId ? "-- Choose Section --" : "Choose class first"}</option>
                {filteredSections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Academic Session
              <select name="academicSessionId" value={form.academicSessionId} onChange={handleInput} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400">
                <option value="">-- Choose Session --</option>
                {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Gender
              <select name="gender" value={form.gender} onChange={handleInput} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400">
                <option value="">-- Choose Gender --</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Date of Birth
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleInput} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
          </div>
          
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{editingProfileId ? "Update Profile" : "Create Profile"}</p>
            <button type="submit" disabled={submitting || (!editingProfileId && availableUsers.length === 0)} className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50">
              {submitting ? "Saving..." : (editingProfileId ? "Update Profile" : "Save Profile")}
            </button>
            {editingProfileId && (
              <button type="button" onClick={resetForm} className="mt-3 inline-flex w-full items-center justify-center rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">
                Cancel Edit
              </button>
            )}
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
            {success && <p className="mt-4 text-sm text-emerald-300">{success}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <h3 className="text-2xl font-semibold text-white mb-6">Student Directory</h3>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
          sortBy={sortBy}
          onSortChange={setSortBy}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          sortOptions={sortOptions}
          placeholder="Search student profiles..."
        />
        {loading ? <p className="text-slate-400">Loading...</p> : (
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Admission Number</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Academic Session</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Date of Birth</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProfiles.map(p => (
                  <tr key={p._id} className="border-b border-slate-800">
                    <td className="px-4 py-4">{p.userId?.firstName} {p.userId?.lastName}</td>
                    <td className="px-4 py-4">{p.studentId || "-"}</td>
                    <td className="px-4 py-4">{p.admissionNumber || "-"}</td>
                    <td className="px-4 py-4">{p.classId?.name || "-"}</td>
                    <td className="px-4 py-4">{p.sectionId?.name || "-"}</td>
                    <td className="px-4 py-4">{p.academicSessionId?.name || "-"}</td>
                    <td className="px-4 py-4">{p.gender || "-"}</td>
                    <td className="px-4 py-4">{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-4">{p.parentId ? `${p.parentId.firstName} ${p.parentId.lastName}` : "-"}</td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <button onClick={() => handleEditProfile(p)} className="rounded-3xl bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20">Edit</button>
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

export default StudentProfiles;
