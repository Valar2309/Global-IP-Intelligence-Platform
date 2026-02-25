import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    documentType: "AADHAAR_CARD",
    proofFile: null,
  });

  const handleRegister = async () => {
    try {
      if (!form.username || !form.email || !form.password) {
        toast.error("All fields are required");
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // USER Registration
      if (form.role === "USER") {
        await axios.post("http://localhost:8081/api/user/register", {
          username: form.username,
          email: form.email,
          password: form.password,
        });

        toast.success("Account created successfully");
        navigate("/login");
        return;
      }

      // ANALYST Registration
      if (!form.proofFile) {
        toast.error("Identity proof file is required");
        return;
      }

      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("name", form.username);
      formData.append("documentType", form.documentType);
      formData.append("purpose", "Research access");
      formData.append("organization", "Independent");
      formData.append("document", form.proofFile);

      await axios.post(
        "http://localhost:8081/api/analyst/register",
        formData
      );

      toast.success("Analyst request submitted. Wait for admin approval.");
      navigate("/login");

    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-10 text-white space-y-5">

        <div>
          <h1 className="text-lg font-semibold tracking-widest text-sky-400">
            IP Intelligence
          </h1>
          <p className="text-sm text-gray-300">
            Create your professional account
          </p>
        </div>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 rounded-xl bg-slate-700 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="w-full p-3 rounded-xl bg-slate-700 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-xl bg-slate-700 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm password"
          className={`w-full p-3 rounded-xl bg-slate-700 text-white border ${
            form.confirmPassword &&
            form.confirmPassword !== form.password
              ? "border-red-500"
              : "border-white/20"
          } focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-400`}
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        {/* Role Dropdown */}
        <select
          className="w-full p-3 rounded-xl bg-slate-700 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none cursor-pointer"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="USER" className="bg-slate-800 text-white">
            USER
          </option>
          <option value="ANALYST" className="bg-slate-800 text-white">
            ANALYST
          </option>
        </select>

        {/* Analyst Section */}
        {form.role === "ANALYST" && (
          <>
            <select
              className="w-full p-3 rounded-xl bg-slate-700 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400 appearance-none cursor-pointer"
              value={form.documentType}
              onChange={(e) =>
                setForm({ ...form, documentType: e.target.value })
              }
            >
              <option value="AADHAAR_CARD">AADHAAR_CARD</option>
              <option value="PAN_CARD">PAN_CARD</option>
              <option value="PASSPORT">PASSPORT</option>
              <option value="VOTER_ID">VOTER_ID</option>
              <option value="DRIVING_LICENSE">DRIVING_LICENSE</option>
              <option value="OTHER">OTHER</option>
            </select>

            <input
              type="file"
              accept=".pdf,.jpg,.png"
              className="w-full text-sm text-gray-300"
              onChange={(e) =>
                setForm({ ...form, proofFile: e.target.files[0] })
              }
            />
          </>
        )}

        {/* Buttons */}
        <button
          onClick={handleRegister}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-sky-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          Create Account
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-xl border border-white/30 hover:bg-white/10 transition"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}