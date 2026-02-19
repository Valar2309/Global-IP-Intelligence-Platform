import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    return (
      savedUser || {
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        profilePic: "",
        role: "",
        profileComplete: false,
      }
    );
  });

  const [editing, setEditing] = useState(() => !user.profileComplete);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () =>
      setUser({ ...user, profilePic: reader.result });
    if (file) reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!user.name || !user.email || !user.phone || !user.role) {
      toast.error("Please fill all required fields ⚠️");
      return;
    }

    const updatedUser = { ...user, profileComplete: true };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);

    toast.success("Profile Updated Successfully 🚀");

    if (updatedUser.role === "USER") navigate("/user");
    if (updatedUser.role === "ANALYST") navigate("/analyst");
    if (updatedUser.role === "ADMIN") navigate("/admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.info("Logged out successfully 👋");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-4 sm:px-6 py-16">

      <div className="w-full max-w-4xl bg-white rounded-3xl 
        shadow-[0_40px_120px_rgba(0,0,0,0.12)] 
        hover:shadow-[0_60px_140px_rgba(0,0,0,0.18)]
        transition-all duration-500 border border-slate-200">

        <div className="p-6 sm:p-10 md:p-14">

          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">
              Professional Profile
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Manage your personal & professional details
            </p>
          </div>

          {/* Profile Image */}
          <div className="flex justify-center mb-10">
            <div className="relative group">
              <img
                src={user.profilePic || "https://via.placeholder.com/150"}
                alt="profile"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover 
                  border-4 border-indigo-500 
                  shadow-xl 
                  group-hover:scale-105 
                  group-hover:shadow-2xl 
                  transition-all duration-500"
              />
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

const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white shadow-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 hover:shadow-md outline-none transition-all duration-300"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white shadow-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 hover:shadow-md outline-none transition-all duration-300"
  >
    {children}
  </select>
);

const InfoCard = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <strong className="block text-slate-500 text-sm mb-1">{label}</strong>
    <p className="text-slate-800 font-medium">{value}</p>
  </div>
);

export default Profile;
