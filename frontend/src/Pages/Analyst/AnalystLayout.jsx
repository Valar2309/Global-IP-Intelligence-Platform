
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import AnalystSidebar from "../../components/AnalystSidebar";
import AnalystTopbar from "../../components/AnalystTopbar";

export default function AnalystLayout() {

  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "ANALYST") {
      navigate("/login");
    }
  }, [token, role, navigate]);

  const handleLogout = () => {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");

    navigate("/login");

  };

  return (

    <div className="min-h-screen bg-slate-900 text-white">

      {/* TOPBAR */}
      <AnalystTopbar />

      {/* SIDEBAR */}
      <AnalystSidebar />

      {/* MAIN CONTENT */}

      <main
        className="
        ml-64
        pt-20
        p-10
        min-h-screen
        bg-slate-900
        "
      >

        <div className="flex justify-end mb-6">

          <button
            onClick={handleLogout}
            className="
            bg-red-600
            hover:bg-red-700
            text-white
            px-5
            py-2
            rounded-lg
            shadow
            "
          >
            Logout
          </button>

        </div>

        <Outlet />

      </main>

    </div>

  );

}

