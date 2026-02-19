import {
  getUser,
  getAllUsers,
  saveAllUsers,
  getRequests,
  removeRequest,
} from "../utils/auth";
import { toast } from "react-toastify";
 
export default function AdminDashboard() {
  const user = getUser();
 
  if (!user || user.role !== "ADMIN") {
    return (
      <h2 className="text-center mt-20 text-2xl font-semibold text-indigo-600">
        Access Denied
      </h2>
    );
  }
 
  const users = getAllUsers();
  const requests = getRequests();
 
  const approveRequest = (username) => {
    const updatedUsers = users.map((u) =>
      u.username === username ? { ...u, role: "ANALYST" } : u
    );
 
    saveAllUsers(updatedUsers);
    removeRequest(username);
 
    toast.success("User promoted to ANALYST 🎉");
    setTimeout(() => window.location.reload(), 1000);
  };
 
  const revokeAccess = (username) => {
    const updatedUsers = users.map((u) =>
      u.username === username ? { ...u, role: "USER" } : u
    );
 
    saveAllUsers(updatedUsers);
 
    toast.error(`Access revoked for ${username}`);
    setTimeout(() => window.location.reload(), 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 sm:px-10 py-16">
      
      <div className="mb-14">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Admin Dashboard –{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {user.username}
          </span>{" "}
          🔑
        </h1>
      </div>

      {/* Rest of your styled sections remain SAME */}
      
    </div>
  );
}
