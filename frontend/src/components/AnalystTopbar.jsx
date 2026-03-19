
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalystTopbar() {

  const navigate = useNavigate();

  return (

    <div
      className="
      fixed
      top-0
      left-0
      right-0
      h-16
      px-8
      flex
      items-center
      justify-between
      bg-slate-900
      border-b
      border-slate-700
      shadow-xl
      z-50
      "
    >

      {/* LEFT SIDE */}

      <div className="flex items-center gap-6">

        <h1
          className="
          text-lg
          font-extrabold
          bg-gradient-to-r
          from-indigo-400
          to-purple-500
          bg-clip-text
          text-transparent
          "
        >
          Global IP Intelligence Platform
        </h1>

      </div>


      {/* RIGHT SIDE */}

      <div className="flex items-center gap-6">

        {/* NOTIFICATION */}

        <div
          className="
          p-2
          rounded-lg
          bg-slate-800
          border border-slate-700
          hover:bg-slate-700
          cursor-pointer
          transition
          "
        >
          <Bell size={18} className="text-gray-300" />
        </div>


        {/* PROFILE ICON */}

        <div
          onClick={() => navigate("/analyst/profile")}
          className="
          w-9
          h-9
          rounded-full
          bg-gradient-to-r
          from-indigo-500
          to-purple-500
          flex
          items-center
          justify-center
          text-white
          font-semibold
          shadow-md
          cursor-pointer
          hover:scale-105
          transition
          "
        >
          <User size={16}/>
        </div>

      </div>

    </div>

  );

}

