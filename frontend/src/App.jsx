import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeAdmin } from "./utils/auth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DetailPage from "./Pages/DetailPage";

import Profile from "./Pages/Profile";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AdminDashboard from "./Pages/AdminDashboard";

/* 🔥 ANALYST STRUCTURE */

import AnalystLayout from "./Pages/Analyst/AnalystLayout";
import AnalystDashboardPage from "./Pages/Analyst/AnalystDashboardPage";
import AnalystSearchPage from "./Pages/Analyst/AnalystSearchPage";
import AnalystVisualizationPage from "./Pages/Analyst/AnalystVisualizationPage";
import AnalystExportPage from "./Pages/Analyst/AnalystExportPage";
import AnalystAssetsPage from "./Pages/Analyst/AnalystAssetsPage";
import AnalystStatusDashboard from "./Pages/Analyst/AnalystStatusDashboard";
/* 🔥 NEW DETAIL PAGE */
import PatentDetailPage from "./Pages/Analyst/PatentDetailPage";

import UserLayout from "./Pages/User/UserLayout";
import UserDashboardPage from "./Pages/User/UserDashboardPage";
import UserSearchPage from "./Pages/User/UserSearchPage";
import UserWatchlistPage from "./Pages/User/UserWatchlistPage";
import UserHistoryPage from "./Pages/User/UserHistoryPage";
import UserPatentDetailPage from "./Pages/User/UserPatentDetailPage";
import UserStatusDashboard from "./Pages/user/UserStatusDashboard";
export default function App() {
  useEffect(() => {
    initializeAdmin();
  }, []);

  return (
    <>
      {/* ROUTES */}

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminDashboard />} />

        {/* 🔥 ANALYST ROUTES */}

        <Route path="/analyst" element={<AnalystLayout />}>
          <Route index element={<AnalystDashboardPage />} />

          <Route path="dashboard" element={<AnalystDashboardPage />} />

          <Route path="search" element={<AnalystSearchPage />} />

          <Route path="visualization" element={<AnalystVisualizationPage />} />

          <Route path="export" element={<AnalystExportPage />} />
          <Route path="assets" element={<AnalystAssetsPage />} />
          {/* PATENT DETAIL PAGE */}

          <Route path="patent/:lensId" element={<PatentDetailPage />} />
          <Route path="status-dashboard" element={<AnalystStatusDashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboardPage />} />
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="search" element={<UserSearchPage />} />
          <Route path="watchlist" element={<UserWatchlistPage />} />
          <Route path="history" element={<UserHistoryPage />} />
          <Route path="status-dashboard" element={<UserStatusDashboard />} />

          {/* IMPORTANT */}
          <Route path="patent/:lensId" element={<UserPatentDetailPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>

      {/* TOAST */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        newestOnTop
        pauseOnHover
      />
    </>
  );
}
