import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserSearchPage(){

  const [keyword,setKeyword] = useState("");
  const [results,setResults] = useState([]);
  const navigate = useNavigate();

  const search = async()=>{

    if(!keyword.trim()) return;

    try{

      const res = await axios.get(
        "http://localhost:8081/api/search",
        {
          params:{
            q:keyword,
            type:"PATENT",
            page:0,
            size:20
          }
        }
      );

      setResults(res.data.results || []);

    }catch(err){
      console.error(err);
    }

  };

  return(

    <div className="space-y-16 text-white">

      {/* TITLE */}

      <h1
        className="
        text-4xl
        font-extrabold
        bg-gradient-to-r
        from-indigo-400
        to-purple-500
        bg-clip-text
        text-transparent
        "
      >
        Patent Search
      </h1>


      {/* LARGE SEARCH BAR */}

      <div className="w-full flex justify-center">

        <div
          className="
          w-full
          max-w-7xl
          flex gap-6
          bg-slate-800
          border border-slate-700
          p-6
          rounded-3xl
          shadow-2xl
          hover:shadow-indigo-500/20
          transition
          "
        >

          <input
            value={keyword}
            onChange={(e)=>setKeyword(e.target.value)}
            className="
            flex-1
            bg-slate-900
            border border-slate-700
            px-8
            py-5
            text-xl
            rounded-2xl
            text-white
            placeholder-gray-400
            outline-none
            focus:border-indigo-500
            focus:ring-2
            focus:ring-indigo-500/40
            transition
            "
            placeholder="Search patents (Artificial Intelligence, Robotics, Blockchain...)"
          />

          <button
            onClick={search}
            className="
            bg-indigo-600
            px-12
            py-5
            text-xl
            rounded-2xl
            font-semibold
            shadow-lg
            hover:bg-indigo-700
            hover:shadow-indigo-500/40
            hover:scale-105
            transition
            "
          >
            Search
          </button>

        </div>

      </div>



      {/* RESULTS */}

      {results.length>0 &&(

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {results.map(p=>(

            <div
              key={p.lensId}
              onClick={()=>navigate(`/user/patent/${p.lensId}`,{state:{patent:p}})}
              className="
              bg-slate-800
              border border-slate-700
              p-6
              rounded-2xl
              shadow-xl
              hover:-translate-y-2
              hover:shadow-indigo-500/40
              hover:border-indigo-500
              transition
              cursor-pointer
              group
              "
            >

              <h3
                className="
                text-indigo-400
                font-semibold
                text-lg
                mb-3
                line-clamp-2
                group-hover:text-indigo-300
                transition
                "
              >
                {p.title}
              </h3>

              <p className="text-gray-400 text-sm mb-1">
                Applicant: {p.applicants?.[0]}
              </p>

              <p className="text-gray-400 text-sm mb-1">
                Jurisdiction: {p.jurisdiction}
              </p>

              <p className="text-gray-500 text-sm">
                Published: {p.datePublished}
              </p>

              <div
                className="
                mt-4
                text-xs
                text-indigo-400
                opacity-0
                group-hover:opacity-100
                transition
                "
              >
                View Patent →
              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}