
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });

  };

  const handleSearch = async () => {

    if (!filters.keyword.trim()) {
      alert("Enter keyword");
      return;
    }

    setLoading(true);

    try {

      const url =
        `http://localhost:8081/api/search?q=${encodeURIComponent(filters.keyword)}&type=PATENT&page=0&size=20`;

      const res = await axios.get(url);

      let data = res.data.results || [];

      if (filters.jurisdiction)
        data = data.filter(p => p.jurisdiction === filters.jurisdiction);

      if (filters.applicant)
        data = data.filter(
          p => p.applicants?.join(" ")
            .toLowerCase()
            .includes(filters.applicant.toLowerCase())
        );

      if (filters.inventor)
        data = data.filter(
          p => p.inventors?.join(" ")
            .toLowerCase()
            .includes(filters.inventor.toLowerCase())
        );

      if (filters.status)
        data = data.filter(
          p => p.patentStatus === filters.status
        );

      if (filters.publicationType)
        data = data.filter(
          p => p.publicationType === filters.publicationType
        );

      setResults(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  const getStatusColor = (status) => {

    switch (status) {

      case "ACTIVE":
        return "bg-green-600 text-white";

      case "PENDING":
        return "bg-yellow-500 text-black";

      case "DISCONTINUED":
        return "bg-red-600 text-white";

      default:
        return "bg-gray-600 text-white";

    }

  };

  return (

    <div className="space-y-10 text-white">

      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-extrabold text-indigo-400">
          Global Patent Intelligence Search
        </h1>

        <p className="text-gray-400">
          Discover patents across technologies and companies.
        </p>

      </div>


      {/* FILTER PANEL */}

      <div className="
        bg-slate-800
        p-6
        rounded-xl
        shadow-xl
        grid
        md:grid-cols-3
        gap-4
        border border-slate-700
      ">

        <input
          name="keyword"
          placeholder="Keyword (AI, battery, robotics...)"
          onChange={handleChange}
          className="
          bg-slate-900
          text-white
          p-3
          rounded-lg
          border border-slate-700
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
          "
        />

        <input
          name="applicant"
          placeholder="Applicant / Company"
          onChange={handleChange}
          className="
          bg-slate-900
          text-white
          p-3
          rounded-lg
          border border-slate-700
          focus:ring-2
          focus:ring-indigo-500
          "
        />

        <input
          name="inventor"
          placeholder="Inventor"
          onChange={handleChange}
          className="
          bg-slate-900
          text-white
          p-3
          rounded-lg
          border border-slate-700
          focus:ring-2
          focus:ring-indigo-500
          "
        />

        <select
          name="jurisdiction"
          onChange={handleChange}
          className="
          bg-slate-900
          text-white
          p-3
          rounded-lg
          border border-slate-700
          "
        >

          <option value="">Jurisdiction</option>
          <option value="US">US</option>
          <option value="CN">China</option>
          <option value="WO">WIPO</option>
          <option value="KR">Korea</option>

        </select>

        <select
          name="status"
          onChange={handleChange}
          className="
          bg-slate-900
          text-white
          p-3
          rounded-lg
          border border-slate-700
          "
        >

          <option value="">Patent Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="DISCONTINUED">Discontinued</option>

        </select>

        <select
          name="publicationType"
          onChange={handleChange}
          className="
          bg-slate-900
          text-white
          p-3
          rounded-lg
          border border-slate-700
          "
        >

          <option value="">Publication Type</option>
          <option value="PATENT_APPLICATION">Application</option>
          <option value="GRANTED_PATENT">Granted</option>

        </select>

      </div>


      {/* BUTTONS */}

      <div className="flex flex-wrap gap-4">

        <button
          onClick={handleSearch}
          className="
          bg-indigo-600
          text-white
          px-8
          py-3
          rounded-lg
          hover:bg-indigo-700
          shadow-lg
          hover:shadow-indigo-500/40
          transition
          "
        >
          🔎 Search
        </button>

        <button
          onClick={() =>
            navigate(`/analyst/export?q=${encodeURIComponent(filters.keyword)}`)
          }
          className="
          bg-green-600
          text-white
          px-8
          py-3
          rounded-lg
          hover:bg-green-700
          shadow-lg
          hover:shadow-green-500/30
          transition
          "
        >
          ⬇ Export Results
        </button>

        <button
          onClick={() =>
            navigate(`/analyst/visualization?q=${encodeURIComponent(filters.keyword)}`)
          }
          className="
          bg-gradient-to-r
          from-purple-600
          to-pink-600
          text-white
          px-8
          py-3
          rounded-lg
          shadow-lg
          hover:shadow-pink-500/30
          transition
          "
        >
          📊 Analytics Dashboard
        </button>

      </div>


      {/* LOADING */}

      {loading && (
        <p className="text-gray-400">
          Searching patents...
        </p>
      )}


      {/* RESULTS */}

      {results.length > 0 && (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {results.map((p) => (

            <div
              key={p.lensId}
              onClick={() =>
                navigate(`/analyst/patent/${p.lensId}`, {
                  state: { patent: p }
                })
              }
              className="
              bg-slate-800
              p-6
              rounded-xl
              shadow-xl
              hover:shadow-indigo-500/30
              hover:-translate-y-1
              transition
              cursor-pointer
              border border-slate-700
              "
            >

              <h3 className="text-indigo-400 font-semibold text-lg mb-2 line-clamp-2">
                {p.title}
              </h3>

              <p className="text-gray-400 text-sm">
                Applicant: {p.applicants?.join(", ")}
              </p>

              <p className="text-gray-400 text-sm">
                Jurisdiction: {p.jurisdiction}
              </p>

              <p className="text-gray-400 text-sm">
                Patent #: {p.docNumber}
              </p>

              <p className="text-gray-500 text-sm">
                Published: {p.datePublished}
              </p>

              <span
                className={`mt-3 inline-block px-3 py-1 text-xs rounded ${getStatusColor(p.patentStatus)}`}
              >
                {p.patentStatus}
              </span>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

