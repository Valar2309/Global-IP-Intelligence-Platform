import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { ScrollText, Loader2 } from "lucide-react";

// Activity Logs Page

const ACTION_COLORS = {
  ANALYST_APPROVED:     "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  ANALYST_REJECTED:     "bg-red-500/20    text-red-300    border border-red-500/30",
  USER_REGISTERED:      "bg-blue-500/20   text-blue-300   border border-blue-500/30",
  ADMIN_LOGIN:          "bg-violet-500/20 text-violet-300  border border-violet-500/30",
  SUBSCRIPTION_CREATED: "bg-amber-500/20  text-amber-300  border border-amber-500/30",
  SUBSCRIPTION_DELETED: "bg-slate-500/20  text-slate-300  border border-slate-500/30",
};

const ACTION_OPTIONS = [
  "ALL",
  "ADMIN_LOGIN",
  "USER_REGISTERED",
  "ANALYST_APPROVED",
  "ANALYST_REJECTED",
  "SUBSCRIPTION_CREATED",
  "SUBSCRIPTION_DELETED",
];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AdminLogsPage() {
  const [logs,        setLogs]        = useState([]);
  const [logTotal,    setLogTotal]    = useState(0);
  const [logPage,     setLogPage]     = useState(0);
  const [totalPages,  setTotalPages]  = useState(0);
  const [action,      setAction]      = useState("ALL");
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLogs = async (page, act, reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const params = { page, size: 20 };
      if (act && act !== "ALL") params.action = act;

      const res = await api.get("/api/admin/logs", { params });
      const data = res.data;

      setLogs(prev => reset ? data.content : [...prev, ...data.content]);
      setLogTotal(data.totalElements);
      setLogPage(data.page);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => { fetchLogs(0, action, true); }, []);

  // Re-fetch when filter changes
  useEffect(() => { fetchLogs(0, action, true); }, [action]);

  return (
    <div className="space-y-6">

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ScrollText size={22} className="text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
          <span className="text-sm text-gray-400 font-normal">
            ({logTotal.toLocaleString()} total)
          </span>
        </div>

        {/* Action filter dropdown */}
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-gray-200 text-sm
                     rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          {ACTION_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* Table card */}
      <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" /> Loading logs…
          </div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            No log entries found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700 text-gray-300">
                  <tr>
                    <th className="text-left px-5 py-3 whitespace-nowrap">Timestamp</th>
                    <th className="text-left px-5 py-3">Action</th>
                    <th className="text-left px-5 py-3">Performed By</th>
                    <th className="text-left px-5 py-3">Entity</th>
                    <th className="text-left px-5 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-700/60 hover:bg-slate-700/50 transition"
                    >
                      <td className="px-5 py-3 text-gray-400 whitespace-nowrap text-xs">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                                        ${ACTION_COLORS[entry.action] ?? "bg-gray-600/30 text-gray-300"}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-200 font-medium">
                        {entry.performedBy ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {entry.entityType && entry.entityId
                          ? `${entry.entityType} #${entry.entityId}`
                          : (entry.entityType ?? "—")}
                      </td>
                      <td className="px-5 py-3 text-gray-400 max-w-xs truncate text-xs">
                        {entry.details ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {logPage + 1 < totalPages && (
              <div className="px-6 py-5 text-center border-t border-slate-700">
                <button
                  onClick={() => fetchLogs(logPage + 1, action, false)}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                             rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/20"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Loading…
                    </span>
                  ) : (
                    `Load More (${logTotal - logs.length} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}