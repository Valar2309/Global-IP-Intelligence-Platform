import { useState } from "react";
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
} from "lucide-react";

export default function UserSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const stats = [
    {
      label: "Total Assets",
      value: 10,
      change: "+12%",
      color: "text-indigo-400",
      trend: "up",
      icon: LayoutDashboard,
    },
    {
      label: "Applications",
      value: 4,
      change: "+2%",
      color: "text-blue-400",
      trend: "up",
      icon: FileText,
    },
    {
      label: "Granted",
      value: 3,
      change: "+1%",
      color: "text-emerald-400",
      trend: "up",
      icon: Award,
    },
    {
      label: "Renewal Due",
      value: 2,
      change: "0%",
      color: "text-amber-400",
      trend: "flat",
      icon: Calendar,
    },
    {
      label: "Expired",
      value: 1,
      change: "-1%",
      color: "text-red-400",
      trend: "down",
      icon: AlertCircle,
    },
  ];

  const patents = [
    {
      id: "US2025123456",
      title: "AI-based Medical Imaging System",
      type: "Patent",
      stage: "Granted",
      lifecycle: 55,
      renewal: "2026-03-15",
      expiry: "2042-05-10",
      jurisdiction: "USPTO",
      assignee: "MedTech AI Corp",
      priority: "high",
      riskScore: 92,
      actions: ["view", "export"],
    },
    {
      id: "WO202601234",
      title: "Smart Agriculture Irrigation Device",
      type: "Patent",
      stage: "Application",
      lifecycle: 20,
      renewal: "-",
      expiry: "-",
      jurisdiction: "WIPO",
      assignee: "AgriTech Solutions",
      priority: "medium",
      riskScore: 67,
      actions: ["track"],
    },
    {
      id: "EP202590221",
      title: "Quantum Encryption Processor",
      type: "Trademark",
      stage: "Renewal Due",
      lifecycle: 78,
      renewal: "2027-03-10",
      expiry: "2031-11-02",
      jurisdiction: "EPO",
      assignee: "QuantumSec Ltd",
      priority: "critical",
      riskScore: 45,
      actions: ["renew", "view"],
    },
  ];

  const filteredPatents = patents.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStage === "all" || p.stage === filterStage) &&
      (filterType === "all" || p.type === filterType)
  );

  const getStageColor = (stage) => {
    const colors = {
      Granted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Application: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Renewal Due": "bg-amber-500/20 text-amber-400 border-amber-500/30",
      Expired: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[stage] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "high":
        return <Shield className="w-4 h-4 text-amber-400" />;
      case "medium":
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleExport = () => {
    setIsLoading(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("IP Portfolio Report", 14, 20);

        doc.setFontSize(11);
        doc.text(`Total Assets: ${patents.length}`, 14, 30);
        doc.text(
          `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          14,
          36
        );

        const tableData = patents.map((p) => [
          p.title,
          p.id,
          p.type,
          p.stage,
          p.jurisdiction,
          p.assignee,
          p.lifecycle + "%",
          p.riskScore,
          p.renewal === "-" ? "N/A" : p.renewal,
          p.expiry === "-" ? "N/A" : p.expiry,
        ]);

        autoTable(doc, {
          startY: 45,
          head: [
            [
              "Title",
              "ID",
              "Type",
              "Stage",
              "Jurisdiction",
              "Assignee",
              "Progress",
              "Risk",
              "Renewal",
              "Expiry",
            ],
          ],
          body: tableData,
        });

        doc.save("IP_Portfolio_Report.pdf");

        setSuccessMessage("Report downloaded successfully!");
      } catch (error) {
        setSuccessMessage("Export failed. Please try again.");
      }

      setIsLoading(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    }, 800);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Data refreshed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1500);
  };

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const handleRenewal = (asset) => {
    setSuccessMessage(
      `Renewal initiated for ${asset.title}. You will receive further instructions.`
    );
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleExportAsset = (asset) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("IP Asset Report", 14, 20);

      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      const assetData = [
        ["Title", asset.title],
        ["Patent ID", asset.id],
        ["Type", asset.type],
        ["Stage", asset.stage],
        ["Jurisdiction", asset.jurisdiction],
        ["Assignee", asset.assignee],
        ["Lifecycle Progress", `${asset.lifecycle}%`],
        ["Risk Score", asset.riskScore],
        ["Renewal Date", asset.renewal === "-" ? "N/A" : asset.renewal],
        ["Expiry Date", asset.expiry === "-" ? "N/A" : asset.expiry],
      ];

      autoTable(doc, {
        startY: 40,
        head: [["Field", "Value"]],
        body: assetData,
      });

      doc.save(`${asset.id}_Asset_Report.pdf`);

      setSuccessMessage(`Downloaded ${asset.title} report`);
    } catch (error) {
      setSuccessMessage("Export failed. Please try again.");
    }

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8">
      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/50 px-5 py-3 rounded-lg backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-top">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium text-emerald-200">
            {successMessage}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              IP Portfolio Management
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Track and manage {patents.length} IP assets across{" "}
              {new Set(patents.map((p) => p.jurisdiction)).size} jurisdictions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              <Download
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Export Report
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/15 rounded-lg border border-white/15 hover:border-blue-500/30 transition-all duration-300 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/50 border border-white/10 rounded-lg p-5 hover:border-blue-500/30 hover:bg-slate-900/70 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30 group-hover:bg-blue-500/25 transition-all">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                      stat.trend === "up"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : stat.trend === "down"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {getTrendIcon(stat.trend)}
                    {stat.change}
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-medium mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, patent number, or assignee..."
                className="w-full bg-slate-800/50 border border-white/20 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="all">All Stages</option>
              <option value="Granted">Granted</option>
              <option value="Application">Application</option>
              <option value="Renewal Due">Renewal Due</option>
              <option value="Expired">Expired</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800/50 border border-white/20 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="all">All Types</option>
              <option value="Patent">Patent</option>
              <option value="Trademark">Trademark</option>
            </select>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-slate-900/50 border border-white/10 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-slate-950/50">
            <h3 className="text-lg font-semibold text-white flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              IP Assets ({filteredPatents.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-950/40 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Renewal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPatents.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-800/40 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border ${
                            p.priority === "critical"
                              ? "bg-red-500/15 border-red-500/30"
                              : p.priority === "high"
                              ? "bg-amber-500/15 border-amber-500/30"
                              : "bg-blue-500/15 border-blue-500/30"
                          }`}
                        >
                          {getPriorityIcon(p.priority)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => handleViewAsset(p)}
                            className="font-medium text-white text-sm hover:text-blue-400 transition-colors truncate"
                          >
                            {p.title}
                          </button>
                          <div className="text-xs text-gray-500 truncate">
                            {p.assignee}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="bg-slate-800/50 px-3 py-1.5 rounded border border-white/10 text-xs text-blue-400">
                        {p.id}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          p.type === "Patent"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 text-xs font-semibold rounded border ${getStageColor(
                          p.stage
                        )}`}
                      >
                        {p.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-2 bg-slate-800/70 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${p.lifecycle}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {p.lifecycle}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {p.renewal === "-" ? "N/A" : p.renewal}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          p.riskScore > 80
                            ? "bg-emerald-500/20 text-emerald-400"
                            : p.riskScore > 50
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {p.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.actions.includes("view") && (
                          <button
                            onClick={() => handleViewAsset(p)}
                            title="View Details"
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg border border-white/10 hover:border-blue-500/30 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        {p.actions.includes("renew") && (
                          <button
                            onClick={() => handleRenewal(p)}
                            title="Renew Asset"
                            className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg border border-white/10 hover:border-amber-500/30 transition-all"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                        {p.actions.includes("export") && (
                          <button
                            onClick={() => handleExportAsset(p)}
                            title="Export"
                            className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-white/10 hover:border-emerald-500/30 transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPatents.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  No IP assets found matching your criteria
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ALERTS SECTION */}
        {filteredPatents.some(
          (p) => p.stage === "Renewal Due" || p.stage === "Expired"
        ) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex items-start gap-4 flex-shrink-0">
                <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-200">
                    Action Required
                  </h3>
                  <p className="text-red-300/80 text-sm mt-1">
                    Review renewals and expirations
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <div className="text-sm text-red-300/80 mb-1">
                    Renewals Due
                  </div>
                  <div className="text-2xl font-bold text-red-300">
                    {
                      filteredPatents.filter((p) => p.stage === "Renewal Due")
                        .length
                    }
                  </div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <div className="text-sm text-red-300/80 mb-1">Expired</div>
                  <div className="text-2xl font-bold text-red-300">
                    {
                      filteredPatents.filter((p) => p.stage === "Expired")
                        .length
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Asset Details</h2>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Asset Title</p>
                  <p className="text-white font-semibold">
                    {selectedAsset.title}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Patent ID</p>
                  <p className="text-blue-400 font-mono">{selectedAsset.id}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Type</p>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold inline-block ${
                      selectedAsset.type === "Patent"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {selectedAsset.type}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Stage</p>
                  <span
                    className={`px-3 py-1 rounded text-sm font-semibold inline-block border ${getStageColor(
                      selectedAsset.stage
                    )}`}
                  >
                    {selectedAsset.stage}
                  </span>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Assignee</p>
                  <p className="text-white">{selectedAsset.assignee}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Jurisdiction</p>
                  <p className="text-white font-mono">
                    {selectedAsset.jurisdiction}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">
                    Lifecycle Progress
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-slate-800/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${selectedAsset.lifecycle}%` }}
                      />
                    </div>
                    <span className="text-white font-semibold">
                      {selectedAsset.lifecycle}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Risk Score</p>
                  <span
                    className={`px-3 py-1 rounded text-sm font-bold inline-block ${
                      selectedAsset.riskScore > 80
                        ? "bg-emerald-500/20 text-emerald-400"
                        : selectedAsset.riskScore > 50
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {selectedAsset.riskScore}
                  </span>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-1">Renewal Date</p>
                  <p className="text-white font-mono">
                    {selectedAsset.renewal === "-"
                      ? "N/A"
                      : selectedAsset.renewal}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Expiry Date</p>
                  <p className="text-white font-mono">
                    {selectedAsset.expiry === "-"
                      ? "N/A"
                      : selectedAsset.expiry}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex gap-3">
                  {selectedAsset.actions.includes("renew") && (
                    <button
                      onClick={() => {
                        handleRenewal(selectedAsset);
                        setSelectedAsset(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Initiate Renewal
                    </button>
                  )}
                  {selectedAsset.actions.includes("export") && (
                    <button
                      onClick={() => {
                        handleExportAsset(selectedAsset);
                        setSelectedAsset(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Export Details
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
