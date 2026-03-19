import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Shield,
  AlertCircle,
  Clock,
  Award,
  Search,
  Download,
  RefreshCw,
  Activity,
  Calendar,
  BarChart3,
  ExternalLink,
  X,
  CheckCircle,
  PieChart,
} from "lucide-react";

export default function AnalystStatusDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [patents, setPatents] = useState([]);
  const [page, setPage] = useState(0);

  /* ---------- STATUS MAPPING ---------- */
  const mapStatus = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Granted";
      case "PENDING":
        return "Application";
      case "DISCONTINUED":
        return "Expired";
      default:
        return "Application";
    }
  };

  /* ---------- FETCH GLOBAL DATA ---------- */
  const fetchPatents = async (reset = false) => {
    try {
      setIsLoading(true);

      const response = await axios.get("http://localhost:8081/api/search", {
        params: {
          q: searchTerm || "technology",
          type: "PATENT",
          page: reset ? 0 : page,
          size: 10,
        },
      });

      const newData = (response.data.results || []).map((p) => ({
        id: p.lensId,
        title: p.title,
        type: "Patent",
        stage: mapStatus(p.patentStatus),
        lifecycle: Math.floor(Math.random() * 100),
        renewal: "-",
        expiry: "-",
        jurisdiction: p.jurisdiction,
        assignee: p.applicants?.[0] || "N/A",
        priority: "medium",
        riskScore: Math.floor(Math.random() * 100),
        actions: ["view", "export"],
      }));

      if (reset) {
        setPatents(newData);
        setPage(1);
      } else {
        setPatents((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatents(true);
  }, []);

  /* ---------- STATS ---------- */
  const computeStats = useCallback(() => {
    const total = patents.length;
    const applications = patents.filter(
      (p) => p.stage === "Application"
    ).length;
    const granted = patents.filter((p) => p.stage === "Granted").length;
    const expired = patents.filter((p) => p.stage === "Expired").length;

    return [
      {
        label: "Total Assets",
        value: total,
        change: "+5%",
        trend: "up",
        icon: LayoutDashboard,
        filterKey: "all",
      },
      {
        label: "Applications",
        value: applications,
        change: "+2%",
        trend: "up",
        icon: FileText,
        filterKey: "Application",
      },
      {
        label: "Granted",
        value: granted,
        change: "+3%",
        trend: "up",
        icon: Award,
        filterKey: "Granted",
      },
      {
        label: "Expired",
        value: expired,
        change: "-1%",
        trend: "down",
        icon: AlertCircle,
        filterKey: "Expired",
      },
    ];
  }, [patents]);

  const stats = computeStats();

  const filteredPatents = patents.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStage === "all" || p.stage === filterStage)
  );

  /* ---------- EXPORT ---------- */
  const handleExportAsset = (asset) => {
    const doc = new jsPDF();
    doc.text("Patent Report", 14, 20);

    autoTable(doc, {
      startY: 30,
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
    <div className="min-h-screen bg-slate-950 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">
        Analyst Global Dashboard
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => setFilterStage(stat.filterKey)}
              className="bg-slate-900 p-5 rounded-lg cursor-pointer"
            >
              <Icon className="text-blue-400 mb-2" />
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search global patents..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          fetchPatents(true);
        }}
        className="w-full mb-6 px-4 py-2 bg-slate-800 text-white rounded"
      />

      {/* TABLE */}
      <div className="bg-slate-900 rounded-lg overflow-x-auto">
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
                <td className="px-4 py-3 text-white">{p.title}</td>
                <td className="px-4 py-3 text-blue-400">{p.id}</td>
                <td className="px-4 py-3">{p.stage}</td>
                <td className="px-4 py-3">{p.jurisdiction}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleExportAsset(p)}
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

      {/* LOAD MORE */}
      <div className="mt-6 text-center">
        <button
          onClick={() => fetchPatents()}
          className="bg-indigo-600 px-6 py-2 rounded text-white"
        >
          Load More
        </button>
      </div>
    </div>
  );
}
