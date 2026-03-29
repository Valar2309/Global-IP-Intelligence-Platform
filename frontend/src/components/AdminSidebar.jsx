import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, UserCheck, Activity, FileText } from "lucide-react";

export default function AdminSidebar() {

  const link = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition ${
      isActive ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-slate-800"
    }`;

  return (
    <div className="w-64 bg-slate-900 h-screen p-5 fixed">

      <h2 className="text-indigo-400 text-xl mb-8">Admin Panel</h2>

      <nav className="space-y-2">

        <NavLink to="/admin/dashboard" className={link}>
          <LayoutDashboard size={18}/> Dashboard
        </NavLink>

        <NavLink to="/admin/approvals" className={link}>
          <UserCheck size={18}/> Approvals
        </NavLink>

        <NavLink to="/admin/users" className={link}>
          <Users size={18}/> Users
        </NavLink>

        <NavLink to="/admin/api-health" className={link}>
          <Activity size={18}/> API Health
        </NavLink>

        <NavLink to="/admin/logs" className={link}>
          <FileText size={18}/> Logs
        </NavLink>

      </nav>
    </div>
  );
}