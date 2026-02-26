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

  // ================= AUTH CHECK =================
  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchUsers();
    fetchPending();
  }, []);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8081/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  // ================= FETCH PENDING =================
  const fetchPending = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8081/api/admin/analysts/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPending(res.data);
    } catch {
      toast.error("Failed to load pending requests");
    }
  };

  // ================= APPROVE =================
  const approveAnalyst = async (id) => {
    try {
      await axios.post(
        `http://localhost:8081/api/admin/analysts/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Analyst Approved 🚀");
      fetchPending();
      fetchUsers();
    } catch {
      toast.error("Approval failed");
    }
  };

  // ================= REJECT =================
  const rejectAnalyst = async (id) => {
    try {
      await axios.post(
        `http://localhost:8081/api/admin/analysts/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Analyst Rejected ❌");
      fetchPending();
      fetchUsers();
    } catch {
      toast.error("Reject failed");
    }
  };

  // ================= VIEW DOCUMENT (FINAL FIX) =================
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

    } catch (err) {
      toast.error("Failed to load document");
    } finally {
      setLoadingDoc(null);
    }
  };

  return (
    <div className="wrapper">
      <div className="dashboard-card">

        <div className="header">
          <h1>IP Intelligence</h1>
          <p>Admin Control Panel</p>
        </div>

        <h2>Pending Analyst Requests</h2>

        {pending.length === 0 && (
          <p className="empty">No pending requests</p>
        )}

        {pending.map((a) => (
          <div key={a.id} className="card">
            <div>
              <strong>{a.username}</strong>
              <p>{a.email}</p>
            </div>

            <div className="btn-group">

              <button
                className="doc-btn"
                onClick={() => viewDocument(a.id)}
                disabled={loadingDoc === a.id}
              >
                {loadingDoc === a.id ? "Loading..." : "View Doc"}
              </button>

              <button
                className="primary-btn"
                onClick={() => approveAnalyst(a.id)}
              >
                Approve
              </button>

              <button
                className="danger-btn"
                onClick={() => rejectAnalyst(a.id)}
              >
                Reject
              </button>

            </div>
          </div>
        ))}

        <h2>All Users</h2>

        {users.map((u) => (
          <div key={u.id} className="card">
            <div>
              <strong>{u.username}</strong>
              <p>{u.roles?.join(", ")}</p>
            </div>
          </div>
        ))}

      </div>

      <style>{`
        .wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 40px;
          font-family: 'Inter', sans-serif;
        }

        .dashboard-card {
          width: 100%;
          max-width: 900px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        h2 {
          margin-top: 30px;
          margin-bottom: 15px;
        }

        .card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.08);
          padding: 15px 20px;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .btn-group {
          display: flex;
          gap: 10px;
        }

        .primary-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(90deg, #16a34a, #22c55e);
          color: white;
          cursor: pointer;
        }

        .danger-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(90deg, #dc2626, #ef4444);
          color: white;
          cursor: pointer;
        }

        .doc-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(90deg, #2563eb, #38bdf8);
          color: white;
          cursor: pointer;
        }

        .empty {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}