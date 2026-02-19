import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllUsers, saveUser } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleLogin = () => {
    const users = getAllUsers();

    const user = users.find(
      (u) =>
        u.username === form.username &&
        u.password === form.password
    );

    if (!user) {
      toast.error("Invalid username or password ❌");
      return;
    }

    // ✅ CORRECT STORAGE KEY
    saveUser(user);

    toast.success("Login successful 🎉");

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
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4">

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-200">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2.5 rounded-xl border border-gray-300"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-5 px-4 py-2.5 rounded-xl border border-gray-300"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={handleLogin}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Login
        </button>

      </div>
    </div>
  );
}
