import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChartsSection from "../components/analyst/ChartsSection";
import Pagination from "../components/analyst/Pagination";
import SortControls from "../components/analyst/SortControls";
import ExportMenu from "../components/analyst/ExportMenu";

export default function AnalystDashboard() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [user, setUser] = useState(null);
  const [filings, setFilings] = useState([]);
  const [activeSection, setActiveSection] = useState("overview");

  const [keyword, setKeyword] = useState("");
  const [inventor, setInventor] = useState("");
  const [assignee, setAssignee] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!token || role !== "ANALYST") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 🔹 Fetch logged in analyst
        const userRes = await axios.get(
          "http://localhost:8081/api/analyst/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(userRes.data);

        try {
          // 🔹 Try real filings API
          const filingsRes = await axios.get(
            "http://localhost:8081/api/analyst/filings",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setFilings(filingsRes.data);
        } catch (filingError) {
          console.warn("Filings API not ready. Using dummy data.");

          // 🔹 Fallback Dummy Data
          setFilings([
            {
              id: 1,
              type: "Patent",
              status: "Active",
              jurisdiction: "USPTO",
              inventor: "John Smith",
              assignee: "Tesla Inc",
              keyword: "Electric Battery",
              filingDate: "2024-01-15",
            },
            {
              id: 2,
              type: "Trademark",
              status: "Pending",
              jurisdiction: "WIPO",
              inventor: "Maria Garcia",
              assignee: "Nike",
              keyword: "Smart Shoes",
              filingDate: "2024-02-10",
            },
            {
              id: 3,
              type: "Patent",
              status: "Expired",
              jurisdiction: "EPO",
              inventor: "Akira Tanaka",
              assignee: "Sony",
              keyword: "AI Camera",
              filingDate: "2024-03-20",
            },
          ]);
        }
      } catch (err) {
        console.error(err);
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate, token, role]);

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    return filings.filter(
      (f) =>
        (keyword === "" ||
          f.keyword?.toLowerCase().includes(keyword.toLowerCase())) &&
        (inventor === "" ||
          f.inventor?.toLowerCase().includes(inventor.toLowerCase())) &&
        (assignee === "" ||
          f.assignee?.toLowerCase().includes(assignee.toLowerCase())) &&
        (jurisdiction === "" || f.jurisdiction === jurisdiction)
    );
  }, [filings, keyword, inventor, assignee, jurisdiction]);

  /* ================= SORT ================= */
  const sortedData = useMemo(() => {
    let sorted = [...filteredData];
    if (sortField) {
      sorted.sort((a, b) => {
        if (a[sortField] < b[sortField])
          return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField])
          return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortField, sortOrder]);

  /* ================= PAGINATION ================= */
  const itemsPerPage = 4;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#0f172a] text-white">
        Loading Analyst Dashboard...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0b1220] via-[#111827] to-[#0f172a] text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 p-8 flex flex-col justify-between shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold mb-14 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            IP Intel
          </h2>

          <SidebarItem label="📊 Overview" active={activeSection === "overview"} onClick={() => setActiveSection("overview")} />
          <SidebarItem label="📁 Filings" active={activeSection === "filings"} onClick={() => setActiveSection("filings")} />
          <SidebarItem label="📄 Reports" active={activeSection === "reports"} onClick={() => setActiveSection("reports")} />
        </div>

        <div className="text-xs text-gray-400 border-t border-white/10 pt-4">
          Logged in as{" "}
          <span className="text-indigo-400 font-semibold">
            {user.username}
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-16">

        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Analyst Dashboard
          </h1>
          <p className="text-gray-400 mt-3">
            Analyze and explore intellectual property data.
          </p>
        </div>

        {activeSection === "overview" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl">
            <ChartsSection data={filteredData} />
          </div>
        )}

        {activeSection === "filings" && (
          <>
            <div className="mb-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
              <h3 className="text-lg font-semibold mb-6 text-indigo-400">
                Advanced Filters
              </h3>

              <div className="grid md:grid-cols-4 gap-6">
                <Input placeholder="Keyword" value={keyword} onChange={setKeyword} />
                <Input placeholder="Inventor" value={inventor} onChange={setInventor} />
                <Input placeholder="Assignee" value={assignee} onChange={setAssignee} />

                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Jurisdictions</option>
                  <option value="USPTO">USPTO</option>
                  <option value="EPO">EPO</option>
                  <option value="WIPO">WIPO</option>
                  <option value="TMview">TMview</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <SortControls
                sortField={sortField}
                setSortField={setSortField}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
              <ExportMenu data={sortedData} />
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 text-left">Type</th>
                    <th>Status</th>
                    <th>Jurisdiction</th>
                    <th>Inventor</th>
                    <th>Assignee</th>
                    <th>Keyword</th>
                    <th>Filing Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((f) => (
                    <tr key={f.id} className="border-b border-white/5 hover:bg-white/10 transition-all duration-300">
                      <td className="py-3">{f.type}</td>
                      <td>{f.status}</td>
                      <td>{f.jurisdiction}</td>
                      <td>{f.inventor}</td>
                      <td>{f.assignee}</td>
                      <td>{f.keyword}</td>
                      <td>{f.filingDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                totalItems={sortedData.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const SidebarItem = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`px-5 py-3 rounded-xl mb-5 cursor-pointer transition-all duration-300 text-sm font-medium ${
      active
        ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg"
        : "hover:bg-white/10"
    }`}
  >
    {label}
  </div>
);

const Input = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
  />
);