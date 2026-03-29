import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import AdminTopbar from "../../components/AdminTopbar";

export default function AdminLayout() {

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      <AdminSidebar />

      <div className="flex-1 ml-64">

        <AdminTopbar handleLogout={handleLogout} />

        <div className="p-10">
          <Outlet />
        </div>

      </div>
    </div>
  );
}