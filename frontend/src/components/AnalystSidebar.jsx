import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  FileDown,
  User,
  Activity,
} from "lucide-react";

export default function AnalystSidebar() {
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
    ${
      isActive
        ? "bg-slate-800 text-indigo-400 shadow-lg shadow-indigo-500/20"
        : "text-gray-400 hover:text-indigo-400 hover:bg-slate-800 hover:shadow-md"
    }`;

  return (
    <aside
      className="
      fixed
      top-16
      left-0
      w-64
      h-[calc(100vh-4rem)]
      bg-slate-950
      border-r border-slate-800
      p-6
      shadow-2xl
      overflow-y-auto
      "
    >
      {/* SIDEBAR TITLE */}

      <h2
        className="
        text-2xl
        font-extrabold
        mb-10
        bg-gradient-to-r
        from-indigo-400
        to-purple-500
        bg-clip-text
        text-transparent
        tracking-wide
        drop-shadow-md
        relative
        "
      >
        Analyst Panel
        <span
          className="
          absolute
          left-0
          -bottom-2
          w-12
          h-[3px]
          bg-indigo-500
          rounded-full
          "
        ></span>
      </h2>

      {/* NAVIGATION LINKS */}

      <div className="space-y-2">
        <NavLink to="/analyst/dashboard" className={linkStyle}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink to="/analyst/search" className={linkStyle}>
          <Search size={18} />
          Search
        </NavLink>

        <NavLink to="/analyst/visualization" className={linkStyle}>
          <BarChart3 size={18} />
          Visualization
        </NavLink>

        <NavLink to="/analyst/export" className={linkStyle}>
          <FileDown size={18} />
          Export
        </NavLink>

        <NavLink to="/analyst/status-dashboard" className={linkStyle}>
          <Activity size={18} />
          Status Dashboard
        </NavLink>

        <NavLink to="/analyst/profile" className={linkStyle}>
          <User size={18} />
          Profile
        </NavLink>
      </div>
    </aside>
  );
}
