import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AnalystSearchPage() {

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    keyword: "",
    jurisdiction: "",
    applicant: "",
    inventor: "",
    status: "",
    publicationType: ""
  });

  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(false);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);
    applyFilters(updated, allData);
  };

  const applyFilters = (filters, data) => {

    let filtered = [...data];

    if (filters.jurisdiction)
      filtered = filtered.filter(p => p.jurisdiction === filters.jurisdiction);

    if (filters.applicant)
      filtered = filtered.filter(p =>
        p.applicants?.join(" ").toLowerCase()
          .includes(filters.applicant.toLowerCase())
      );

    if (filters.inventor)
      filtered = filtered.filter(p =>
        p.inventors?.join(" ").toLowerCase()
          .includes(filters.inventor.toLowerCase())
      );

    if (filters.status)
      filtered = filtered.filter(p => p.patentStatus === filters.status);

    if (filters.publicationType)
      filtered = filtered.filter(p => p.publicationType === filters.publicationType);

    setResults(filtered);
    setCurrentPage(1);
  };

  const handleSearch = async () => {

    if (!filters.keyword.trim()) {
      alert("Enter keyword");
      return;
    }

    setLoading(true);

    try {

      const url =
        `http://localhost:8081/api/search?q=${encodeURIComponent(filters.keyword)}&type=PATENT&page=0&size=30`;

      const res = await axios.get(url);

      const data = res.data.results || [];

      setAllData(data);
      applyFilters(filters, data);

    } catch (err) {
      console.error(err);
      alert("API Error");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      jurisdiction: "",
      applicant: "",
      inventor: "",
      status: "",
      publicationType: ""
    });
    setResults([]);
    setAllData([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500/20 text-green-400";
      case "PENDING": return "bg-yellow-500/20 text-yellow-400";
      case "DISCONTINUED": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  // PAGINATION LOGIC
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = results.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (

    <div className="p-6 space-y-8 text-white min-h-screen bg-gradient-to-br from-[#0b1a2b] via-[#0a1424] to-[#020617]">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-indigo-400">
          Patent Search 
        </h1>
        <p className="text-gray-400">
          Discover patents across technologies
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155] grid md:grid-cols-3 gap-4 shadow-xl">
        <input name="keyword" value={filters.keyword} onChange={handleChange} placeholder="Keyword..." className="input" />
        <input name="applicant" value={filters.applicant} onChange={handleChange} placeholder="Company" className="input" />
        <input name="inventor" value={filters.inventor} onChange={handleChange} placeholder="Inventor" className="input" />

        <select name="jurisdiction" value={filters.jurisdiction} onChange={handleChange} className="input">
          <option value="">Country</option>
          <option value="US">US</option>
          <option value="CN">China</option>
          <option value="WO">WIPO</option>
          <option value="KR">Korea</option>
        </select>

        <select name="status" value={filters.status} onChange={handleChange} className="input">
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>

        <select name="publicationType" value={filters.publicationType} onChange={handleChange} className="input">
          <option value="">Type</option>
          <option value="PATENT_APPLICATION">Application</option>
          <option value="GRANTED_PATENT">Granted</option>
        </select>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 flex-wrap">
        <button onClick={handleSearch} className="btn-indigo">🔎 Search</button>
        <button onClick={clearFilters} className="btn-red">Reset</button>

        <button
          onClick={() => {
            if (!results.length) return alert("Search first!");
            navigate("/analyst/export", { state: { results } });
          }}
          className="btn-green"
        >
          ⬇ Export
        </button>
         <button
  onClick={async () => {

    if (!results.length) return alert("Search first!");

    try {

      const keyword = filters.keyword;

      // ✅ CALL ALL 3 APIs
      const [trendRes, citationRes, familyRes] = await Promise.all([
        axios.get(`http://localhost:8081/api/visualization/trends?keyword=${keyword}`),
        axios.get(`http://localhost:8081/api/visualization/citations?keyword=${keyword}`),
        axios.get(`http://localhost:8081/api/visualization/families?keyword=${keyword}`)
      ]);

      navigate("/analyst/visualization", {
        state: {
          results,
          trendData: trendRes.data,
          citationData: citationRes.data,
          familyData: familyRes.data
        }
      });

    } catch (err) {
      console.error(err);
      alert("Visualization API error");
    }

  }}
  className="btn-gradient"
>
  📊 Dashboard
</button>
         
         

      </div>

      {/* RESULTS */}
      <div className="grid md:grid-cols-3 gap-6">

        {currentData.map((p) => (

          <div
            key={p.lensId}
            className="
              relative
              bg-gradient-to-br from-[#1e293b] to-[#172033]
              p-5
              rounded-xl
              border border-[#334155]
              cursor-pointer
              transition-all duration-300
              hover:-translate-y-2
              hover:scale-[1.02]
              hover:shadow-[0_25px_80px_rgba(99,102,241,0.6)]
              hover:border-indigo-400
              group
            "
            onClick={() =>
              navigate(`/analyst/patent/${p.lensId}`, { state: { patent: p } })
            }
          >

            {/* glow */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-indigo-500/10 blur-xl"></div>

            <div className="relative z-10">

              <h3 className="text-indigo-400 font-semibold line-clamp-2 mb-2 group-hover:text-white transition">
                {p.title}
              </h3>

              <div className="h-[1px] bg-white/10 my-2"></div>

              <p className="text-sm text-gray-400">
                {p.applicants?.join(", ")}
              </p>

              <p className="text-sm text-gray-400">
                {p.jurisdiction} • {p.datePublished}
              </p>

              <span className={`mt-3 inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(p.patentStatus)}`}>
                {p.patentStatus}
              </span>

            </div>

          </div>

        ))}

      </div>

      {/* PAGINATION */}
      {results.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-4 py-2 bg-[#1e293b] border border-[#334155] rounded hover:bg-indigo-600 transition disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-indigo-400 font-semibold">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-4 py-2 bg-[#1e293b] border border-[#334155] rounded hover:bg-indigo-600 transition disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        .input {
          background: #0f172a;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #334155;
        }

        .input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 10px rgba(99,102,241,0.5);
        }

        .btn-indigo {
          background: #6366f1;
          padding: 10px 20px;
          border-radius: 10px;
        }

        .btn-red {
          background: #ef4444;
          padding: 10px 20px;
          border-radius: 10px;
        }

        .btn-green {
          background: #10b981;
          padding: 10px 20px;
          border-radius: 10px;
        }

        .btn-gradient {
          background: linear-gradient(to right,#6366f1,#9333ea);
          padding: 10px 20px;
          border-radius: 10px;
        }
      `}</style>

    </div>
  );
}


