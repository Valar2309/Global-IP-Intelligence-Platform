import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function AnalystDashboard() {

  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [inventor, setInventor] = useState("");
  const [assignee, setAssignee] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  const token = localStorage.getItem("accessToken");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/ip-assets",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssets(response.data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================= FILTER ================= */
  const filteredAssets = useMemo(() => {
    return assets.filter((a) =>
      (keyword === "" ||
        a.title?.toLowerCase().includes(keyword.toLowerCase())) &&
      (inventor === "" ||
        a.inventor?.toLowerCase().includes(inventor.toLowerCase())) &&
      (assignee === "" ||
        a.assignee?.toLowerCase().includes(assignee.toLowerCase())) &&
      (jurisdiction === "" ||
        a.jurisdiction === jurisdiction)
    );
  }, [assets, keyword, inventor, assignee, jurisdiction]);

  /* ================= CHART DATA ================= */
  const statusChartData = useMemo(() => {
    const counts = {};
    filteredAssets.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [filteredAssets]);

  const jurisdictionChartData = useMemo(() => {
    const counts = {};
    filteredAssets.forEach(a => {
      counts[a.jurisdiction] =
        (counts[a.jurisdiction] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [filteredAssets]);

  /* ================= DOWNLOAD REPORT ================= */
  const downloadReport = () => {

    if (filteredAssets.length === 0) {
      alert("No data available to export");
      return;
    }

    const headers = [
      "Title",
      "Inventor",
      "Assignee",
      "Status",
      "Jurisdiction",
      "Last Updated"
    ];

    const rows = filteredAssets.map(a =>
      [
        a.title,
        a.inventor,
        a.assignee,
        a.status,
        a.jurisdiction,
        a.lastUpdated
      ].join(",")
    );

    const csvContent = headers.join(",") + "\n" + rows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ip_analyst_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const getStatusColor = (status) => {
    if (status === "Granted") return "bg-green-600";
    if (status === "Pending") return "bg-yellow-500";
    if (status === "Filed") return "bg-indigo-600";
    return "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 md:px-12 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-indigo-400">
          Analyst Dashboard
        </h1>

        <div className="flex gap-4">
          <button
            onClick={downloadReport}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg shadow"
          >
            Download CSV
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg shadow"
          >
            Logout
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-slate-800 p-6 rounded-xl mb-10 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by Title"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="bg-slate-700 p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Inventor"
          value={inventor}
          onChange={(e) => setInventor(e.target.value)}
          className="bg-slate-700 p-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="bg-slate-700 p-2 rounded-lg"
        />
        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="bg-slate-700 p-2 rounded-lg"
        >
          <option value="">All Jurisdictions</option>
          <option value="IN">IN</option>
          <option value="US">US</option>
          <option value="EPO">EPO</option>
          <option value="WIPO">WIPO</option>
        </select>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="mb-4 text-indigo-400 font-semibold">
            Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="name" outerRadius={100} label>
                {statusChartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="mb-4 text-indigo-400 font-semibold">
            Jurisdiction Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jurisdictionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-slate-600 text-gray-400">
              <th className="text-left py-3 px-4 w-1/3">Title</th>
              <th className="text-left py-3 px-4 w-1/6">Inventor</th>
              <th className="text-left py-3 px-4 w-1/6">Assignee</th>
              <th className="text-left py-3 px-4 w-1/6">Status</th>
              <th className="text-left py-3 px-4 w-1/6">Jurisdiction</th>
            </tr>
          </thead>

          <tbody>
            {filteredAssets.map((asset) => (
              <tr
                key={asset.id}
                onClick={() =>
                  navigate(`/assets/${asset.id}`, { state: { from: "ANALYST" } })
                }
                className="border-b border-slate-700 hover:bg-slate-700 transition cursor-pointer"
              >
                <td className="py-3 px-4 text-indigo-400 hover:underline">
                  {asset.title}
                </td>
                <td className="py-3 px-4">{asset.inventor}</td>
                <td className="py-3 px-4">{asset.assignee}</td>
                <td className="py-3 px-4">
                  <span className={`${getStatusColor(asset.status)} px-2 py-1 rounded text-xs`}>
                    {asset.status}
                  </span>
                </td>
                <td className="py-3 px-4">{asset.jurisdiction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}