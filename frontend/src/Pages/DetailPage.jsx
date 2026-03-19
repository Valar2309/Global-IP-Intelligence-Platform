import { useLocation, useNavigate } from "react-router-dom";

export default function PatentDetailPage() {

  const location = useLocation();
  const navigate = useNavigate();

  const patent = location.state?.patent;

  if (!patent) {
    return (
      <p className="p-10 text-red-500">
        No patent data available.
      </p>
    );
  }

  return (

    <div className="p-10 min-h-screen bg-slate-900 text-white">

      {/* BACK */}

      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
      >
        ← Back
      </button>

      {/* TITLE */}

      <h1 className="text-3xl font-bold text-indigo-400 mb-6">
        {patent.title}
      </h1>

      {/* INFO GRID */}

      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <Info label="Patent Number" value={patent.docNumber} />
        <Info label="Jurisdiction" value={patent.jurisdiction} />
        <Info label="Publication Date" value={patent.datePublished} />
        <Info label="Status" value={patent.patentStatus} />

      </div>

      {/* APPLICANTS */}

      <Section title="Applicants">

        {patent.applicants?.join(", ")}

      </Section>

      {/* INVENTORS */}

      <Section title="Inventors">

        {patent.inventors?.join(", ")}

      </Section>

      {/* ABSTRACT */}

      <Section title="Abstract">

        {patent.abstract}

      </Section>

    </div>

  );

}

function Info({ label, value }) {

  return (

    <div className="bg-slate-800 p-4 rounded-lg">

      <p className="text-gray-400 text-sm">
        {label}
      </p>

      <p className="font-semibold">
        {value || "N/A"}
      </p>

    </div>

  );

}

function Section({ title, children }) {

  return (

    <div className="bg-slate-800 p-6 rounded-xl mb-6">

      <h3 className="text-indigo-400 font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-300">
        {children}
      </p>

    </div>

  );

}