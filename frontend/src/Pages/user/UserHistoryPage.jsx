import { useEffect, useState } from "react";
import axios from "axios";

export default function UserHistoryPage(){

  const [history,setHistory] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    fetchHistory();
  },[]);


  const fetchHistory = async()=>{

    try{

      /* अभी demo data */
      const data = [
        {
          id:1,
          action:"Viewed Patent",
          title:"AI Edge Node and Edge AI System",
          date:"2026-03-01"
        },
        {
          id:2,
          action:"Saved Patent",
          title:"AI Caregiver Matching Device",
          date:"2026-02-20"
        },
        {
          id:3,
          action:"Exported Patent Data",
          title:"AI Implemented AI Termination",
          date:"2026-02-10"
        }
      ];

      setHistory(data);

    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }

  };


  if(loading){
    return(
      <div className="text-gray-400 text-lg">
        Loading history...
      </div>
    );
  }



  return(

    <div className="space-y-10 text-white">


      {/* TITLE */}

      <h2 className="
      text-3xl
      font-extrabold
      bg-gradient-to-r
      from-indigo-400
      to-purple-500
      bg-clip-text
      text-transparent
      ">
        Activity History
      </h2>



      {/* HISTORY LIST */}

      <div className="space-y-4">

        {history.map(item=>(

          <div
            key={item.id}
            className="
            bg-slate-800
            border border-slate-700
            p-6
            rounded-xl
            shadow-xl
            hover:shadow-indigo-500/20
            transition
            flex
            justify-between
            items-center
            "
          >

            <div>

              <p className="text-indigo-400 font-semibold">
                {item.action}
              </p>

              <p className="text-gray-300 text-sm">
                {item.title}
              </p>

            </div>

            <div className="text-gray-400 text-sm">
              {item.date}
            </div>

          </div>

        ))}

      </div>


    </div>

  );

}