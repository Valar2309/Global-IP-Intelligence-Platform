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

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPending();
  }, []);

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
      toast.error("Failed to load requests");
    }
  };

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
            <button
              className="primary-btn"
              onClick={() => approveAnalyst(a.id)}
            >
              Approve
            </button>
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

        .header h1 {
          font-size: 20px;
          letter-spacing: 2px;
          color: #38bdf8;
        }

        .header p {
          font-size: 12px;
          opacity: 0.7;
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
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.12);
        }

        .primary-btn {
          padding: 8px 18px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(90deg, #2563eb, #38bdf8);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .primary-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(37,99,235,0.4);
        }

        .empty {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}