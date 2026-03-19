import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LayoutDashboard, FileText, AlertCircle, Award } from "lucide-react";

export default function AnalystStatusDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filterStage, setFilterStage] = useState("all");
  const [filterJurisdiction, setFilterJurisdiction] = useState("all");

  const [isLoading, setIsLoading] = useState(false);
  const [patents, setPatents] = useState([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  /* ---------- DEBOUNCE SEARCH ---------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ---------- STATUS MAP ---------- */
  const mapStatus = (status) => {
    if (status === "ACTIVE") return "Granted";
    if (status === "PENDING") return "Application";
    if (status === "DISCONTINUED") return "Expired";
    return "Application";
  };

  /* ---------- FETCH ---------- */
  const fetchPatents = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get("http://localhost:8081/api/search", {
        params: {
          q: debouncedSearch || "technology",
          type: "PATENT",
          page: page,
          size: 10,
        },
      });

      const results = response.data.results || [];

      setPatents(
        results.map((p) => ({
          id: p.lensId,
          title: p.title,
          stage: mapStatus(p.patentStatus),
          jurisdiction: p.jurisdiction,
        }))
      );

      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatents();
  }, [debouncedSearch, page]);

  /* ---------- FILTERED ---------- */
  const filteredPatents = patents.filter(
    (p) =>
      (filterStage === "all" || p.stage === filterStage) &&
      (filterJurisdiction === "all" || p.jurisdiction === filterJurisdiction)
  );

  /* ---------- STATS ---------- */
  const stats = [
    {
      label: "Total",
      value: patents.length,
      icon: LayoutDashboard,
      key: "all",
    },
    {
      label: "Applications",
      value: patents.filter((p) => p.stage === "Application").length,
      icon: FileText,
      key: "Application",
    },
    {
      label: "Granted",
      value: patents.filter((p) => p.stage === "Granted").length,
      icon: Award,
      key: "Granted",
    },
    {
      label: "Expired",
      value: patents.filter((p) => p.stage === "Expired").length,
      icon: AlertCircle,
      key: "Expired",
    },
  ];

  /* ---------- EXPORT ---------- */
  const handleExport = (asset) => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: [
        ["Title", asset.title],
        ["ID", asset.id],
        ["Stage", asset.stage],
        ["Jurisdiction", asset.jurisdiction],
      ],
    });

    doc.save(`${asset.id}.pdf`);
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Analyst Global Dashboard</h1>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              onClick={() => setFilterStage(s.key)}
              className="bg-slate-900 p-5 rounded-lg cursor-pointer"
            >
              <Icon className="text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patents..."
          className="flex-1 px-4 py-2 bg-slate-800 rounded"
        />

        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="px-4 py-2 bg-slate-800 rounded"
        >
          <option value="all">All Stages</option>
          <option value="Application">Application</option>
          <option value="Granted">Granted</option>
          <option value="Expired">Expired</option>
        </select>

        <select
          value={filterJurisdiction}
          onChange={(e) => setFilterJurisdiction(e.target.value)}
          className="px-4 py-2 bg-slate-800 rounded"
        >
          <option value="all">All Jurisdictions</option>
          <option value="US">US</option>
          <option value="EP">EP</option>
          <option value="IN">IN</option>
          <option value="CN">CN</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-gray-300">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Jurisdiction</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredPatents.map((p, i) => (
              <tr key={i} className="border-b border-slate-700">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3 text-blue-400">{p.id}</td>
                <td className="px-4 py-3">{p.stage}</td>
                <td className="px-4 py-3">{p.jurisdiction}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleExport(p)}
                    className="text-green-400"
                  >
                    Export
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-slate-800 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2">
          Page {page + 1} / {totalPages}
        </span>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-slate-800 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
