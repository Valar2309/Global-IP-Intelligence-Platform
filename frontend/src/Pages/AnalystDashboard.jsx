import { useState, useMemo } from "react";
import { getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function AnalystDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  // ===============================
  // 🔹 HOOKS (Always at top)
  // ===============================

  const [filings] = useState([
    { id: 1, type: "Patent", status: "Active", country: "US" },
    { id: 2, type: "Trademark", status: "Pending", country: "India" },
    { id: 3, type: "Patent", status: "Expired", country: "Germany" },
    { id: 4, type: "Design", status: "Active", country: "Japan" },
  ]);

  const [search, setSearch] = useState("");

  const filteredFilings = useMemo(() => {
    return filings.filter(
      (f) =>
        f.type.toLowerCase().includes(search.toLowerCase()) ||
        f.country.toLowerCase().includes(search.toLowerCase())
    );
  }, [filings, search]);

  const stats = {
    total: filings.length,
    active: filings.filter((f) => f.status === "Active").length,
    pending: filings.filter((f) => f.status === "Pending").length,
    expired: filings.filter((f) => f.status === "Expired").length,
  };

  // ===============================
  // 🚫 ACCESS CONTROL (After hooks)
  // ===============================

  if (!user || user.role !== "ANALYST") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-red-500">
          Access Denied
        </h2>
      </div>
    );
  }

  // ===============================
  // 📦 EXPORT FUNCTION
  // ===============================

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify(filings, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filings.json";
    a.click();
  };

  // ===============================
  // 🖥️ UI
  // ===============================

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-10 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Analyst Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user.username}. You have advanced IP analysis access.
          </p>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
        >
          View Profile
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Filings" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Expired" value={stats.expired} />
      </div>

      {/* SEARCH + EXPORT */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by type or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 border rounded-xl shadow-sm"
        />

        <button
          onClick={exportData}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
        >
          Export Data
        </button>
      </div>

      {/* FILINGS TABLE */}
      <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-6">
          IP Filings
        </h2>

        <table className="min-w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3">Type</th>
              <th className="py-3">Status</th>
              <th className="py-3">Country</th>
            </tr>
          </thead>
          <tbody>
            {filteredFilings.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-50 transition">
                <td className="py-3">{f.type}</td>
                <td className="py-3">
                  <StatusBadge status={f.status} />
                </td>
                <td className="py-3">{f.country}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFilings.length === 0 && (
          <p className="text-gray-500 mt-4">
            No matching filings found.
          </p>
        )}
      </div>

      {/* NOTIFICATIONS */}
      <div className="mt-12 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Notifications
        </h2>
        <ul className="space-y-2 text-gray-600">
          <li>📌 2 patents expiring this month</li>
          <li>📊 5 new trademark filings added</li>
          <li>🔔 Weekly analytics report ready</li>
        </ul>
      </div>
    </div>
  );
}

/* COMPONENTS */

const StatCard = ({ label, value }) => (
  <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow text-center">
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const color =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${color}`}>
      {status}
    </span>
  );
};