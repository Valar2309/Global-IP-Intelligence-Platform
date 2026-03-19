import { useEffect, useState } from "react";
import axios from "axios";

export default function AnalystAssetsPage() {

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = "artificial intelligence";

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {

      const response = await axios.get(
        "http://localhost:8081/api/search",
        {
          params: {
            q: query,
            type: "PATENT",
            page: 0,
            size: 5
          }
        }
      );

      setAssets(response.data.results || []);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-600";
      case "PENDING":
        return "bg-yellow-600";
      case "DISCONTINUED":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div>

      <h2 className="text-3xl font-bold text-indigo-400 mb-8">
        Patent Search Results
      </h2>

      {loading && (
        <p className="text-gray-400">Loading patents...</p>
      )}

      {!loading && assets.length === 0 && (
        <p className="text-gray-400">No patents found.</p>
      )}

      {!loading && assets.length > 0 && (

        <div className="bg-slate-800 rounded-xl shadow-lg overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-slate-900 text-gray-300">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Inventors</th>
                <th className="px-6 py-4">Applicants</th>
                <th className="px-6 py-4">Jurisdiction</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {assets.map((asset, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-700 hover:bg-slate-700 transition"
                >

                  <td className="px-6 py-4 text-white font-medium">
                    {asset.title}
                  </td>

                  <td className="px-6 py-4 text-gray-400">
                    {asset.inventors?.join(", ")}
                  </td>

                  <td className="px-6 py-4 text-gray-400">
                    {asset.applicants?.join(", ")}
                  </td>

                  <td className="px-6 py-4 text-gray-400">
                    {asset.jurisdiction}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full text-white ${getStatusColor(asset.patentStatus)}`}
                    >
                      {asset.patentStatus}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}