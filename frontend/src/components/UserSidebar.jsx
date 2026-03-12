import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  History,
  User,
  Bell,
} from "lucide-react";

export default function UserSidebar() {
  const links = [
    { path: "/user/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/user/search", label: "Patent Search", icon: Search },
    { path: "/user/watchlist", label: "Watchlist", icon: Bookmark },
    { path: "/user/history", label: "History", icon: History },

    /* NEW SUBSCRIPTIONS SECTION */

    { path: "/user/subscriptions", label: "Subscriptions", icon: Bell },

    { path: "/user/profile", label: "Profile", icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-white/10 p-6">
      <h2 className="text-xl font-bold text-indigo-400 mb-8">User Panel</h2>

      <nav className="space-y-3">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm 
                ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
