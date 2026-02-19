import { getUser } from "../utils/auth";
import { useState } from "react";
 
export default function UserDashboard() {
  const user = getUser();
  const [showProfile, setShowProfile] = useState(false);
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 sm:px-10 py-16">

      {/* Welcome Banner */}
      <div className="mb-14">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
          Welcome, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {user.username}
          </span> 👋
        </h1>
        <p className="text-slate-500 mt-3 text-sm sm:text-base max-w-xl">
          Explore your intellectual property insights with precision and clarity.
        </p>
      </div>
 
      {/* Profile Button */}
      <div className="mb-12">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="px-8 py-3 rounded-2xl font-medium text-white
          bg-gradient-to-r from-indigo-600 to-purple-600
          shadow-[0_10px_30px_rgba(79,70,229,0.4)]
          hover:shadow-[0_15px_40px_rgba(79,70,229,0.5)]
          hover:-translate-y-1
          active:scale-95
          transition-all duration-300"
        >
          {showProfile ? "Hide Profile" : "View Profile"}
        </button>
      </div>
 
      {/* Profile Details */}
      {showProfile && (
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl 
        shadow-[0_30px_80px_rgba(0,0,0,0.08)] 
        hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)]
        border border-white/50
        transition-all duration-500 mb-14">
          
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">
            My Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 text-slate-700">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Date of Birth:</strong> {user.dob}</p>
            <p><strong>Gender:</strong> {user.gender}</p>
            <p><strong>Nationality:</strong> {user.nationality}</p>
            <p><strong>State:</strong> {user.state}</p>
            <p><strong>City:</strong> {user.city}</p>
            <p><strong>Country:</strong> {user.country}</p>
            <p><strong>Theme:</strong> {user.theme}</p>
          </div>
        </div>
      )}
 
      {/* Search Section */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl 
      shadow-[0_30px_80px_rgba(0,0,0,0.08)]
      hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)]
      border border-white/50
      transition-all duration-500 mb-14">
        
        <h2 className="text-2xl font-semibold text-slate-900 mb-8">
          Search IP
        </h2>

        <input
          type="text"
          placeholder="Search patent..."
          className="w-full px-5 py-4 rounded-2xl border border-slate-200
          bg-white shadow-inner
          focus:ring-2 focus:ring-indigo-500
          focus:border-indigo-500
          outline-none transition-all duration-300 mb-6"
        />

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-full font-medium cursor-pointer hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Patent
          </span>
          <span className="px-5 py-2 bg-purple-50 text-purple-600 rounded-full font-medium cursor-pointer hover:bg-purple-600 hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Trademark
          </span>
          <span className="px-5 py-2 bg-pink-50 text-pink-600 rounded-full font-medium cursor-pointer hover:bg-pink-600 hover:text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            Copyright
          </span>
        </div>
      </div>
 
      {/* Saved Searches */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.08)] mb-14 border border-slate-100 transition-all hover:shadow-[0_35px_90px_rgba(0,0,0,0.12)] duration-500">
        
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          Saved Searches
        </h3>
        <ul className="space-y-3 text-slate-600">
          <li className="hover:text-indigo-600 hover:translate-x-1 transition-all duration-300 cursor-pointer">
            Patent filings in 2025
          </li>
          <li className="hover:text-indigo-600 hover:translate-x-1 transition-all duration-300 cursor-pointer">
            Trademark disputes in India
          </li>
        </ul>
      </div>
 
      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.08)] mb-14 border border-slate-100 transition-all hover:shadow-[0_35px_90px_rgba(0,0,0,0.12)] duration-500">
        
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          Recent Activity
        </h3>
        <ul className="space-y-4 text-slate-600">
          <li className="hover:text-indigo-600 transition-all duration-300">
            🔍 You searched for Filing X yesterday
          </li>
          <li className="hover:text-indigo-600 transition-all duration-300">
            📌 You pinned Filing Y last week
          </li>
        </ul>
      </div>
 
      {/* Achievements */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.08)] border border-slate-100 transition-all hover:shadow-[0_35px_90px_rgba(0,0,0,0.12)] duration-500">
        
        <h3 className="text-xl font-semibold text-slate-900 mb-8">
          Achievements
        </h3>

        <div className="flex flex-wrap gap-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            🏅 
            <p className="text-sm mt-3 font-medium">First Search Completed</p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-emerald-600 text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            ⭐ 
            <p className="text-sm mt-3 font-medium">10 Filings Tracked</p>
          </div>
        </div>
      </div>

    </div>
  );
}
