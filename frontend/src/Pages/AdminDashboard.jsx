import {
  getUser,
  getAllUsers,
  saveAllUsers,
  getRequests,
  removeRequest,
} from "../utils/auth";
 
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
 
    alert("User promoted to ANALYST");
    window.location.reload();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 sm:px-10 py-16">
      
      {/* Header */}
      <div className="mb-14">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Admin Dashboard –{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {user.username}
          </span>{" "}
          🔑
        </h1>
        <p className="text-slate-500 mt-3">
          Monitor users, manage permissions, and oversee system insights.
        </p>
      </div>
 
      {/* System Overview */}
      <Section title="System Overview">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-700">
          <StatCard label="Total Users" value={users.length} />
          <StatCard label="Pending Requests" value={requests.length} />
        </div>
      </Section>
 
      {/* Role Requests */}
      <Section title="Role Requests">
        {requests.length === 0 && (
          <p className="text-slate-500">No pending requests</p>
        )}
 
        {requests.map((r, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 mb-4 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-all duration-300"
          >
            <span className="text-slate-700 font-medium">
              {r.username} wants ANALYST access
            </span>
            <button
              onClick={() => approveRequest(r.username)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Approve
            </button>
          </div>
        ))}
      </Section>
 
      {/* Credential Control */}
      <Section title="Credential Control">
        <ul className="space-y-4">
          {users.map((u, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-slate-700 font-medium">
                {u.username} – Role: {u.role}
              </span>
              {u.role !== "USER" && (
                <button
                  onClick={() => revokeAccess(u.username)}
                  className="px-4 py-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-md transition"
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>
 
      {/* Role Analytics */}
      <Section title="Role-based Analytics">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Users" value={users.filter((u) => u.role === "USER").length} />
          <StatCard label="Analysts" value={users.filter((u) => u.role === "ANALYST").length} />
          <StatCard label="Admins" value={users.filter((u) => u.role === "ADMIN").length} />
        </div>
      </Section>
 
      {/* Audit Timeline */}
      <Section title="Audit Timeline">
        <ul className="border-l-2 border-indigo-400 pl-6 space-y-3 text-slate-600">
          {auditLog.map((log, index) => (
            <li key={index} className="hover:text-indigo-600 transition">
              {log}
            </li>
          ))}
        </ul>
      </Section>
 
      {/* Top Users */}
      <Section title="Top Users">
        <ol className="list-decimal pl-6 space-y-2 text-slate-700">
          {topUsers.map((u, index) => (
            <li key={index}>
              {u.name} – {u.filings} filings
            </li>
          ))}
        </ol>
      </Section>
 
      {/* Feedback */}
      <Section title="Feedback Inbox">
        <ul className="space-y-3 text-slate-600">
          {feedback.map((f, index) => (
            <li key={index} className="hover:text-indigo-600 transition">
              💬 “{f.message}” – {f.from}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
 
/* ---------- Reusable Styled Components ---------- */

const Section = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl 
  shadow-[0_25px_70px_rgba(0,0,0,0.08)]
  hover:shadow-[0_35px_90px_rgba(0,0,0,0.12)]
  border border-white/50
  transition-all duration-500 mb-14">
    
    <h2 className="text-2xl font-semibold text-slate-900 mb-8">
      {title}
    </h2>
    {children}
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-3xl font-semibold mt-2">{value}</p>
  </div>
);
