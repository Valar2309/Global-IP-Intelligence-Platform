import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis,
  Tooltip, Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function AnalystVisualizationPage() {

  const location = useLocation();
  const rawData = location.state?.results || [];

  const [tool, setTool] = useState("status");
  const [filteredData, setFilteredData] = useState(rawData);

  /* ================= ANALYTICS ================= */

  const analytics = useMemo(() => {

    const statusMap = {};
    const countryMap = {};
    const yearMap = {};

    filteredData.forEach(p => {

      const status = p.patentStatus || "UNKNOWN";
      statusMap[status] = (statusMap[status] || 0) + 1;

      const country = p.jurisdiction || "NA";
      countryMap[country] = (countryMap[country] || 0) + 1;

      if (p.datePublished) {
        const year = new Date(p.datePublished).getFullYear();
        yearMap[year] = (yearMap[year] || 0) + 1;
      }

    });

    return {
      status: Object.entries(statusMap).map(([k,v]) => ({ name:k, value:v })),
      country: Object.entries(countryMap).map(([k,v]) => ({ name:k, value:v })),
      trend: Object.keys(yearMap).sort().map(y => ({ year:y, filings:yearMap[y] }))
    };

  }, [filteredData]);

  const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444"];

  /* ================= FILTER ================= */

  const handleFilter = (key, value) => {
    const newData = rawData.filter(p => {
      if (key === "status") return p.patentStatus === value;
      if (key === "country") return p.jurisdiction === value;
      return true;
    });
    setFilteredData(newData);
  };

  /* ================= AI ================= */

  const aiInsight = useMemo(() => {

    if (!filteredData.length) return "No data available.";

    const topStatus = [...analytics.status].sort((a,b)=>b.value-a.value)[0];
    const topCountry = [...analytics.country].sort((a,b)=>b.value-a.value)[0];

    return `Most patents are ${topStatus?.name} and mainly from ${topCountry?.name}.`;

  }, [analytics, filteredData]);

  /* ================= UI ================= */

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#0b1a2b] via-[#0a1424] to-[#020617] p-6 text-white space-y-8">

      <h1 className="text-3xl font-bold text-indigo-400">
          Patent Visualilzation 
      </h1>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">

        <Stat title="Total" value={filteredData.length} />
        <Stat title="Active" value={count(filteredData,"ACTIVE")} color="text-green-400"/>
        <Stat title="Pending" value={count(filteredData,"PENDING")} color="text-yellow-400"/>
        <Stat title="Discontinued" value={count(filteredData,"DISCONTINUED")} color="text-red-400"/>

      </div>

      {/* MAIN */}
      <div className="grid md:grid-cols-4 gap-6">

        {/* LEFT PANEL */}
        <div className="
          bg-[#1e293b] p-5 rounded-xl border border-[#334155] space-y-4
          transition-all duration-300
          hover:shadow-[0_20px_60px_rgba(99,102,241,0.4)]
        ">

          <h3 className="text-indigo-400 font-semibold">Tools</h3>

          {/* TOOL BUTTONS */}
          <div className="grid grid-cols-2 gap-2">

            {[
              { key: "status", label: "📊 Status" },
              { key: "country", label: "🌍 Country" },
              { key: "trend", label: "📈 Trend" },
              { key: "statusBar", label: "📦 Status Bar" },
              { key: "countryPie", label: "🥧 Country Pie" },
              { key: "trendArea", label: "🔥 Area" },
            ].map((t) => (

              <button
                key={t.key}
                onClick={() => setTool(t.key)}
                className={`
                  p-2 rounded-lg text-sm transition-all duration-300
                  ${tool === t.key
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-[#0f172a] text-gray-400 hover:bg-indigo-500 hover:text-white hover:scale-105 hover:shadow-lg"}
                `}
              >
                {t.label}
              </button>

            ))}

          </div>

          {/* AI PANEL */}
          <div className="
            bg-[#0f172a] p-4 rounded-lg border border-indigo-500/30
            transition-all duration-300
            hover:shadow-[0_10px_40px_rgba(99,102,241,0.5)]
            hover:border-indigo-400
          ">
            <p className="text-indigo-400 text-sm">🤖 AI Insight</p>
            <p className="text-gray-300 text-sm mt-2">{aiInsight}</p>
          </div>

          <button
            onClick={()=>setFilteredData(rawData)}
            className="
              w-full bg-indigo-600 py-2 rounded
              transition-all duration-300
              hover:bg-indigo-500
              hover:scale-105
              hover:shadow-[0_10px_30px_rgba(99,102,241,0.6)]
            "
          >
            Reset Filter
          </button>

        </div>

        {/* RIGHT PANEL */}
        <div className="md:col-span-3">

          <div className="
            relative
            bg-gradient-to-br from-[#1e293b] to-[#172033]
            p-6 rounded-xl border border-[#334155]
            shadow-xl
            transition-all duration-500
            hover:-translate-y-3
            hover:scale-[1.02]
            hover:shadow-[0_30px_100px_rgba(99,102,241,0.7)]
            hover:border-indigo-400
            group
          ">

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-indigo-500/10 blur-xl rounded-xl"></div>

            <div className="relative z-10 transition-all duration-300 group-hover:scale-[1.01]">

              {/* STATUS PIE */}
              {tool === "status" && (
                <>
                  <h3 className="text-indigo-400 mb-2 font-semibold">Status Distribution</h3>
                  <div className="h-[1px] bg-white/10 mb-4"></div>

                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={analytics.status} dataKey="value"
                        onClick={(d)=>handleFilter("status", d.name)}
                      >
                        {analytics.status.map((_,i)=>(
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip/><Legend/>
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* COUNTRY BAR */}
              {tool === "country" && (
                <>
                  <h3 className="text-indigo-400 mb-2 font-semibold">Country Distribution</h3>
                  <div className="h-[1px] bg-white/10 mb-4"></div>

                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analytics.country}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="name"/>
                      <YAxis/>
                      <Tooltip/>
                      <Bar dataKey="value" fill="#6366f1"
                        onClick={(d)=>handleFilter("country", d.name)}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* TREND LINE */}
              {tool === "trend" && (
                <>
                  <h3 className="text-indigo-400 mb-2 font-semibold">Year Trend</h3>
                  <div className="h-[1px] bg-white/10 mb-4"></div>

                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={analytics.trend}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="year"/>
                      <YAxis/>
                      <Tooltip/>
                      <Line dataKey="filings" stroke="#10b981"/>
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* STATUS BAR */}
              {tool === "statusBar" && (
                <>
                  <h3 className="text-indigo-400 mb-2 font-semibold">Status Bar</h3>
                  <div className="h-[1px] bg-white/10 mb-4"></div>

                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={analytics.status}>
                      <XAxis dataKey="name"/>
                      <YAxis/>
                      <Tooltip/>
                      <Bar dataKey="value" fill="#f59e0b"/>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* COUNTRY PIE */}
              {tool === "countryPie" && (
                <>
                  <h3 className="text-indigo-400 mb-2 font-semibold">Country Pie</h3>
                  <div className="h-[1px] bg-white/10 mb-4"></div>

                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={analytics.country} dataKey="value">
                        {analytics.country.map((_,i)=>(
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip/><Legend/>
                    </PieChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* TREND AREA */}
              {tool === "trendArea" && (
                <>
                  <h3 className="text-indigo-400 mb-2 font-semibold">Trend Area</h3>
                  <div className="h-[1px] bg-white/10 mb-4"></div>

                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={analytics.trend}>
                      <XAxis dataKey="year"/>
                      <YAxis/>
                      <Tooltip/>
                      <Area dataKey="filings" stroke="#6366f1" fill="#6366f1"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* COMPONENTS */

function Stat({ title, value, color="text-indigo-400" }) {
  return (
    <div className="
      bg-[#1e293b] p-5 rounded-xl border border-[#334155]
      shadow-lg
      transition-all duration-300
      hover:-translate-y-2
      hover:scale-105
      hover:shadow-[0_20px_50px_rgba(99,102,241,0.6)]
      hover:border-indigo-400
      cursor-pointer
    ">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className={`text-2xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}

function count(data, status) {
  return data.filter(p => p.patentStatus === status).length;
}



