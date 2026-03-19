
import { useLocation, useNavigate } from "react-router-dom";

export default function UserPatentDetailPage(){

  const location = useLocation();
  const navigate = useNavigate();

  const patent = location.state?.patent;

  if(!patent){
    return(
      <div className="text-red-400 p-6">
        Patent data not found.
      </div>
    );
  }

  return(

    <div className="space-y-8 text-white">

      {/* BACK BUTTON */}

      <button
        onClick={()=>navigate(-1)}
        className="
        bg-indigo-600
        px-5
        py-2
        rounded-lg
        hover:bg-indigo-700
        shadow
        hover:shadow-indigo-500/40
        transition
        "
      >
        ← Back
      </button>


      {/* TITLE CARD */}

      <div
      className="
      bg-slate-800
      border border-slate-700
      p-8
      rounded-xl
      shadow-xl
      hover:shadow-indigo-500/20
      transition
      "
      >

        <h1
        className="
        text-2xl
        font-bold
        text-indigo-400
        mb-4
        "
        >
          {patent.title}
        </h1>

        <div className="flex flex-wrap gap-6 text-gray-400 text-sm">

          <p>
            Patent #: {patent.docNumber}
          </p>

          <p>
            Jurisdiction: {patent.jurisdiction}
          </p>

          <p>
            Published: {patent.datePublished}
          </p>

        </div>

      </div>



      {/* INFORMATION GRID */}

      <div className="grid md:grid-cols-2 gap-6">

        <Info label="Lens ID" value={patent.lensId}/>
        <Info label="Kind Code" value={patent.kind}/>
        <Info label="Publication Type" value={patent.publicationType}/>
        <Info label="Legal Status Code" value={patent.legalStatusCode}/>

      </div>



      {/* APPLICANTS */}

      <Section title="Applicants">

        {patent.applicants?.map((a,i)=>(
          <Tag key={i} text={a}/>
        ))}

      </Section>



      {/* INVENTORS */}

      <Section title="Inventors">

        {patent.inventors?.map((i,index)=>(
          <Tag key={index} text={i}/>
        ))}

      </Section>



      {/* ABSTRACT */}

      <Section title="Abstract">

        <p className="text-gray-300 leading-relaxed">
          {patent.abstract}
        </p>

      </Section>


    </div>

  );

}



/* INFO CARD */

function Info({label,value}){

  return(

    <div
    className="
    bg-slate-800
    border border-slate-700
    p-6
    rounded-xl
    shadow-lg
    hover:shadow-indigo-500/20
    transition
    "
    >

      <p className="text-gray-400 text-sm">
        {label}
      </p>

      <p className="text-white font-semibold mt-1">
        {value || "N/A"}
      </p>

    </div>

  );

}



/* SECTION */

function Section({title,children}){

  return(

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
        {title}
      </h3>

      {children}

    </div>

  );

}



/* TAG */

function Tag({text}){

  return(

    <span
    className="
    inline-block
    bg-indigo-600
    text-white
    text-sm
    px-4
    py-1
    rounded-full
    mr-2
    mb-2
    shadow
    hover:bg-indigo-700
    transition
    "
    >
      {text}
    </span>

  );

}
