import { useState, useMemo } from "react";
import {
  getUser,
  getAllUsers,
  saveAllUsers,
  getRequests,
  removeRequest,
  logout,
} from "../utils/auth";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUser();
 
  if (!user || user.role !== "ADMIN") {
    return (

      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-red-500">
          Access Denied
        </h2>
      </div>
    );
  }

  const [users, setUsers] = useState(getAllUsers());
  const [requests, setRequests] = useState(getRequests());

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [requestSearch, setRequestSearch] = useState("");

  // =======================
  // 📊 STATISTICS
  // =======================

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      analysts: users.filter((u) => u.role === "ANALYST").length,
      normalUsers: users.filter((u) => u.role === "USER").length,
    };
  }, [users]);

  // =======================
  // FILTERED USERS
  // =======================

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase())
      )
      .filter((u) =>
        roleFilter === "ALL" ? true : u.role === roleFilter
      );
  }, [users, search, roleFilter]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) =>
      r.username.toLowerCase().includes(requestSearch.toLowerCase())
    );
  }, [requests, requestSearch]);

  // =======================
  // ACTIONS
  // =======================

  const updateUsers = (updated) => {
    saveAllUsers(updated);
    setUsers(updated);
  };

  const approveRequest = (username) => {
    const updated = users.map((u) =>
      u.username === username ? { ...u, role: "ANALYST" } : u
    );
    updateUsers(updated);
    removeRequest(username);
    setRequests(requests.filter((r) => r.username !== username));
    toast.success("User promoted to Analyst");
  };

  const revokeToUser = (username) => {
    const updated = users.map((u) =>
      u.username === username ? { ...u, role: "USER" } : u
    );
    updateUsers(updated);
    toast.info("Role changed to USER");
  };

  const deleteUser = (username) => {
    if (username === "admin") {
      toast.error("Cannot delete main admin");
      return;
    }
    const updated = users.filter((u) => u.username !== username);
    updateUsers(updated);
    toast.success("User deleted");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");

  };
 
  const revokeAccess = (username) => {
    const updatedUsers = users.map((u) =>
      u.username === username ? { ...u, role: "USER" } : u
    );
 
    saveAllUsers(updatedUsers);
    alert(`Access revoked for ${username}`);
    window.location.reload();
  };
 
  const filings = [
    { id: 1, type: "Patent", status: "Expiring" },
    { id: 2, type: "Trademark", status: "Active" },
    { id: 3, type: "Patent", status: "Expiring" },
  ];
 
  const auditLog = [
    "Feb 15 – ✅ User Shraddha promoted to Analyst",
    "Feb 14 – ❌ Access revoked for Rahul",
    "Feb 13 – 📌 Admin Sindhu approved 2 requests",
  ];
 
  const topUsers = [
    { name: "Shraddha", filings: 25 },
    { name: "Rahul", filings: 18 },
    { name: "Meera", filings: 15 },
  ];
 
  const feedback = [
    { from: "User A", message: "Add dark mode option" },
    { from: "Analyst B", message: "Export filings as Excel" },
  ];
 
  return (

    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Admins" value={stats.admins} />
        <StatCard label="Analysts" value={stats.analysts} />
        <StatCard label="Users" value={stats.normalUsers} />
      </div>

      {/* REQUEST SECTION */}
      <Section title="Analyst Requests">
        <input
          type="text"
          placeholder="Search request..."
          value={requestSearch}
          onChange={(e) => setRequestSearch(e.target.value)}
          className="p-2 border rounded-lg mb-6 w-full md:w-1/2"
        />

        {filteredRequests.map((r, i) => (
          <div
            key={i}
            className="flex justify-between bg-white p-4 mb-3 rounded shadow"
          >
            <span>{r.username}</span>
            <button
              onClick={() => approveRequest(r.username)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"

            >
              Approve
            </button>
          </div>
        ))}
      </Section>


      {/* USERS SECTION */}
      <Section title="All Users">

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded-lg"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="ANALYST">Analyst</option>
            <option value="USER">User</option>
          </select>
        </div>

        {filteredUsers.map((u, i) => (
          <div
            key={i}
            className="flex flex-col md:flex-row justify-between bg-white p-4 mb-4 rounded-xl shadow"
          >
            <div>
              <p className="font-semibold">{u.username}</p>
              <p className="text-sm text-gray-500">
                Role: {u.role}
              </p>
            </div>

            {u.username !== "admin" && (
              <div className="flex gap-3 mt-3 md:mt-0 flex-wrap">
                <button
                  onClick={() => revokeToUser(u.username)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Make User
                </button>

                <button
                  onClick={() => deleteUser(u.username)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}


const Section = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow mb-12">
    <h2 className="text-xl font-semibold mb-6">{title}</h2>
    {children}
  </div>
);

const StatCard = ({ label, value }) => (
 shivanand-frontend-setup
  <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow text-center">
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);
