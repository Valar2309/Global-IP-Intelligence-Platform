import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function AnalystDashboardPage() {

  const [patents, setPatents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchPatents();
  }, []);

  const fetchPatents = async () => {

    try {

      const keyword =
        localStorage.getItem("lastSearch") || "artificial intelligence";

      // ✅ SAVE LAST 2 SEARCHES
      const history = JSON.parse(localStorage.getItem("history")) || [];
      const updatedHistory = [keyword, ...history.filter(h => h !== keyword)].slice(0,2);
      localStorage.setItem("history", JSON.stringify(updatedHistory));

      const response = await axios.get(
        "http://localhost:8081/api/search",
        {
          params: {
            q: keyword,
            type: "PATENT",
            page: 0,
            size: 30 // ✅ FIXED
          }
        }
      );

      setPatents(response.data.results || []);

    } catch (error) {

      console.error("Dashboard API Error:", error);

    } finally {

      setLoading(false);

    }

  };

  /* ================= DATA ================= */

  const totalPatents = patents.length;

  const active = patents.filter(p => p.patentStatus === "ACTIVE").length;
  const pending = patents.filter(p => p.patentStatus === "PENDING").length;
  const discontinued = patents.filter(p => p.patentStatus === "DISCONTINUED").length;

  const statusData = useMemo(() => {

    const counts = {};

    patents.forEach(p => {
      const status = p.patentStatus || "UNKNOWN";
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));

  }, [patents]);

  const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444"];

  const history = JSON.parse(localStorage.getItem("history")) || [];

  /* ================= UI ================= */

  if (loading) {
    return (
      <p className="text-gray-400 text-lg">
        Loading dashboard...
      </p>
    );
  }

  return (

    <div className="space-y-10 text-white">

      {/* TITLE */}
      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
        Patent Intelligence Dashboard
      </h2>

      {/* ✅ RECENT SEARCH */}
      <div className="flex gap-3">
        {history.map((h, i) => (
          <span
            key={i}
            className="
              px-3 py-1
              bg-indigo-500/20
              border border-indigo-500/30
              rounded-full
              text-sm
              hover:bg-indigo-500/30
              hover:shadow-indigo-500/30
              transition
            "
          >
            🔍 {h}
          </span>
        ))}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <KpiCard title="Total Patents" value={totalPatents} color="text-indigo-400"/>
        <KpiCard title="Active" value={active} color="text-green-400"/>
        <KpiCard title="Pending" value={pending} color="text-yellow-400"/>
        <KpiCard title="Discontinued" value={discontinued} color="text-red-400"/>

      </div>

      {/* CHART + RECORDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* CHART */}
        <div className="
          bg-slate-800
          border border-slate-700
          p-6 rounded-xl
          shadow-xl
          hover:shadow-indigo-500/30
          hover:-translate-y-1
          transition duration-300
        ">

          <h3 className="text-indigo-400 font-semibold mb-4">
            Patent Status Distribution
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

        </div>

        {/* ✅ 30 RECORDS LIST */}
        <div className="
          bg-slate-800
          border border-slate-700
          p-6 rounded-xl
          shadow-xl
          hover:shadow-indigo-500/30
          transition
        ">

          <h3 className="text-indigo-400 font-semibold mb-4">
            Patent Records (30)
          </h3>

          <div className="
            space-y-4
            max-h-[450px]
            overflow-y-auto
            scrollbar-hide
          ">

            {patents.map(p => (

              <div
                key={p.lensId}
                className="
                  bg-slate-900
                  p-4 rounded-lg
                  border border-slate-700
                  hover:border-indigo-500
                  hover:shadow-[0_10px_30px_rgba(99,102,241,0.3)]
                  hover:-translate-y-1
                  transition duration-300
                "
              >

                <p className="font-semibold text-white line-clamp-2">
                  {p.title}
                </p>

                <p className="text-sm text-gray-400">
                  {p.applicants?.[0]} • {p.jurisdiction}
                </p>

                <p className="text-xs text-gray-500">
                  {p.datePublished} • {p.patentStatus}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* HIDE SCROLLBAR */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>

  );
}


/* KPI CARD */

function KpiCard({ title, value, color }) {

  return (
    <div className="
      bg-slate-800
      border border-slate-700
      p-6 rounded-xl
      shadow-xl
      hover:-translate-y-1
      hover:shadow-indigo-500/30
      transition duration-300
    ">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
    </div>
  );

}

