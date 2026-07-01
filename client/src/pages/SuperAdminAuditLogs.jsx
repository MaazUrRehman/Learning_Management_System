import { useEffect, useState } from "react";
import api from "../lib/api.js";

const SuperAdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/super-admin/audit-logs");
        setLogs(response.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Audit logs</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">System activity</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Track important system events such as login, user management, and configuration changes.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Recent audit events</h2>
            <p className="mt-2 text-sm text-slate-400">Audit events are captured for all protected system actions.</p>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading audit logs…</p>
        ) : error ? (
          <p className="mt-6 text-rose-400">{error}</p>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/80">
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-800 last:border-none">
                    <td className="px-4 py-4 text-slate-100">
                      {log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : "System"}
                    </td>
                    <td className="px-4 py-4 text-slate-300">{log.action}</td>
                    <td className="px-4 py-4 text-slate-300">{log.details || "-"}</td>
                    <td className="px-4 py-4 text-slate-300">{new Date(log.createdAt).toLocaleString()}</td>
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

export default SuperAdminAuditLogs;
