import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminDashboard() {

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loadingDoc, setLoadingDoc] = useState(null);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchUsers();
    fetchPending();
  }, []);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8081/api/admin/users",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  /* ================= FETCH PENDING ================= */
  const fetchPending = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8081/api/admin/analysts/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPending(res.data);
    } catch {
      toast.error("Failed to load pending requests");
    }
  };

  /* ================= APPROVE ================= */
  const approveAnalyst = async (id) => {
    try {
      await axios.post(
        `http://localhost:8081/api/admin/analysts/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Analyst Approved 🚀");
      fetchPending();
      fetchUsers();
    } catch {
      toast.error("Approval failed");
    }
  };

  /* ================= REJECT ================= */
  const rejectAnalyst = async (id) => {
    try {
      await axios.post(
        `http://localhost:8081/api/admin/analysts/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Analyst Rejected ❌");
      fetchPending();
      fetchUsers();
    } catch {
      toast.error("Reject failed");
    }
  };

  /* ================= VIEW DOCUMENT (UNCHANGED LOGIC) ================= */
  const viewDocument = async (id) => {
    try {
      setLoadingDoc(id);

      const res = await axios.get(
        `http://localhost:8081/api/admin/analysts/${id}/document`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const contentType = res.headers["content-type"];

      const blob = new Blob([res.data], { type: contentType });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      window.URL.revokeObjectURL(url);

    } catch {
      toast.error("Failed to load document");
    } finally {
      setLoadingDoc(null);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-700 px-10 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">
            Admin Control Panel
          </h1>
          <p className="text-sm text-gray-400">
            Manage Analyst Approvals & Users
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
        >
          Logout
        </button>
      </div>

      <div className="px-10 py-10 space-y-12">

        {/* ================= PENDING REQUESTS ================= */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-indigo-400">
            Pending Analyst Requests
          </h2>

          {pending.length === 0 ? (
            <div className="bg-slate-800 p-6 rounded-xl text-gray-400">
              No pending requests
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow hover:shadow-xl transition"
                >
                  <div>
                    <p className="text-lg font-semibold">
                      {a.username}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {a.email}
                    </p>
                  </div>

                  <div className="flex gap-3 flex-wrap">

                    <button
                      onClick={() => viewDocument(a.id)}
                      disabled={loadingDoc === a.id}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                    >
                      {loadingDoc === a.id ? "Loading..." : "View Document"}
                    </button>

                    <button
                      onClick={() => approveAnalyst(a.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectAnalyst(a.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                    >
                      Reject
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= USERS TABLE ================= */}
        <div>
          <h2 className="text-xl font-semibold mb-6 text-indigo-400">
            All Registered Users
          </h2>

          <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 text-gray-300">
                <tr>
                  <th className="text-left px-6 py-3">Username</th>
                  <th className="text-left px-6 py-3">Roles</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-700 hover:bg-slate-700 transition"
                  >
                    <td className="px-6 py-4">
                      {u.username}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {u.roles?.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}