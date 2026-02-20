import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getUser, logout } from "../utils/auth";

const Profile = () => {
  const navigate = useNavigate();
  const loggedUser = getUser();

  if (!loggedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-red-500">
          No user logged in
        </h2>
      </div>
    );
  }

  const [user, setUser] = useState(loggedUser);
  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ✅ Profile Photo Upload
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

    localStorage.setItem(
      "allUsers",
      JSON.stringify(updatedUsers)
    );

    localStorage.setItem(
      "loggedUser",
      JSON.stringify(user)
    );

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

        {/* ✅ Profile Picture */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src={
                user.photo ||
                "https://ui-avatars.com/api/?name=" +
                  user.username
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

            <Input
              name="username"
              value={user.username}
              disabled
            />

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
              name="dob"
              type="date"
              value={user.dob || ""}
              onChange={handleChange}
            />

            <Input
              name="gender"
              value={user.gender || ""}
              onChange={handleChange}
              placeholder="Gender"
            />

            <Input
              name="role"
              value={user.role}
              disabled
            />

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

          {editing ? (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <input
                type="file"
                onChange={handleImage}
                className="col-span-1 md:col-span-2"
              />

              <Input name="name" value={user.name} onChange={handleChange} placeholder="Full Name" />
              <Input name="email" value={user.email} onChange={handleChange} placeholder="Email Address" />
              <Input name="phone" value={user.phone} onChange={handleChange} placeholder="Phone Number" />
              <Input type="date" name="dob" value={user.dob} onChange={handleChange} />

              <Select name="gender" value={user.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>

              <Select name="role" value={user.role} onChange={handleChange}>
                <option value="">Select Role</option>
                <option value="USER">User</option>
                <option value="ANALYST">Analyst</option>
                <option value="ADMIN">Admin</option>
              </Select>

              <button
                type="button"
                onClick={() => toast.info("Password reset link sent 📩")}
                className="col-span-1 md:col-span-2 border border-slate-300 py-3 rounded-xl font-medium hover:bg-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                Reset Password
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="col-span-1 md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Save Profile
              </button>

            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <InfoCard label="Name" value={user.name} />
              <InfoCard label="Email" value={user.email} />
              <InfoCard label="Phone" value={user.phone} />
              <InfoCard label="Role" value={user.role} />

              <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  Edit
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 border border-red-300 text-red-600 py-3 rounded-xl hover:bg-red-50 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  Logout
                </button>
              </div>

            </div>
          )}

        </div>
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
