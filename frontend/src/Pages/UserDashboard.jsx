import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role"); // ✅ FIXED

  useEffect(() => {
    if (!token || role !== "USER") {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8081/api/user/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data);
      } catch (err) {
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, token, role]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827] text-white px-6 md:px-12 py-16">

      {/* HEADER */}
      <div className="mb-16 flex justify-between items-center flex-wrap gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Welcome, {user.username} 👋
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl">
            Explore your intellectual property insights with clarity and confidence.
          </p>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="px-8 py-3 rounded-xl font-medium text-white
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:scale-105 transition transform shadow-lg"
        >
          View Profile
        </button>
      </div>

      {/* SEARCH SECTION */}
      <Section title="Search IP">
        <div className="relative">
          <input
            type="text"
            placeholder="Search patents, trademarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            backdrop-blur-md transition"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </Section>

      {/* SAVED SEARCHES */}
      <Section title="Saved Searches">
        <ul className="space-y-4 text-gray-300">
          <li className="hover:text-indigo-400 transition cursor-pointer">
            Patent filings in 2025
          </li>
          <li className="hover:text-indigo-400 transition cursor-pointer">
            Trademark disputes in India
          </li>
        </ul>
      </Section>

      {/* RECENT ACTIVITY */}
      <Section title="Recent Activity">
        <ul className="space-y-4 text-gray-300">
          <li>🔍 You searched for Filing X yesterday</li>
          <li>📌 You pinned Filing Y last week</li>
        </ul>
      </Section>

      {/* ACHIEVEMENTS */}
      <Section title="Achievements">
        <div className="flex flex-wrap gap-8">
          <Achievement text="First Search Completed" />
          <Achievement text="10 Filings Tracked" />
        </div>
      </Section>
    </div>
  );
}

/* ---------- Components ---------- */

const Section = ({ title, children }) => (
  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 mb-14 shadow-xl hover:shadow-2xl transition">
    <h3 className="text-xl font-semibold text-indigo-400 mb-6">
      {title}
    </h3>
    {children}
  </div>
);

const Achievement = ({ text }) => (
  <div
    className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white
    p-6 rounded-2xl text-center shadow-lg
    hover:scale-105 transition transform"
  >
    🏅
    <p className="text-sm mt-3 font-medium">{text}</p>
  </div>
);