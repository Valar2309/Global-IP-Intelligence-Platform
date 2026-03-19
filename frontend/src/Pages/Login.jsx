import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER",
  });

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      toast.error("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      let endpoint = "";

      if (form.role === "ADMIN") {
        endpoint = "http://localhost:8081/api/admin/login";
      } else if (form.role === "ANALYST") {
        endpoint = "http://localhost:8081/api/analyst/login";
      } else {
        endpoint = "http://localhost:8081/api/user/login";
      }

      const res = await axios.post(endpoint, {
        username: form.username,
        password: form.password,
        rememberMe: false,
      });

      const data = res.data;
      const cleanRole = data.role ? data.role.replace("ROLE_", "") : data.userType;

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", cleanRole);

      toast.success("Login successful 🚀");

      setTimeout(() => {
        if (cleanRole === "ADMIN") navigate("/admin");
        else if (cleanRole === "ANALYST") navigate("/analyst");
        else navigate("/user");
      }, 800);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="login-card">
        {/* Branding */}
        <div className="brand">
          <h1>IP Intelligence</h1>
          <p>Secure Enterprise Access Portal 🔒</p>
        </div>

        <h2>Welcome Back</h2>
        <span className="subtitle">Login to continue to your dashboard</span>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* Role Selection as Cards */}
        <div className="role-cards">
          {["USER", "ANALYST", "ADMIN"].map((r) => (
            <div
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`role-card ${form.role === r ? "active" : ""}`}
            >
              <h3>{r}</h3>
            </div>
          ))}
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          className="primary-btn"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Register Link */}
        <button
          className="secondary-btn"
          onClick={() => navigate("/register")}
        >
          Create New Account
        </button>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="links">
          <button className="link">Privacy Policy</button>
          <button className="link">Terms of Use</button>
          <button className="link">Contact</button>
        </div>
        <p className="copy">© 2026 Global IP Intelligence Platform</p>
      </footer>

      {/* Styles */}
      <style>{`
        .wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          padding: 50px 40px;
          border-radius: 20px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.4);
          display: flex;
          flex-direction: column;
          gap: 18px;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
        }

        .brand {
          text-align: center;
          margin-bottom: 10px;
        }

        .brand h1 {
          font-size: 20px;
          letter-spacing: 2px;
          font-weight: 600;
          color: #38bdf8;
        }

        .brand p {
          font-size: 12px;
          opacity: 0.7;
        }

        .login-card h2 {
          font-size: 24px;
          font-weight: 600;
        }

        .subtitle {
          font-size: 13px;
          opacity: 0.7;
          margin-bottom: 10px;
        }

        .login-card input {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .login-card input::placeholder {
          color: rgba(255,255,255,0.6);
        }

        .login-card input:focus {
          border-color: #38bdf8;
          outline: none;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.2);
        }

        /* Role Cards */
        .role-cards {
          display: flex;
          gap: 12px;
          margin: 10px 0;
        }
        .role-card {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: white;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .role-card:hover {
          background: rgba(56,189,248,0.2);
        }
        .role-card.active {
          border-color: #38bdf8;
          background: rgba(56,189,248,0.3);
          font-weight: 600;
        }

        .primary-btn {
          margin-top: 10px;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(90deg, #2563eb, #38bdf8);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(37,99,235,0.4);
        }

        .secondary-btn {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.3);
          background: transparent;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }

        .footer {
          margin-top: 20px;
          text-align: center;
          color: white;
          opacity: 0.8;
        }

        .links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 8px;
        }

        .link {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 13px;
          transition: color 0.3s ease;
        }

        .link:hover {
          color: #38bdf8;
        }

        .copy {
          font-size: 12px;
        }

        @media (max-width: 500px) {
          .login-card {
            padding: 35px 25px;
          }
        }
      `}</style>
    </div>
  );
}
