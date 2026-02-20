import { getUser } from "../utils/auth";

import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const user = getUser();
  const navigate = useNavigate();

  if (!user || user.role !== "USER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold text-red-500">
          Access Denied
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 sm:px-10 py-16">

      {/* Welcome Banner */}

      <div className="mb-14 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {user.username}
            </span> 👋
          </h1>
          <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-xl">
            Explore your intellectual property insights with precision and clarity.
          </p>
        </div>

        {/* 🔥 Profile Button (Now Navigates) */}
        <button
          onClick={() => navigate("/profile")}
          className="px-8 py-3 rounded-2xl font-medium text-white
          bg-gradient-to-r from-indigo-600 to-purple-600
          shadow-[0_10px_30px_rgba(79,70,229,0.4)]
          hover:shadow-[0_15px_40px_rgba(79,70,229,0.5)]
          hover:-translate-y-1
          active:scale-95
          transition-all duration-300"
        >
          View Profile
        </button>
      </div>

      {/* Search Section */}
      <Section title="Search IP">
        <input
          type="text"
          placeholder="Search patent..."
          className="w-full px-5 py-4 rounded-2xl border border-slate-200
          bg-white shadow-inner
          focus:ring-2 focus:ring-indigo-500
          focus:border-indigo-500
          outline-none transition-all duration-300 mb-6"
        />


        <div className="flex flex-wrap gap-4 text-sm">
          <Tag text="Patent" />
          <Tag text="Trademark" />
          <Tag text="Copyright" />
        </div>
      </Section>

      {/* Saved Searches */}
      <Section title="Saved Searches">
        <ul className="space-y-3 text-slate-600">
          <li className="hover:text-indigo-600 hover:translate-x-1 transition-all duration-300 cursor-pointer">
            Patent filings in 2025
          </li>
          <li className="hover:text-indigo-600 hover:translate-x-1 transition-all duration-300 cursor-pointer">
            Trademark disputes in India
          </li>
        </ul>
      </Section>

      {/* Recent Activity */}
      <Section title="Recent Activity">
        <ul className="space-y-4 text-slate-600">
          <li className="hover:text-indigo-600 transition-all duration-300">
            🔍 You searched for Filing X yesterday
          </li>
          <li className="hover:text-indigo-600 transition-all duration-300">
            📌 You pinned Filing Y last week
          </li>
        </ul>
      </Section>

      {/* Achievements */}
      <Section title="Achievements">
        <div className="flex flex-wrap gap-8">
          <Achievement text="First Search Completed" />
          <Achievement text="10 Filings Tracked" />
        </div>
      </Section>

    </div>
  );
}

/* ---------- Reusable Components ---------- */

const Section = ({ title, children }) => (
  <div className="bg-white p-8 rounded-3xl shadow-lg mb-14 border border-slate-100 transition hover:shadow-xl">
    <h3 className="text-xl font-semibold text-slate-900 mb-6">
      {title}
    </h3>
    {children}
  </div>
);

const Tag = ({ text }) => (
  <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full font-medium cursor-pointer hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
    {text}
  </span>
);

const Achievement = ({ text }) => (
  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    🏅
    <p className="text-sm mt-3 font-medium">{text}</p>
  </div>
);