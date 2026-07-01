import { useEffect, useMemo, useState } from "react";
import api from "../lib/api.js";
import TableToolbar from "../components/TableToolbar.jsx";
import { filterItemsBySearch, sortItems } from "../lib/tableUtils.js";

const roles = ["ADMIN", "ACCOUNTANT", "FACULTY", "PARENT", "STUDENT"];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  role: "ADMIN",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
};

const SuperAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Modals state
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/super-admin/users");
      setUsers(response.data.data.users || response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormState = () => {
    setEditingUserId(null);
    setForm({ ...emptyForm });
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      role: user.role || "ADMIN",
      phone: user.phone || "",
      address: user.address?.street || user.address?.address || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      country: user.address?.country || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitUser = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      username: form.username,
      phone: form.phone,
      address: {
        street: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
      },
    };

    if (!editingUserId) {
      payload.role = form.role;
    }

    try {
      if (editingUserId) {
        await api.patch(`/super-admin/users/${editingUserId}`, payload);
        setSuccess("User updated successfully.");
      } else {
        await api.post("/super-admin/users", payload);
        setSuccess("User created successfully.");
      }
      resetFormState();
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || (editingUserId ? "Unable to update user." : "Unable to create user."));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/super-admin/users/${deleteUserId}`);
      setSuccess("User deleted successfully.");
      setDeleteUserId(null);
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete user.");
    }
  };

  const generateCredentials = async (userId) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post(`/super-admin/profiles/users/${userId}/generate-credentials`);
      setCredentials(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to generate credentials.");
    }
  };

  const sortOptions = [
    { value: "firstName", label: "Name" },
    { value: "username", label: "Username" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
    { value: "phone", label: "Phone" },
    { value: "address.street", label: "Address" },
    { value: "address.city", label: "City" },
    { value: "address.state", label: "State" },
    { value: "address.country", label: "Country" },
    { value: "createdAt", label: "Joined" },
  ];

  const filteredUsers = useMemo(() => {
    const filtered = filterItemsBySearch(users, searchQuery);
    const sorted = sortItems(filtered, sortBy);
    return sorted;
  }, [users, searchQuery, sortBy]);

  const paginatedUsers = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= pageCount) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-8 relative">
      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[32px] border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center">
            <h3 className="text-2xl font-semibold text-white mb-2">Delete User?</h3>
            <p className="text-slate-400 mb-6">Are you sure you want to delete this user? This action cannot be fully undone.</p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 rounded-3xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-400">Yes, delete</button>
              <button onClick={() => setDeleteUserId(null)} className="flex-1 rounded-3xl bg-slate-800 px-4 py-3 font-semibold text-white transition hover:bg-slate-700">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Credentials Modal */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-white mb-2">Credentials Generated</h3>
            <p className="text-slate-400 mb-6">Please securely share these credentials with the user. They will only be displayed once.</p>
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 font-mono text-sm space-y-3">
              <div>
                <span className="text-slate-500 block mb-1">Email</span>
                <span className="text-emerald-400">{credentials.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Temporary Password</span>
                <span className="text-cyan-400 select-all">{credentials.temporaryPassword}</span>
              </div>
            </div>

            <button onClick={() => setCredentials(null)} className="w-full rounded-3xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400">
              Done (I have saved it)
            </button>
          </div>
        </div>
      )}

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">{editingUserId ? "Edit user" : "User management"}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{editingUserId ? "Update user details" : "Manage users"}</h2>
            <p className="mt-2 text-slate-400">{editingUserId ? "Edit the selected user and save from here." : "Register basic user accounts for all roles."}</p>
          </div>
        </div>

        <form onSubmit={handleSubmitUser} className="mt-8 grid gap-4 xl:grid-cols-[0.7fr_0.3fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              First name
              <input name="firstName" value={form.firstName} onChange={handleInput} placeholder="John" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" required />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Last name
              <input name="lastName" value={form.lastName} onChange={handleInput} placeholder="Doe" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" required />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Email
              <input name="email" type="email" value={form.email} onChange={handleInput} placeholder="john@academy.com" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" required />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Username
              <input name="username" value={form.username} onChange={handleInput} placeholder="john.doe" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" required />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Role
              <select name="role" value={form.role} onChange={handleInput} className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400">
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Phone
              <input name="phone" value={form.phone} onChange={handleInput} placeholder="+1 234 567 890" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Address
              <input name="address" value={form.address} onChange={handleInput} placeholder="123 Academy Road" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              City
              <input name="city" value={form.city} onChange={handleInput} placeholder="City" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              State
              <input name="state" value={form.state} onChange={handleInput} placeholder="State" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Country
              <input name="country" value={form.country} onChange={handleInput} placeholder="Country" className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-100 outline-none focus:border-violet-400" />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Add a user</p>
            <p className="mt-3 text-slate-400">Register a user. Note: Passwords are no longer typed here.</p>
            <button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/60">
              {submitting ? (editingUserId ? "Saving changes..." : "Saving user...") : (editingUserId ? "Update Profile" : "Create user")}
            </button>
            {editingUserId && (
              <button type="button" onClick={resetFormState} className="mt-3 inline-flex w-full items-center justify-center rounded-3xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800">
                Cancel edit
              </button>
            )}
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
            {success && <p className="mt-4 text-sm text-emerald-300">{success}</p>}
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Active users</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">User directory</h3>
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
          placeholder="Search users..."
          showPageSize={false}
        />

        {loading ? (
          <p className="mt-6 text-slate-400">Loading users…</p>
        ) : (
          <div className="mt-6 space-y-4">
            {Array.isArray(paginatedUsers) && paginatedUsers.map((user) => (
              <div key={user._id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-sm">
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_0.9fr]">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Name</p>
                    <p className="text-lg font-semibold text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-slate-400">{user.role}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Username / Email</p>
                    <p className="text-sm text-slate-200">{user.username}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-4">Phone</p>
                    <p className="text-sm text-slate-200">{user.phone || "—"}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">City / State / Country</p>
                    <p className="text-sm text-slate-200">{user.address?.city || "—"}</p>
                    <p className="text-sm text-slate-200">{user.address?.state || "—"}</p>
                    <p className="text-sm text-slate-200">{user.address?.country || "—"}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-4">Joined</p>
                    <p className="text-sm text-slate-200">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Action</p>
                    <button type="button" onClick={() => generateCredentials(user._id)} className="w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                      Generate Credentials
                    </button>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => handleEditUser(user)} className="flex-1 rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeleteUserId(user._id)} className="flex-1 rounded-3xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
              <div>
                Page {currentPage + 1} of {pageCount}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                  Previous
                </button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= pageCount - 1} className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminUsers;
