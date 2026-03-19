import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-white/20 transition duration-500 hover:bg-indigo-900/90">
        <div className="flex justify-between items-center px-6 md:px-12 py-4">
          {/* Logo */}
          <h1
            onClick={() => navigate("/")}
            className="text-xl md:text-2xl font-semibold text-white cursor-pointer 
                       transition duration-300 
                       hover:text-indigo-300 hover:tracking-wide"
          >
            Global IP Intelligence
          </h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 font-medium text-white">
            <button
              onClick={() => navigate("/login")}
              className="relative transition duration-300 hover:text-indigo-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 border border-white rounded-lg transition-all duration-300
                         hover:bg-indigo-600 hover:border-indigo-600 hover:text-white
                         hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
              Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white text-2xl transition hover:text-indigo-300"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-black/90 text-white flex flex-col items-center gap-4 py-4">
            <button onClick={() => navigate("/login")} className="hover:text-indigo-300 transition">
              Login
            </button>
            <button onClick={() => navigate("/register")} className="hover:text-indigo-300 transition">
              Register
            </button>
          </div>
        )}
      </nav>

      {/* ================= HERO SECTION ================= */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-6 pt-32 pb-24">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl">
          Empowering Global Intellectual Property Insights
        </h1>

        <p className="text-base sm:text-lg text-gray-200 mb-6 max-w-2xl">
          Analyze, monitor and manage intellectual property data securely
          through a powerful enterprise-grade intelligence platform.
        </p>

        {/* Trust Signals */}
        <p className="text-sm text-indigo-300 mb-8">
          🔒 Secure • 🌍 Global Reach • 🏢 Enterprise-Grade
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-indigo-200">Search Patents</h3>
            <p className="text-sm text-gray-300">Find patents worldwide with advanced filters.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-indigo-200">Monitor Trademarks</h3>
            <p className="text-sm text-gray-300">Track trademark status and legal updates.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-indigo-200">Export Reports</h3>
            <p className="text-sm text-gray-300">Download insights in PDF, XML, JSON formats.</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium
                       transition-all duration-300 hover:bg-indigo-700 hover:-translate-y-1
                       hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 border border-white text-white rounded-lg font-medium
                       transition-all duration-300 hover:bg-white hover:text-black
                       hover:-translate-y-1 hover:shadow-xl active:scale-95"
          >
            Login Now
          </button>
        </div>

        {/* Quote Section */}
        <div className="max-w-3xl px-6 py-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
          <p className="text-lg md:text-xl italic text-indigo-200 font-light leading-relaxed">
            “Innovation is protected by insight. Intelligence transforms intellectual property into strategic power.”
          </p>
          <p className="mt-4 text-sm text-gray-300 tracking-wide">
            — Global IP Intelligence Platform
          </p>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 w-full bg-indigo-800 text-white text-center py-6">
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-2">
          <button className="hover:text-indigo-300 transition">Privacy Policy</button>
          <button className="hover:text-indigo-300 transition">Terms of Use</button>
          <button className="hover:text-indigo-300 transition">Contact</button>
        </div>
        <p className="text-sm">© 2026 Global IP Intelligence Platform | All Rights Reserved</p>
      </footer>
    </div>
  );
}
