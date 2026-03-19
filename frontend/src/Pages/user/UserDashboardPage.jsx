import { useEffect, useState } from "react";
import axios from "axios";
import StatCard from "../../components/StatCard";

export default function UserDashboardPage() {

  const [patents,setPatents] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    fetchPatents();
  },[]);


  const fetchPatents = async()=>{

    try{

      const res = await axios.get(
        "http://localhost:8081/api/search",
        {
          params:{
            q:"artificial intelligence",
            type:"PATENT",
            page:0,
            size:20
          }
        }
      );

      setPatents(res.data.results || []);

    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }

  };


  /* KPI */

  const total = patents.length;

  const active = patents.filter(p=>p.patentStatus==="ACTIVE").length;

  const pending = patents.filter(p=>p.patentStatus==="PENDING").length;

  const discontinued = patents.filter(p=>p.patentStatus==="DISCONTINUED").length;


  if(loading){
    return(
      <div className="text-gray-400 text-lg">
        Loading dashboard...
      </div>
    );
  }


  return(

    <div className="space-y-10 text-white">


      {/* TITLE */}

      <h2
      className="
      text-3xl
      font-extrabold
      bg-gradient-to-r
      from-indigo-400
      to-purple-500
      bg-clip-text
      text-transparent
      ">
        My Patent Dashboard
      </h2>



      {/* KPI CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <StatCard
          title="Total Patents"
          value={total}
          color="text-indigo-400"
        />

        <StatCard
          title="Active"
          value={active}
          color="text-green-400"
        />

        <StatCard
          title="Pending"
          value={pending}
          color="text-yellow-400"
        />

        <StatCard
          title="Discontinued"
          value={discontinued}
          color="text-red-400"
        />

      </div>



      {/* PORTFOLIO OVERVIEW */}

      <div
      className="
      bg-slate-800
      border border-slate-700
      p-6
      rounded-xl
      shadow-xl
      hover:shadow-indigo-500/20
      transition
      "
      >

        <h3 className="text-indigo-400 font-semibold mb-4">
          Portfolio Overview
        </h3>

        <p className="text-gray-400">
          You currently have
          <span className="text-white font-semibold"> {total} patents </span>
          tracked in your portfolio. Monitor status changes,
          publication updates, and jurisdiction coverage here.
        </p>

      </div>



      {/* RECENT PATENTS */}

      <div
      className="
      bg-slate-800
      border border-slate-700
      p-6
      rounded-xl
      shadow-xl
      hover:shadow-indigo-500/20
      transition
      "
      >

        <h3 className="text-indigo-400 font-semibold mb-4">
          Recent Patents
        </h3>

        <div className="space-y-4 max-h-80 overflow-y-auto">

          {patents.slice(0,5).map(p=>(

            <div
              key={p.lensId}
              className="
              bg-slate-900
              p-4
              rounded-lg
              border border-slate-700
              hover:border-indigo-500
              hover:shadow-lg
              transition
              "
            >

              <p className="font-semibold text-white">
                {p.title}
              </p>

              <p className="text-sm text-gray-400">
                {p.applicants?.[0]} • {p.jurisdiction}
              </p>

              <p className="text-xs text-gray-500">
                {p.datePublished} • {p.patentStatus}
              </p>

            </div>

          ))}

        </div>

      </div>


    </div>

  );

}