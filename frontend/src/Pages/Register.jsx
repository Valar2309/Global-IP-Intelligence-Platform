import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    documentType: "AADHAAR_CARD",
    proofFile: null,
  });

  // Password strength check
  const getPasswordStrength = (pwd) => {
    if (!pwd) return "";
    if (pwd.length < 6) return "Weak";
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return "Strong";
    return "Medium";
  };

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

      setLoading(true);

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

      await axios.post("http://localhost:8081/api/analyst/register", formData);

      toast.success("Analyst request submitted. Wait for admin approval.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-10 text-white space-y-5">
        
        {/* Branding */}
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-widest text-sky-400">
            IP Intelligence
          </h1>
          <p className="text-sm text-gray-300">Create your professional account</p>
          <p className="text-xs text-indigo-300 mt-1">🔒 Secure • ✅ Verified • 🏢 Enterprise-Grade</p>
        </div>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          className="input-field"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="input-field"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {form.password && (
          <p className="text-xs mt-1">
            Strength:{" "}
            <span
              className={
                getPasswordStrength(form.password) === "Strong"
                  ? "text-green-400"
                  : getPasswordStrength(form.password) === "Medium"
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {getPasswordStrength(form.password)}
            </span>
          </p>
        )}

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm password"
          className={`input-field ${
            form.confirmPassword && form.confirmPassword !== form.password
              ? "border-red-500"
              : ""
          }`}
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />

        {/* Role Cards */}
        <div className="flex gap-3">
          {["USER", "ANALYST"].map((r) => (
            <div
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`flex-1 text-center p-3 rounded-xl border cursor-pointer transition ${
                form.role === r
                  ? "bg-sky-600 border-sky-400 font-semibold"
                  : "bg-slate-700 border-white/20"
              }`}
            >
              {r}
            </div>
          ))}
        </div>

        {/* Analyst Section */}
        {form.role === "ANALYST" && (
          <>
            <select
              className="input-field"
              value={form.documentType}
              onChange={(e) => setForm({ ...form, documentType: e.target.value })}
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
              onChange={(e) => setForm({ ...form, proofFile: e.target.files[0] })}
            />
          </>
        )}

        {/* Buttons */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-sky-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-xl border border-white/30 hover:bg-white/10 transition"
        >
          Back to Login
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6 mb-2">
          <button className="hover:text-sky-400 transition">Privacy Policy</button>
          <button className="hover:text-sky-400 transition">Terms of Use</button>
          <button className="hover:text-sky-400 transition">Contact</button>
        </div>
        © 2026 Global IP Intelligence Platform
      </footer>

      {/* Styles */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: #1e293b;
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #38bdf8;
          outline: none;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.2);
        }
      `}</style>
    </div>
  );
}
