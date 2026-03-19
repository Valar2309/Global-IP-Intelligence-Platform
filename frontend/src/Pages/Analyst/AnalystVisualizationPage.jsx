
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  Tooltip, Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function AnalystVisualizationPage() {

  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "artificial intelligence";

  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
  }, [query]);

  const fetchAssets = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8081/api/search",
        {
          params: {
            q: query,
            type: "PATENT",
            page: 0,
            size: 100
          }
        }
      );

      setAssets(response.data.results || []);

    } catch (error) {

      console.error(error);

    }

  };

  /* KPI */

  const total = assets.length;

  const active = assets.filter(a => a.patentStatus === "ACTIVE").length;
  const pending = assets.filter(a => a.patentStatus === "PENDING").length;
  const discontinued = assets.filter(a => a.patentStatus === "DISCONTINUED").length;

  /* STATUS PIE */

  const statusData = useMemo(() => {

    const counts = {};

    assets.forEach(a => {

      const s = a.patentStatus || "UNKNOWN";

      counts[s] = (counts[s] || 0) + 1;

    });

    return Object.keys(counts).map(k => ({
      name: k,
      value: counts[k]
    }));

  }, [assets]);

  /* JURISDICTION */

  const jurisdictionData = useMemo(() => {

    const counts = {};

    assets.forEach(a => {

      const j = a.jurisdiction || "UNKNOWN";

      counts[j] = (counts[j] || 0) + 1;

    });

    return Object.keys(counts).map(k => ({
      name: k,
      value: counts[k]
    }));

  }, [assets]);

  /* YEAR TREND */

  const trendData = useMemo(() => {

    const counts = {};

    assets.forEach(a => {

      if (!a.datePublished) return;

      const year = new Date(a.datePublished).getFullYear();

      counts[year] = (counts[year] || 0) + 1;

    });

    return Object.keys(counts)
      .sort()
      .map(y => ({
        year: y,
        filings: counts[y]
      }));

  }, [assets]);

  /* TOP APPLICANTS */

  const applicantData = useMemo(() => {

    const counts = {};

    assets.forEach(a => {

      const app = a.applicants?.[0];

      if (!app) return;

      counts[app] = (counts[app] || 0) + 1;

    });

    return Object.keys(counts)
      .map(k => ({
        name: k,
        value: counts[k]
      }))
      .sort((a,b)=>b.value-a.value)
      .slice(0,5);

  }, [assets]);

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#22d3ee"
  ];

  return (

    <div className="space-y-10 text-white">

      <h2
        className="
        text-3xl
        font-extrabold
        bg-gradient-to-r
        from-indigo-400
        to-purple-500
        bg-clip-text
        text-transparent
        "
      >
        Patent Analytics Dashboard — {query}
      </h2>

      {/* KPI */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Kpi title="Total Patents" value={total} />
        <Kpi title="Active" value={active} />
        <Kpi title="Pending" value={pending} />
        <Kpi title="Discontinued" value={discontinued} />

      </div>

      {/* CHART GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <ChartCard title="Patent Status Distribution">

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={statusData}
                dataKey="value"
                outerRadius={100}
                label
              >

                {statusData.map((entry,index)=>(
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}

              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </ChartCard>


        <ChartCard title="Jurisdiction Distribution">

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={jurisdictionData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />
              <YAxis />

              <Tooltip />

              <Bar dataKey="value" fill="#6366f1" />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>


        <ChartCard title="Patent Publication Trend">

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={trendData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="year" />
              <YAxis />

              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="filings"
                stroke="#10b981"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </ChartCard>


        <ChartCard title="Top Applicants">

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={applicantData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />
              <YAxis />

              <Tooltip />

              <Bar dataKey="value" fill="#f59e0b" />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>

      </div>

    </div>

  );

}

/* KPI CARD */

function Kpi({ title, value }) {

  return (

    <div className="
      bg-slate-800
      border border-slate-700
      p-6
      rounded-xl
      shadow-xl
      hover:-translate-y-1
      hover:shadow-indigo-500/20
      transition
    ">

      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-indigo-400">
        {value}
      </h3>

    </div>

  );

}

/* CHART CARD */

function ChartCard({ title, children }) {

  return (

    <div className="
      bg-slate-800
      border border-slate-700
      p-6
      rounded-xl
      shadow-xl
      hover:shadow-indigo-500/20
      transition
    ">

      <h3 className="mb-4 text-indigo-400 font-semibold">
        {title}
      </h3>

      {children}

    </div>

  );

}

