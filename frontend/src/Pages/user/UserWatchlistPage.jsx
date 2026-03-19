import { useState } from "react";

export default function UserWatchlistPage(){

  const [watchlist,setWatchlist] = useState([
    {
      lensId:"123",
      title:"AI Edge Node and Edge AI System",
      applicant:"SK TELECOM",
      jurisdiction:"KR",
      date:"2026-01-12"
    },
    {
      lensId:"124",
      title:"AI Caregiver AI Matching Device",
      applicant:"MEDICUS HOLDINGS",
      jurisdiction:"KR",
      date:"2023-01-26"
    },
    {
      lensId:"125",
      title:"AI Implemented AI Termination",
      applicant:"BANK OF AMERICA",
      jurisdiction:"US",
      date:"2025-01-30"
    }
  ]);


  const removeFromWatchlist = (id)=>{

    setWatchlist(watchlist.filter(p=>p.lensId !== id));

  };


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
        My Watchlist
      </h2>



      {/* WATCHLIST GRID */}

      {watchlist.length === 0 ?(

        <div className="text-gray-400">
          No patents in watchlist.
        </div>

      ):(
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {watchlist.map(p=>(

            <div
              key={p.lensId}
              className="
              bg-slate-800
              border border-slate-700
              p-6
              rounded-xl
              shadow-xl
              hover:-translate-y-1
              hover:shadow-indigo-500/30
              hover:border-indigo-500
              transition
              "
            >

              {/* TITLE */}

              <h3 className="text-indigo-400 font-semibold mb-3 line-clamp-2">
                {p.title}
              </h3>


              {/* INFO */}

              <p className="text-gray-400 text-sm">
                Applicant: {p.applicant}
              </p>

              <p className="text-gray-400 text-sm">
                Jurisdiction: {p.jurisdiction}
              </p>

              <p className="text-gray-500 text-sm">
                Published: {p.date}
              </p>



              {/* REMOVE BUTTON */}

              <button
                onClick={()=>removeFromWatchlist(p.lensId)}
                className="
                mt-4
                w-full
                bg-red-600
                py-2
                rounded-lg
                hover:bg-red-700
                shadow
                hover:shadow-red-500/40
                transition
                "
              >
                Remove
              </button>

            </div>

          ))}

        </div>
      )}

    </div>

  );

}