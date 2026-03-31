import { Bell, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserTopbar(){

  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "";

  const logout = () => {

    localStorage.clear();
    navigate("/login");

  };

  return(

    <header
    className="
    h-16
    border-b border-white/10
    flex items-center justify-between
    px-6
    bg-slate-900
    text-white
    "
    >

      {/* PLATFORM TITLE */}

      <h1 className="
      font-semibold
      text-lg
      text-indigo-400
      ">
        Global IP Intelligence Platform
      </h1>



      {/* RIGHT SECTION */}

      <div className="flex items-center gap-6">


        {/* NOTIFICATION */}

        <div
        className="
        p-2
        rounded-lg
        hover:bg-slate-800
        cursor-pointer
        transition
        "
        >
          <Bell className="text-gray-400"/>
        </div>



        {/* PROFILE */}

        <div className="flex items-center gap-3">

          {/* AVATAR */}

          <div
          className="
          w-9 h-9
          rounded-full
          bg-indigo-600
          flex items-center justify-center
          font-semibold
          "
          >
            {username.charAt(0).toUpperCase()}
          </div>


          {/* USER INFO */}

          <div className="hidden md:block">

            <p className="text-sm font-semibold">
              {username}
            </p>

            <p className="text-xs text-gray-400">
              {email}
            </p>

          </div>

        </div>



        {/* LOGOUT */}

        <button
        onClick={logout}
        className="
        flex items-center gap-2
        bg-red-600
        px-4 py-2
        rounded-lg
        hover:bg-red-700
        shadow
        hover:shadow-red-500/40
        transition
        "
        >

          <LogOut size={16}/>

          Logout

        </button>


      </div>

    </header>

  );

}