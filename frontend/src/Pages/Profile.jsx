import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { User, Mail, Shield, Building, Phone } from "lucide-react";

const Profile = () => {

  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {

    if (!token) {
      navigate("/login");
      return;
    }

    try {

      let endpoint = "";

      if (role === "ADMIN") {
        endpoint = "http://localhost:8081/api/admin/me";
      } else if (role === "ANALYST") {
        endpoint = "http://localhost:8081/api/analyst/me";
      } else {
        endpoint = "http://localhost:8081/api/user/me";
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(res.data);

    } catch (error) {

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } else {
        toast.error("Failed to load profile.");
      }

    } finally {
      setLoading(false);
    }

  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Logged out successfully 👋");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="p-10 text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10 text-gray-400">
        No profile data found.
      </div>
    );
  }

  return (

    <div className="space-y-10 text-white">

      {/* TITLE */}

      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
        My Profile
      </h2>


      {/* PROFILE CARD */}

      <div className="
        bg-slate-800
        border border-slate-700
        rounded-xl
        shadow-xl
        hover:shadow-indigo-500/20
        transition
        p-8
        max-w-4xl
      ">

        {/* HEADER */}

        <div className="flex items-center gap-6 mb-10">

          {/* AVATAR */}

          <div className="
            w-16 h-16
            rounded-full
            bg-gradient-to-r
            from-indigo-500
            to-purple-500
            flex items-center justify-center
            text-white
            text-xl
            font-bold
            shadow-md
          ">
            {user.username?.charAt(0).toUpperCase()}
          </div>


          {/* USER INFO */}

          <div>

            <h3 className="text-xl font-semibold text-white">
              {user.username}
            </h3>

            <p className="text-gray-400">
              {user.email}
            </p>

            <span className="
              inline-block
              mt-2
              text-xs
              px-3
              py-1
              rounded-full
              bg-indigo-600
              text-white
              shadow
            ">
              {role}
            </span>

          </div>

        </div>


        {/* INFO GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Info icon={<User size={16}/>} label="Username" value={user.username}/>
          <Info icon={<Mail size={16}/>} label="Email" value={user.email}/>
          <Info icon={<Shield size={16}/>} label="Role" value={role}/>

          {user.organization && (
            <Info
              icon={<Building size={16}/>}
              label="Organization"
              value={user.organization}
            />
          )}

          {user.phone && (
            <Info
              icon={<Phone size={16}/>}
              label="Phone"
              value={user.phone}
            />
          )}

        </div>


        {/* ACTIONS */}

        <div className="mt-10">

          <button
            onClick={handleLogout}
            className="
            bg-red-600
            hover:bg-red-700
            text-white
            px-6
            py-3
            rounded-lg
            shadow
            hover:shadow-red-500/30
            transition
            "
          >
            Logout
          </button>

        </div>

      </div>

    </div>

  );

};


/* INFO COMPONENT */

const Info = ({ icon, label, value }) => (

  <div className="
    bg-slate-900
    border border-slate-700
    rounded-lg
    p-4
    flex items-start gap-3
    shadow
    hover:shadow-indigo-500/10
    transition
  ">

    <div className="text-indigo-400 mt-1">
      {icon}
    </div>

    <div>

      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="text-white font-medium">
        {value}
      </p>

    </div>

  </div>

);

export default Profile;

