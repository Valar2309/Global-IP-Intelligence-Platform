import { useEffect, useState, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import api from "../services/api";
import axios from "axios";
import { toast } from "react-toastify";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  LogOut,
  Activity,
  ScrollText,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

// // Activity Logs & Health Dashboard

const ACTION_COLORS = {
  ANALYST_APPROVED:    "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  ANALYST_REJECTED:    "bg-red-500/20    text-red-300    border border-red-500/30",
  USER_REGISTERED:     "bg-blue-500/20   text-blue-300   border border-blue-500/30",
  ADMIN_LOGIN:         "bg-violet-500/20 text-violet-300  border border-violet-500/30",
  SUBSCRIPTION_CREATED:"bg-amber-500/20  text-amber-300  border border-amber-500/30",
  SUBSCRIPTION_DELETED:"bg-slate-500/20  text-slate-300  border border-slate-500/30",
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
    day   : "2-digit",
    month : "short",
    year  : "numeric",
    hour  : "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role  = localStorage.getItem("role");

  // ── existing state ────────────────────────────────────────────────────────
  const [users,      setUsers]      = useState([]);
  const [pending,    setPending]    = useState([]);
  const [loadingDoc, setLoadingDoc] = useState(null);

  // ── health card state ─────────────────────────────────────────────────────
  const [health,         setHealth]         = useState(null);
  const [healthChecking, setHealthChecking] = useState(false);

  // ── logs state ────────────────────────────────────────────────────────────
  const [logs,          setLogs]          = useState([]);
  const [logTotal,      setLogTotal]      = useState(0);
  const [logPage,       setLogPage]       = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(0);
  const [logAction,     setLogAction]     = useState("ALL");
  const [logsLoading,   setLogsLoading]   = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);

  /* ─── Auth guard ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!token || role !== "ADMIN") { navigate("/login"); return; }
    fetchUsers();
    fetchPending();
    fetchHealth();
    fetchLogs(0, "ALL", true);
  }, []);

  /* ─── Health: poll every 60 s ────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(fetchHealth, 60_000);
    return () => clearInterval(id);
  }, []);

  /* ─── Re-fetch logs when filter changes ─────────────────────────────── */
  useEffect(() => {
    fetchLogs(0, logAction, true);
  }, [logAction]);

  /* ─── Fetch helpers ──────────────────────────────────────────────────── */
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data);
    } catch { toast.error("Failed to load users"); }
  };

  const fetchPending = async () => {
    try {
      const res = await api.get("/api/admin/analysts/pending");
      setPending(res.data);
    } catch { toast.error("Failed to load pending requests"); }
  };

  const fetchHealth = async () => {
    setHealthChecking(true);
    try {
      const res = await api.get("/api/admin/health");
      setHealth(res.data);
    } catch (err) {
      setHealth({
        api: "lens",
        status: "DOWN",
        responseTimeMs: null,
        checkedAt: new Date().toISOString(),
        errorMessage: err?.response?.data?.message ?? "Could not reach backend",
      });
    } finally { setHealthChecking(false); }
  };

  const fetchLogs = async (page, action, reset = false) => {
    reset ? setLogsLoading(true) : setLoadingMore(true);
    try {
      const params = { page, size: 20 };
      if (action && action !== "ALL") params.action = action;

      const res = await api.get("/api/admin/logs", { params });
      const data = res.data;

      setLogs(prev => reset ? data.content : [...prev, ...data.content]);
      setLogTotal(data.totalElements);
      setLogPage(data.page);
      setLogTotalPages(data.totalPages);
    } catch { toast.error("Failed to load activity logs"); }
    finally { reset ? setLogsLoading(false) : setLoadingMore(false); }
  };

  /* ─── Actions ────────────────────────────────────────────────────────── */
  const approveAnalyst = async (id) => {
    try {
      await api.post(`/api/admin/analysts/${id}/approve`);
      toast.success("Analyst Approved 🚀");
      fetchPending(); fetchUsers();
      fetchLogs(0, logAction, true);
    } catch { toast.error("Approval failed"); }
  };

  const rejectAnalyst = async (id) => {
    try {
      await api.post(`/api/admin/analysts/${id}/reject`);
      toast.success("Analyst Rejected ❌");
      fetchPending(); fetchUsers();
      fetchLogs(0, logAction, true);
    } catch { toast.error("Reject failed"); }
  };

  const viewDocument = async (id) => {
    try {
      setLoadingDoc(id);

      const res = await api.get(
        `/api/admin/analysts/${id}/document`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url  = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch { toast.error("Failed to load document");
    } finally { setLoadingDoc(null); }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
     ${isActive
       ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
       : "text-gray-400 hover:bg-slate-800 hover:text-white hover:shadow-md hover:shadow-indigo-500/20"
     }`;

  /* ─── Health card helpers ─────────────────────────────────────────────── */
  const healthIsUp = health?.status === "UP";

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* ──────────────────────── SIDEBAR ──────────────────────── */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-5 fixed h-full">
        <h2 className="text-xl font-bold text-indigo-400 mb-8">Admin Panel</h2>
        <nav className="space-y-2">
          <NavLink to="/admin" className={linkStyle}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="#" className={linkStyle}>
            <UserCheck size={18} /> Approvals
          </NavLink>
          <NavLink to="#" className={linkStyle}>
            <Users size={18} /> Users
          </NavLink>
        </nav>
      </div>

      {/* ──────────────────────── MAIN ─────────────────────────── */}
      <div className="flex-1 ml-64">

        {/* Topbar */}
        <div className="bg-slate-900 border-b border-slate-800 px-10 py-5 flex justify-between items-center shadow-lg shadow-indigo-500/10">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">Admin Control Panel</h1>
            <p className="text-sm text-gray-400">Manage Analyst Approvals &amp; Users</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-red-500/20"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="px-10 py-10 space-y-12">

          {/* ═══════════════════ HEALTH CARD ════════════════════ */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-indigo-400 flex items-center gap-2">
              <Activity size={20} /> API Health
            </h2>

            <div className="bg-slate-800 rounded-2xl p-6 flex items-center justify-between
                            shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                {/* API name */}
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center
                                text-lg font-bold text-indigo-300 shadow-inner">
                  L
                </div>
                <div>
                  <p className="font-semibold text-white text-base">Lens.org</p>
                  <p className="text-xs text-gray-400 mt-0.5">Patent Search API</p>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex flex-col items-end gap-2">
                {healthChecking && !health ? (
                  <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Loader2 size={14} className="animate-spin" /> Checking…
                  </span>
                ) : health ? (
                  <>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                     ${healthIsUp
                                       ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                       : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                      {healthIsUp
                        ? <CheckCircle size={12} />
                        : <XCircle    size={12} />}
                      {health.status}
                    </span>

                    {health.responseTimeMs != null && (
                      <span className="text-xs text-gray-400">
                        {health.responseTimeMs} ms
                      </span>
                    )}

                    {!healthIsUp && health.errorMessage && (
                      <span className="text-xs text-red-400 max-w-xs text-right">
                        {health.errorMessage}
                      </span>
                    )}

                    <span className="text-xs text-gray-500">
                      Checked {formatDate(health.checkedAt)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">No data yet</span>
                )}

                {/* Manual refresh */}
                <button
                  onClick={fetchHealth}
                  disabled={healthChecking}
                  className="mt-1 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300
                             disabled:opacity-50 transition"
                >
                  <Loader2 size={11} className={healthChecking ? "animate-spin" : ""} />
                  {healthChecking ? "Checking…" : "Refresh"}
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════ PENDING ANALYSTS ═══════════════ */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-indigo-400">
              Pending Analyst Requests
            </h2>

            {pending.length === 0 ? (
              <div className="bg-slate-800 p-6 rounded-xl text-gray-400">
                No pending requests
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((a) => (
                  <div
                    key={a.id}
                    className="bg-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between
                               items-start md:items-center gap-6 transition-all duration-300
                               hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20"
                  >
                    <div>
                      <p className="text-lg font-semibold">{a.username}</p>
                      <p className="text-gray-400 text-sm">{a.email}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => viewDocument(a.id)}
                        disabled={loadingDoc === a.id}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm
                                   transition shadow hover:shadow-blue-500/30"
                      >
                        {loadingDoc === a.id ? "Loading…" : "View Document"}
                      </button>
                      <button
                        onClick={() => approveAnalyst(a.id)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm
                                   transition shadow hover:shadow-green-500/30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectAnalyst(a.id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm
                                   transition shadow hover:shadow-red-500/30"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════════ ALL USERS ══════════════════════ */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-indigo-400">
              All Registered Users
            </h2>
            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition">
              <table className="w-full text-sm">
                <thead className="bg-slate-700 text-gray-300">
                  <tr>
                    <th className="text-left px-6 py-3">Username</th>
                    <th className="text-left px-6 py-3">Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700 transition">
                      <td className="px-6 py-4">{u.username}</td>
                      <td className="px-6 py-4 text-gray-400">{u.roles?.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════════════ ACTIVITY LOGS ══════════════════ */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-2">
                <ScrollText size={20} /> Activity Logs
                <span className="ml-2 text-sm text-gray-400 font-normal">
                  ({logTotal.toLocaleString()} total)
                </span>
              </h2>

              {/* Action filter */}
              <select
                value={logAction}
                onChange={(e) => setLogAction(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-gray-200 text-sm
                           rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500
                           transition"
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
              {logsLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
                  <Loader2 size={20} className="animate-spin" /> Loading logs…
                </div>
              ) : logs.length === 0 ? (
                <div className="px-6 py-10 text-gray-400 text-center">No log entries found.</div>
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
                            <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
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
                            <td className="px-5 py-3 text-gray-400">
                              {entry.entityType && entry.entityId
                                ? `${entry.entityType} #${entry.entityId}`
                                : (entry.entityType ?? "—")}
                            </td>
                            <td className="px-5 py-3 text-gray-400 max-w-xs truncate">
                              {entry.details ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Load More */}
                  {logPage + 1 < logTotalPages && (
                    <div className="px-6 py-5 text-center border-t border-slate-700">
                      <button
                        onClick={() => fetchLogs(logPage + 1, logAction, false)}
                        disabled={loadingMore}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                                   rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/20"
                      >
                        {loadingMore
                          ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin"/>Loading…</span>
                          : `Load More (${logTotal - logs.length} remaining)`
                        }
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}