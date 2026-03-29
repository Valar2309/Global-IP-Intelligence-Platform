import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  Tooltip, Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import html2canvas from "html2canvas";

export default function AnalystVisualizationPage() {

  const location = useLocation();

  const rawData = location.state?.results || [];
  const trendRaw = location.state?.trendData || {};
  const citationRaw = location.state?.citationData || {};
  const familyRaw = location.state?.familyData || {};

  const [tool, setTool] = useState("trend");
  const [view, setView] = useState("top");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [range, setRange] = useState("all");

  /* ================= TRANSFORM ================= */

  const trendData = useMemo(() =>
    Object.entries(trendRaw)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a,b)=>a.year-b.year)
  , [trendRaw]);

  const citationData = useMemo(() =>
    Object.entries(citationRaw).map(([id, arr]) => ({
      id,
      count: arr.length
    }))
  , [citationRaw]);

  const familyData = useMemo(() =>
    Object.entries(familyRaw).map(([id, arr]) => ({
      id,
      size: arr.length
    }))
  , [familyRaw]);

  /* ================= FILTER ================= */

  const filteredTrend = useMemo(() => {
    if (range === "all") return trendData;
    const currentYear = new Date().getFullYear();
    const limit = range === "5" ? 5 : 10;
    return trendData.filter(d => d.year >= currentYear - limit);
  }, [trendData, range]);

  const filteredFamily = familyData.filter(f =>
    f.id.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= DERIVED ================= */

  const topFamilies = [...filteredFamily].sort((a,b)=>b.size-a.size).slice(0,10);

  const growthData = trendData.map((d,i,arr)=>({
    year: d.year,
    growth: i === 0 ? 0 : d.count - arr[i-1].count
  }));

  const compareData = trendData.map((d,i)=>({
    year: d.year,
    current: d.count,
    previous: trendData[i-1]?.count || 0
  }));

  const familyDistribution = [
    { name:"Small (1)", value: familyData.filter(f=>f.size === 1).length },
    { name:"Medium (2-3)", value: familyData.filter(f=>f.size >=2 && f.size<=3).length },
    { name:"Large (4+)", value: familyData.filter(f=>f.size >=4).length }
  ];

  const totalFamilies = familyData.length;
  const avgFamilySize = totalFamilies
    ? (familyData.reduce((a,b)=>a+b.size,0) / totalFamilies).toFixed(1)
    : 0;

  const totalCitations = citationData.reduce((a,b)=>a+b.count,0);

  const topYear = [...trendData].sort((a,b)=>b.count-a.count)[0];

  const topTable = [...familyData].sort((a,b)=>b.size-a.size).slice(0,5);

  const smartInsight =
    `🚀 Peak in ${topYear?.year}. Total families: ${totalFamilies}. Growth observed.`;

  const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444"];

  /* ================= EXPORT ================= */

  const exportCSV = () => {
    const rows = familyData.map(f => `${f.id},${f.size}`).join("\n");
    const blob = new Blob(["ID,Size\n" + rows]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "families.csv";
    link.click();
  };

  const exportImage = () => {
    const chart = document.getElementById("chart");
    html2canvas(chart).then(canvas => {
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] p-8 text-white space-y-10">

      {/* HEADER */}
      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
        🚀 Ultimate Patent Dashboard
      </h1>

      {/* KPI */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Patents" value={rawData.length}/>
        <Card title="Families" value={totalFamilies}/>
        <Card title="Avg Size" value={avgFamilySize}/>
        <Card title="Citations" value={totalCitations}/>
      </div>

      {/* INSIGHT */}
      <div className="card hover-glow">
        {smartInsight}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3">
        {["trend","growth","family","distribution","compare","citation"].map(t=>(
          <button key={t} onClick={()=>setTool(t)} className={`btn ${tool===t?"active":""}`}>
            {t}
          </button>
        ))}
        <button onClick={exportCSV} className="btn green">CSV</button>
        {/* <button onClick={exportImage} className="btn purple">Image</button> */}
        <button onClick={()=>window.location.reload()} className="btn red">Refresh</button>
      </div>

      {/* SEARCH + RANGE */}
      <div className="flex flex-wrap gap-4">
        <input
          placeholder="🔍 Search patent..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="input"
        />

        {["5","10","all"].map(r=>(
          <button key={r} onClick={()=>setRange(r)} className={`btn ${range===r?"active":""}`}>
            {r==="all"?"All":`${r}Y`}
          </button>
        ))}
      </div>

      {/* CHART */}
      <div id="chart" className="card hover-lift">

        {tool === "trend" && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredTrend}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="year"/>
              <YAxis/>
              <Tooltip/>
              <Line dataKey="count" stroke="#10b981"/>
            </LineChart>
          </ResponsiveContainer>
        )}

        {tool === "growth" && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={growthData}>
              <XAxis dataKey="year"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="growth" fill="#22c55e"/>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tool === "family" && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={view==="top"?topFamilies:filteredFamily}>
              <XAxis dataKey="id"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="size" fill="#6366f1" onClick={(d)=>setSelected(d)}/>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tool === "distribution" && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={familyDistribution} dataKey="value">
                {familyDistribution.map((_,i)=>(
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ResponsiveContainer>
        )}

        {tool === "compare" && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={compareData}>
              <XAxis dataKey="year"/>
              <YAxis/>
              <Tooltip/><Legend/>
              <Bar dataKey="current" fill="#6366f1"/>
              <Bar dataKey="previous" fill="#10b981"/>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tool === "citation" && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={citationData}>
              <XAxis dataKey="id"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="count" fill="#f59e0b"/>
            </BarChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* TABLE */}
      <div className="card hover-lift">
        <h3 className="text-indigo-400 mb-3">Top Families</h3>
        <table className="w-full text-sm">
          <tbody>
            {topTable.map((f,i)=>(
              <tr key={i} className="border-t border-[#334155] hover:bg-[#0f172a] transition">
                <td>{f.id}</td>
                <td>{f.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRILL */}
      {selected && (
        <div className="card hover-glow">
          Selected: {selected.id} → {selected.size}
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
  /* 🌌 Background glow blobs */
  body::before, body::after {
    content: "";
    position: fixed;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99,102,241,0.4), transparent);
    filter: blur(120px);
    z-index: 0;
  }

  body::before {
    top: -100px;
    left: -100px;
  }

  body::after {
    bottom: -100px;
    right: -100px;
    background: radial-gradient(circle, rgba(168,85,247,0.4), transparent);
  }

  /* 🧊 Glass Card */
  .card {
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(20px);
    padding:22px;
    border-radius:20px;
    border:1px solid rgba(255,255,255,0.08);
    box-shadow: 
      0 10px 30px rgba(0,0,0,0.7),
      inset 0 1px 1px rgba(255,255,255,0.05);
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  /* 🌈 Animated border */
  .card::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius:20px;
    padding:1px;
    background: linear-gradient(120deg,#6366f1,#9333ea,#ec4899);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: 0.4s;
  }

  .card:hover::after {
    opacity: 1;
  }

  /* 🚀 Floating hover */
  .hover-lift:hover {
    transform: translateY(-10px) scale(1.04);
    box-shadow:
      0 30px 80px rgba(0,0,0,0.9),
      0 0 25px rgba(99,102,241,0.4);
  }

  /* 💡 Glow */
  .hover-glow:hover {
    box-shadow:
      0 0 20px rgba(99,102,241,0.6),
      0 0 40px rgba(139,92,246,0.6),
      0 0 60px rgba(168,85,247,0.5);
  }

  /* 📊 Chart effect */
  #chart {
    transition: all 0.4s ease;
  }

  #chart:hover {
    transform: scale(1.03);
    box-shadow: 0 30px 80px rgba(0,0,0,0.9);
  }

  /* 🎯 Buttons (Neon style) */
  .btn {
    padding:9px 16px;
    border-radius:12px;
    background: rgba(30,41,59,0.8);
    border:1px solid rgba(255,255,255,0.1);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .btn:hover {
    transform: translateY(-2px) scale(1.08);
    background: #6366f1;
    box-shadow:
      0 0 10px #6366f1,
      0 0 25px rgba(99,102,241,0.7);
  }

  .btn.active {
    background:#6366f1;
    box-shadow:0 0 15px #6366f1;
  }

  .btn.green:hover { background:#10b981; }
  .btn.purple:hover { background:#9333ea; }
  .btn.red:hover { background:#ef4444; }

  /* 🔍 Input premium */
  .input {
    background: rgba(15,23,42,0.8);
    padding:10px 14px;
    border-radius:12px;
    border:1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    transition: 0.3s;
  }

  .input:focus {
    outline:none;
    border-color:#6366f1;
    box-shadow:
      0 0 10px #6366f1,
      0 0 25px rgba(99,102,241,0.5);
  }

  /* 🌈 Animated heading */
  .animate-gradient {
    background-size:300%;
    animation: gradientMove 4s linear infinite;
  }

  @keyframes gradientMove {
    0% {background-position:0%}
    100% {background-position:100%}
  }

  /* 📊 Table */
  table tr {
    transition: all 0.3s ease;
  }

  table tr:hover {
    background: rgba(99,102,241,0.1);
    transform: scale(1.02);
  }
`}</style>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card hover-lift">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-xl font-bold text-indigo-400">{value}</h2>
    </div>
  );
}