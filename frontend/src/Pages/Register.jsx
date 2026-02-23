import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllUsers,
  saveAllUsers,
  saveRequest,
} from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    idType: "AADHAAR", // default selection
    aadhaar: "",
    pan: "",
    proofFile: null,
  });

  const handleRegister = () => {
    if (!form.username || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const users = getAllUsers();
    const userExists = users.find(
      (u) => u.username === form.username
    );

    if (userExists) {
      toast.error("Username already exists");
      return;
    }

    const newUser = {
      username: form.username,
      email: form.email,
      password: form.password,
      role: "USER",
      photo: "",
    };

    saveAllUsers([...users, newUser]);

    if (form.role === "ANALYST") {
      // ✅ Validate Aadhaar or PAN based on selection
      if (form.idType === "AADHAAR") {
        if (!form.aadhaar || form.aadhaar.length !== 12) {
          toast.error("Aadhaar must be 12 digits");
          return;
        }
      }
      if (form.idType === "PAN") {
        if (!form.pan || form.pan.length !== 10) {
          toast.error("PAN must be 10 characters");
          return;
        }
      }
      if (!form.proofFile) {
        toast.error("Identity proof file is required");
        return;
      }

      saveRequest({
        username: form.username,
        requestedRole: "ANALYST",
        status: "PENDING",
        idType: form.idType,
        aadhaar: form.idType === "AADHAAR" ? form.aadhaar : null,
        pan: form.idType === "PAN" ? form.pan : null,
        proofFileName: form.proofFile.name,
      });
      toast.success("Analyst request submitted with identity proof.");
    } else {
      toast.success("Account created successfully.");
    }

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  return (
    <div className="wrapper">
      <div className="register-card">

        <div className="brand">
          <h1>IP Intelligence</h1>
          <p>Create your professional account</p>
        </div>

        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
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

       <input
  type="password"
  placeholder="Confirm password"
  value={form.confirmPassword}
  onChange={(e) =>
    setForm({ ...form, confirmPassword: e.target.value })
  }
  className={`border p-2 w-full mb-4 rounded-lg ${
    form.confirmPassword && form.confirmPassword !== form.password
      ? "border-red-500"
      : "border-gray-300"
  }`}
/>

        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="USER">User</option>
          <option value="ANALYST">Analyst</option>
        </select>

        {/* ✅ Aadhaar vs PAN Toggle for Analysts */}
        {form.role === "ANALYST" && (
          <>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${
                  form.idType === "AADHAAR"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setForm({ ...form, idType: "AADHAAR" })}
              >
                Aadhaar
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${
                  form.idType === "PAN"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setForm({ ...form, idType: "PAN" })}
              >
                PAN
              </button>
            </div>

            {form.idType === "AADHAAR" && (
              <input
                type="text"
                placeholder="Enter Aadhaar Number"
                maxLength={12}
                value={form.aadhaar}
                onChange={(e) =>
                  setForm({ ...form, aadhaar: e.target.value })
                }
              />
            )}

            {form.idType === "PAN" && (
              <input
                type="text"
                placeholder="Enter PAN Number"
                maxLength={10}
                value={form.pan}
                onChange={(e) =>
                  setForm({ ...form, pan: e.target.value })
                }
              />
            )}

            <input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) =>
                setForm({ ...form, proofFile: e.target.files[0] })
              }
            />
          </>
        )}

        <button className="primary-btn" onClick={handleRegister}>
          Create Account
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/login")}
        >
          Back to Login
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

        .register-card {
          width: 100%;
          max-width: 460px;
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
          margin-bottom: 10px;
        }

        .brand h1 {
          font-size: 18px;
          letter-spacing: 2px;
          font-weight: 600;
          color: #38bdf8;
        }
.border-red-500 {
  border-color: #ef4444 !important; /* Tailwind red-500 */
  box-shadow: 0 0 0 2px rgba(239,68,68,0.4);
}

        .brand p {
          font-size: 12px;
          opacity: 0.7;
        }

        .register-card input,
        .register-card select {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .register-card input::placeholder {
          color: rgba(255,255,255,0.6);
        }

        .register-card input:focus,
        .register-card select:focus {
          border-color: #38bdf8;
          outline: none;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.2);
        }

        .primary-btn {
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
          .register-card {
            padding: 35px 25px;
          }
        }
      `}</style>
    </div>
  );
}
