import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);  // 👈 important fix

  if (!user) {
    return null;  // blank render avoid error
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <h3 className="text-lg text-blue-600 mb-2">
          Welcome, {user.name}
        </h3>
        <p className="text-gray-600 mb-6">{user.email}</p>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/");
          }}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
