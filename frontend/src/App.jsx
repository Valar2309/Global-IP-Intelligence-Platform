import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeAdmin } from "./utils/auth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ThemeToggle from "./components/ThemeToggle";

import DetailPage from "./Pages/DetailPage"
import Profile from "./Pages/Profile";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import UserDashboard from "./Pages/UserDashboard";
import AnalystDashboard from "./Pages/AnalystDashboard";
import AdminDashboard from "./Pages/AdminDashboard";

export default function App() {
  useEffect(() => {
    initializeAdmin();
  }, []);

  return (
    <>
      {/* Global Theme Toggle (Fixed Top Right) */}
      <ThemeToggle />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/analyst" element={<AnalystDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/assets/:id" element={<DetailPage />} />
      </Routes>

      {/* Global Toast Notifications */}
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


 