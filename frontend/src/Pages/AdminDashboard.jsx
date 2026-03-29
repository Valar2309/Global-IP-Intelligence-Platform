import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { LayoutDashboard, Users, UserCheck, LogOut } from "lucide-react";

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

  /* ================= VIEW DOCUMENT ================= */
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

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
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

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
     ${
       isActive
         ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
         : "text-gray-400 hover:bg-slate-800 hover:text-white hover:shadow-md hover:shadow-indigo-500/20"
     }`;

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* ================= SIDEBAR ================= */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-5 fixed h-full">
        <h2 className="text-xl font-bold text-indigo-400 mb-8">
          Admin Panel
        </h2>

        <nav className="space-y-2">
          <NavLink to="/admin" className={linkStyle}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="#" className={linkStyle}>
            <UserCheck size={18} /> Approvals
          </NavLink>
          <NavLink to="#" className={linkStyle}>
            <Users size={18} /> Users
          </NavLink>
        </nav>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 ml-64">

        {/* ================= TOPBAR ================= */}
        <div className="bg-slate-900 border-b border-slate-800 px-10 py-5 flex justify-between items-center shadow-lg shadow-indigo-500/10">
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
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-red-500/20"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="px-10 py-10 space-y-12">

          {/* ================= PENDING ================= */}
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
                    className="bg-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/20"
                  >
                    <div>
                      <p className="text-lg font-semibold">{a.username}</p>
                      <p className="text-gray-400 text-sm">{a.email}</p>
                    </div>

                    <div className="flex gap-3 flex-wrap">

                      <button
                        onClick={() => viewDocument(a.id)}
                        disabled={loadingDoc === a.id}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition shadow hover:shadow-blue-500/30"
                      >
                        {loadingDoc === a.id ? "Loading..." : "View Document"}
                      </button>

                      <button
                        onClick={() => approveAnalyst(a.id)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition shadow hover:shadow-green-500/30"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => rejectAnalyst(a.id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition shadow hover:shadow-red-500/30"
                      >
                        Reject
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= USERS ================= */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-indigo-400">
              All Registered Users
            </h2>

            <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition">
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
                      <td className="px-6 py-4">{u.username}</td>
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
    </div>
  );
}