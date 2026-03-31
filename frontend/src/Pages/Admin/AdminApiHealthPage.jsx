import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { Activity, CheckCircle, XCircle, Loader2 } from "lucide-react";

// API Health Dashboard

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AdminApiHealthPage() {
  const [health,    setHealth]    = useState(null);
  const [checking,  setChecking]  = useState(false);

  const fetchHealth = async () => {
    setChecking(true);
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
    } finally {
      setChecking(false);
    }
  };

  // Initial fetch + auto-refresh every 60 s
  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 60_000);
    return () => clearInterval(id);
  }, []);

  const isUp = health?.status === "UP";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={22} className="text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">API Health</h2>
        </div>
        <button
          onClick={fetchHealth}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                     disabled:opacity-50 rounded-lg text-sm font-medium transition
                     shadow-lg shadow-indigo-500/20"
        >
          <Loader2 size={14} className={checking ? "animate-spin" : ""} />
          {checking ? "Checking…" : "Refresh Now"}
        </button>
      </div>

      {/* Card */}
      <div className="bg-slate-800 rounded-2xl p-8 shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">

        {/* Loading state (first load, no data yet) */}
        {checking && !health && (
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            <span>Pinging Lens.org…</span>
          </div>
        )}

        {health && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            {/* Left — API identity */}
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center
                              text-2xl font-extrabold text-indigo-300 shadow-inner select-none">
                L
              </div>
              <div>
                <p className="text-lg font-bold text-white">Lens.org</p>
                <p className="text-sm text-gray-400">Patent Search API</p>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-refreshes every 60 s · Last checked {formatDate(health.checkedAt)}
                </p>
              </div>
            </div>

            {/* Right — status */}
            <div className="flex flex-col items-end gap-3 min-w-[160px]">

              {/* UP / DOWN badge */}
              <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold
                               ${isUp
                                 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                 : "bg-red-500/20 text-red-300 border border-red-500/40"}`}>
                {isUp
                  ? <CheckCircle size={15} />
                  : <XCircle    size={15} />}
                {health.status}
              </span>

              {/* Response time */}
              {health.responseTimeMs != null && (
                <span className={`text-sm font-semibold
                                  ${health.responseTimeMs < 500 ? "text-emerald-400"
                                    : health.responseTimeMs < 1500 ? "text-amber-400"
                                    : "text-red-400"}`}>
                  {health.responseTimeMs} ms
                </span>
              )}

              {/* Error message when DOWN */}
              {!isUp && health.errorMessage && (
                <p className="text-xs text-red-400 text-right max-w-xs leading-relaxed">
                  {health.errorMessage}
                </p>
              )}

              {/* Subtle refreshing indicator */}
              {checking && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 size={11} className="animate-spin" /> updating…
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Explainer */}
      <p className="text-xs text-gray-500 leading-relaxed">
        Health is checked by sending a minimal 1-result patent search to
        <span className="text-indigo-400"> api.lens.org/patent/search</span> with a 3-second timeout.
        A 2xx response means <span className="text-emerald-400">UP</span>; any exception or timeout means
        <span className="text-red-400"> DOWN</span>.
      </p>
    </div>
  );
}