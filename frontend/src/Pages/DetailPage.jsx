import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const DetailPage = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  const from = location.state?.from;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/api/ip-assets/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setAsset(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleBack = () => {

    // First check navigation state
    if (from === "ANALYST") {
      navigate("/analyst");
      return;
    }

    if (from === "USER") {
      navigate("/user");
      return;
    }

    // Fallback (if page refreshed)
    if (role === "ANALYST") navigate("/analyst");
    else if (role === "ADMIN") navigate("/admin");
    else navigate("/user");
  };

  if (loading)
    return <p className="text-gray-400 p-10">Loading details...</p>;

  if (!asset)
    return <p className="text-red-500 p-10">Error fetching details.</p>;

  return (
    <div className="p-6 md:p-10 bg-slate-900 text-white min-h-screen">

      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-indigo-400 mb-6">
        {asset.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <Info label="Asset Number" value={asset.assetNumber} />
        <Info label="Type" value={asset.type} />
        <Info label="Inventor" value={asset.inventor} />
        <Info label="Assignee" value={asset.assignee} />
        <Info label="Jurisdiction" value={asset.jurisdiction} />
        <Info label="Status" value={asset.status} />
        <Info label="Class" value={asset.className} />
        <Info label="Last Updated" value={asset.lastUpdated} />

      </div>

      <div className="bg-slate-800 p-6 rounded-xl">
        <h2 className="text-lg md:text-xl font-semibold text-indigo-400 mb-3">
          Description
        </h2>
        <p className="text-gray-300">{asset.details}</p>
      </div>

    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-slate-800 p-4 rounded-xl">
    <p className="text-sm text-gray-400">{label}</p>
    <p className="font-semibold">{value || "N/A"}</p>
  </div>
);

export default DetailPage;