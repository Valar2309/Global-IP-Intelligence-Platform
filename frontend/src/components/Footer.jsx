import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
        
        {/* Left */}
        <span>
          © {new Date().getFullYear()} Global IP Intelligence
        </span>

        {/* Right Links */}
        <div className="flex gap-6">
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer hover:text-indigo-400 transition"
          >
            Login
          </span>
          <span
            onClick={() => navigate("/register")}
            className="cursor-pointer hover:text-indigo-400 transition"
          >
            Register
          </span>
        </div>
      </div>

    </footer>
  );
}
