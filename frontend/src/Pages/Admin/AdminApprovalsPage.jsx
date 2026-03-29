import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminApprovalsPage() {

  const [pending, setPending] = useState([]);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const res = await axios.get("http://localhost:8081/api/admin/analysts/pending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPending(res.data);
  };

  const approve = async (id) => {
    await axios.post(`http://localhost:8081/api/admin/analysts/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPending();
  };

  const reject = async (id) => {
    await axios.post(`http://localhost:8081/api/admin/analysts/${id}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPending();
  };

  return (
    <div>
      <h2 className="text-xl mb-6">Pending Requests</h2>

      {pending.map(a => (
        <div key={a.id} className="bg-slate-800 p-4 mb-3 rounded flex justify-between">
          <div>
            <p>{a.username}</p>
            <p className="text-gray-400">{a.email}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => approve(a.id)} className="bg-green-600 px-3 py-1 rounded">Approve</button>
            <button onClick={() => reject(a.id)} className="bg-red-600 px-3 py-1 rounded">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}