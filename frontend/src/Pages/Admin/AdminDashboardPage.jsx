import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboardPage() {

  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const u = await axios.get("http://localhost:8081/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const p = await axios.get("http://localhost:8081/api/admin/analysts/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(u.data);
    setPending(p.data);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-slate-800 p-6 rounded-xl">
        Total Users: {users.length}
      </div>

      <div className="bg-slate-800 p-6 rounded-xl">
        Pending Requests: {pending.length}
      </div>
    </div>
  );
}