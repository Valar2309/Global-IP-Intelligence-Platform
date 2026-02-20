import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getAllUsers, saveUser, getRequests } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = () => {
    if (!form.username || !form.password) {
      toast.error("Please enter username and password");
      return;
    }

    const users = getAllUsers();

    const user = users.find(
      (u) =>
        u.username === form.username &&
        u.password === form.password
    );

    if (!user) {

      toast.error("Invalid username or password");
      return;
    }

    if (user.role === "USER") {
      const requests = getRequests();
      const pendingRequest = requests.find(
        (r) =>
          r.username === user.username &&
          r.status === "PENDING"
      );

      if (pendingRequest) {
        toast.warning(
          "Your Analyst request is pending admin approval."
        );
        return;
      }
    }

    saveUser(user);

    toast.success("Login successful");

    setTimeout(() => {
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "ANALYST") {
        navigate("/analyst");
      } else {
        navigate("/user");
      }
    }, 1000);
  };

  return (

    <div className="wrapper">
      <div className="login-card">

        <div className="brand">
          <h1>IP Intelligence</h1>
          <p>Secure Access Portal</p>
        </div>

        <h2>Welcome Back</h2>
        <span className="subtitle">
          Login to continue to your dashboard
        </span>

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"

          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button onClick={handleLogin} className="primary-btn">
          Sign In
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/register")}
        >
          Create New Account
        </button>

      </div>

      <style>{`
        .wrapper {
          min-height: 100vh;
          display: flex;
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
          font-size: 18px;
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

        .primary-btn:hover {
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

        @media (max-width: 500px) {
          .login-card {
            padding: 35px 25px;
          }
        }
      `}</style>
    </div>
  );
}