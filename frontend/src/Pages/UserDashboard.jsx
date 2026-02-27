import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserDashboard() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [inventor, setInventor] = useState("");
  const [assignee, setAssignee] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [status, setStatus] = useState("");

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!token || role !== "USER") {
      navigate("/login");
      return;
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8081/api/user/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch {
      localStorage.clear();
      navigate("/login");
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================= SEARCH ================= */
  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(
        "http://localhost:8081/api/ip-assets",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssets(res.data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setKeyword("");
    setInventor("");
    setAssignee("");
    setJurisdiction("");
    setStatus("");
    setAssets([]);
    setSearched(false);
  };

  /* ================= FILTER ================= */
  const filteredAssets = useMemo(() => {
    return assets.filter(a =>
      (keyword === "" || a.title?.toLowerCase().includes(keyword.toLowerCase())) &&
      (inventor === "" || a.inventor?.toLowerCase().includes(inventor.toLowerCase())) &&
      (assignee === "" || a.assignee?.toLowerCase().includes(assignee.toLowerCase())) &&
      (jurisdiction === "" || a.jurisdiction === jurisdiction) &&
      (status === "" || a.status === status)
    );
  }, [assets, keyword, inventor, assignee, jurisdiction, status]);

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 md:px-10 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-indigo-400">
          Welcome, {user.username}
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg shadow"
        >
          Logout
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-slate-800 p-6 rounded-2xl mb-8 shadow-xl">
        <h3 className="text-lg font-semibold text-indigo-400 mb-4">
          Search IP Assets
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          <input
            type="text"
            placeholder="Keyword"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          />

          <input
            type="text"
            placeholder="Inventor"
            value={inventor}
            onChange={e => setInventor(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          />

          <input
            type="text"
            placeholder="Assignee"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          />

          <select
            value={jurisdiction}
            onChange={e => setJurisdiction(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          >
            <option value="">All Countries</option>
            <option value="US">US</option>
            <option value="IN">IN</option>
          </select>

          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          >
            <option value="">All Status</option>
            <option value="Filed">Filed</option>
          </select>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSearch}
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700"
          >
            Search
          </button>

          <button
            onClick={clearFilters}
            className="border border-gray-500 px-6 py-2 rounded hover:bg-slate-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {loading && <p className="text-gray-400">Searching...</p>}

      {!searched && (
        <p className="text-gray-500 text-center">
          Use filters and click Search to view results.
        </p>
      )}

      {searched && !loading && filteredAssets.length === 0 && (
        <p className="text-gray-400 text-center">
          No matching assets found.
        </p>
      )}

      {/* CARD VIEW */}
      {filteredAssets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition"
            >
              <h3 className="text-indigo-400 font-semibold text-lg mb-2">
                {asset.title}
              </h3>

              <p className="text-sm text-gray-400 mb-1">
                Inventor: {asset.inventor}
              </p>
              <p className="text-sm text-gray-400 mb-1">
                Assignee: {asset.assignee}
              </p>
              <p className="text-sm text-gray-400 mb-1">
                Status: {asset.status}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Jurisdiction: {asset.jurisdiction}
              </p>

              <button
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}