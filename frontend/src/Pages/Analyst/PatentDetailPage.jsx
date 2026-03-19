
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart, Line,
  XAxis, YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function PatentDetailPage() {

  const location = useLocation();
  const navigate = useNavigate();

  const patent = location.state?.patent;

  if (!patent) {
    return (
      <p className="p-10 text-red-500">
        Patent data not available.
      </p>
    );
  }

  const getStatusColor = (status) => {

    switch (status) {

      case "ACTIVE":
        return "bg-green-600";

      case "PENDING":
        return "bg-yellow-500";

      case "DISCONTINUED":
        return "bg-red-600";

      default:
        return "bg-gray-600";

    }

  };

  const timeline = [
    { year: 2018, value: 1 },
    { year: 2019, value: 3 },
    { year: 2020, value: 6 },
    { year: 2021, value: 8 },
    { year: 2022, value: 10 }
  ];

  return (

    <div className="space-y-10 text-white">

      {/* BACK BUTTON */}

      <button
        onClick={() => navigate(-1)}
        className="
        bg-indigo-600 hover:bg-indigo-700
        text-white
        px-5 py-2
        rounded-lg
        shadow
        hover:shadow-indigo-500/40
        transition
        "
      >
        ← Back
      </button>


      {/* HEADER */}

      <div className="
      bg-gradient-to-r
      from-slate-800
      to-slate-900
      border border-slate-700
      p-8
      rounded-xl
      shadow-xl
      ">

        <h1 className="
        text-3xl
        font-extrabold
        text-indigo-400
        mb-4
        ">
          {patent.title}
        </h1>

        <div className="flex flex-wrap gap-4 items-center">

          <span className={`px-4 py-1 text-xs rounded-full text-white ${getStatusColor(patent.patentStatus)}`}>
            {patent.patentStatus}
          </span>

          <span className="text-gray-400">
            Patent #: {patent.docNumber}
          </span>

          <span className="text-gray-400">
            Jurisdiction: {patent.jurisdiction}
          </span>

        </div>

      </div>


      {/* BASIC INFORMATION */}

      <Section title="Patent Information">

        <div className="grid md:grid-cols-3 gap-6">

          <Info label="Lens ID" value={patent.lensId} />
          <Info label="Kind Code" value={patent.kind} />
          <Info label="Publication Type" value={patent.publicationType} />
          <Info label="Publication Date" value={patent.datePublished} />
          <Info label="Legal Status Code" value={patent.legalStatusCode} />

        </div>

      </Section>


      {/* APPLICANTS */}

      <Section title="Applicants">

        {patent.applicants?.map((a, i) => (
          <Tag key={i} text={a} />
        ))}

      </Section>


      {/* INVENTORS */}

      <Section title="Inventors">

        {patent.inventors?.map((i, index) => (
          <Tag key={index} text={i} />
        ))}

      </Section>


      {/* ABSTRACT */}

      <Section title="Abstract">

        <p className="leading-relaxed text-gray-300">
          {patent.abstract}
        </p>

      </Section>


      {/* TIMELINE */}

      <Section title="Patent Activity Timeline">

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={timeline}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="year" />
            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </Section>


      {/* SIMILAR PATENTS */}

      <Section title="Similar Patents">

        <div className="grid md:grid-cols-3 gap-6">

          <SimilarCard />

          <SimilarCard />

          <SimilarCard />

        </div>

      </Section>

    </div>

  );

}


/* INFO CARD */

function Info({ label, value }) {

  return (

    <div className="
    bg-slate-800
    border border-slate-700
    p-6
    rounded-xl
    shadow-lg
    hover:-translate-y-1
    hover:shadow-indigo-500/20
    transition
    ">

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

function Section({ title, children }) {

  return (

    <div className="
    bg-slate-800
    border border-slate-700
    p-6
    rounded-xl
    shadow-xl
    hover:shadow-indigo-500/20
    transition
    ">

      <h3 className="text-indigo-400 font-semibold mb-4">
        {title}
      </h3>

      {children}

    </div>

  );

}


/* TAG */

function Tag({ text }) {

  return (

    <span className="
    inline-block
    bg-indigo-600
    text-white
    text-sm
    px-4 py-1
    rounded-full
    mr-2 mb-2
    shadow
    hover:bg-indigo-700
    transition
    ">
      {text}
    </span>

  );

}


/* SIMILAR PATENT CARD */

function SimilarCard() {

  return (

    <div className="
    bg-slate-800
    border border-slate-700
    p-5
    rounded-xl
    shadow
    hover:-translate-y-1
    hover:shadow-indigo-500/20
    transition
    cursor-pointer
    ">

      <p className="text-indigo-400 font-semibold text-sm">
        Neural Network Optimization
      </p>

      <p className="text-gray-400 text-xs mt-1">
        Applicant: Google
      </p>

    </div>

  );

}

