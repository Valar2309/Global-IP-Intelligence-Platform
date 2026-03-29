import { LogOut } from "lucide-react";

export default function AdminTopbar({ handleLogout }) {
  return (
    <div className="bg-slate-900 px-10 py-5 flex justify-between items-center border-b border-slate-800">

      <h1 className="text-2xl text-indigo-400 font-bold">
        Admin Control Panel
      </h1>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg"
      >
        <LogOut size={16}/> Logout
      </button>

    </div>
  );
}