import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser, logout } from "../utils/auth";

const Profile = () => {
  const navigate = useNavigate();
  const loggedUser = getUser();

  // ✅ Hooks ALWAYS at top
  const [user, setUser] = useState(loggedUser);
  const [editing, setEditing] = useState(false);

  // ✅ Access check AFTER hooks
  if (!loggedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-red-500">
          No user logged in
        </h2>
      </div>
    );
  }

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({ ...user, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const allUsers =
      JSON.parse(localStorage.getItem("allUsers")) || [];

    const updatedUsers = allUsers.map((u) =>
      u.username === user.username ? { ...u, ...user } : u
    );

    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    localStorage.setItem("loggedUser", JSON.stringify(user));

    toast.success("Profile updated successfully 🚀");
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully 👋");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl bg-white p-10 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">
          Profile
        </h2>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src={
                user?.photo ||
                `https://ui-avatars.com/api/?name=${user?.username}`
              }
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-md"
            />

            {editing && (
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white px-3 py-1 text-xs rounded-full cursor-pointer hover:bg-indigo-700 transition">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            )}
          </div>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input name="username" value={user.username} disabled />

            <Input
              name="email"
              value={user.email}
              onChange={handleChange}
            />

            <Input
              name="phone"
              value={user.phone || ""}
              onChange={handleChange}
              placeholder="Phone"
            />

            <Input
              type="date"
              name="dob"
              value={user.dob || ""}
              onChange={handleChange}
            />

            <Input
              name="gender"
              value={user.gender || ""}
              onChange={handleChange}
              placeholder="Gender"
            />

            <Input name="role" value={user.role} disabled />

            <button
              onClick={handleSave}
              className="md:col-span-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info label="Username" value={user.username} />
            <Info label="Email" value={user.email} />
            <Info label="Phone" value={user.phone || "N/A"} />
            <Info label="Role" value={user.role} />

            <div className="md:col-span-2 flex gap-4 mt-6">
              <button
                onClick={() => setEditing(true)}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition"
              >
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 border border-red-400 text-red-600 py-3 rounded-xl hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Input = (props) => (
  <input
    {...props}
    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
  />
);

const Info = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <strong className="block text-gray-500 text-sm">
      {label}
    </strong>
    <p className="text-gray-800 font-medium">
      {value}
    </p>
  </div>
);

export default Profile;