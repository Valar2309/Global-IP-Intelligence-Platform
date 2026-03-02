import { useState, useRef } from "react";
import { useParams } from "react-router-dom";

export default function DetailPage() {
  const { id } = useParams();

  // Expanded dummy data
  const dummyAssets = {
    "1": {
      title: "AI Based System",
      preface: "This invention introduces an AI-based system designed to optimize decision-making processes.",
      abstract: "The system leverages machine learning algorithms to analyze large datasets and provide actionable insights.",
      claims: [
        "Claim 1: A system for AI-based decision making.",
        "Claim 2: A method for intelligent resource allocation."
      ],
      inventor: "John Doe",
      assignee: "TechCorp",
      jurisdiction: "US",
      applicationNumber: "APP123456",
      filingDate: "2025-01-01",
      status: "Filed",
      technical: "The system integrates neural networks with cloud-based data pipelines, ensuring scalability and reliability.",
      conclusion: "This AI system represents a step forward in automated decision-making for enterprises."
    },
    "2": {
      title: "Bluetooth based attendance",
      preface: "This invention simplifies attendance tracking using Bluetooth-enabled devices.",
      abstract: "The system allows seamless attendance logging by detecting nearby Bluetooth signals.",
      claims: [
        "Claim 1: A method for attendance tracking using Bluetooth.",
        "Claim 2: A system for secure attendance verification."
      ],
      inventor: "Alice",
      assignee: "InfoTechCorp",
      jurisdiction: "IN",
      applicationNumber: "APP654321",
      filingDate: "2025-02-01",
      status: "Filed",
      technical: "The solution uses Bluetooth Low Energy (BLE) for efficient device detection and integrates with cloud storage.",
      conclusion: "This system reduces manual errors and enhances security in attendance management."
    },
    "3": {
      title: "Bluetooth based attendance",
      preface: "A variant of the Bluetooth attendance system focusing on device-based verification.",
      abstract: "This version emphasizes secure logging through unique device identifiers.",
      claims: [
        "Claim 1: A Bluetooth-based attendance device.",
        "Claim 2: A method for logging attendance securely."
      ],
      inventor: "Alice",
      assignee: "InfoTechCorp",
      jurisdiction: "IN",
      applicationNumber: "APP789012",
      filingDate: "2025-03-01",
      status: "Filed",
      technical: "The device integrates with mobile applications and uses encryption for secure data transfer.",
      conclusion: "This variant enhances security and reliability in attendance tracking."
    }
  };

  const [asset] = useState(dummyAssets[id]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fontSize, setFontSize] = useState("text-base");

  // Section refs
  const prefaceRef = useRef(null);
  const abstractRef = useRef(null);
  const claimsRef = useRef(null);
  const inventorRef = useRef(null);
  const statusRef = useRef(null);
  const technicalRef = useRef(null);
  const conclusionRef = useRef(null);

  const [currentSection, setCurrentSection] = useState("preface");
  const sectionOrder = [
    { key: "preface", ref: prefaceRef },
    { key: "abstract", ref: abstractRef },
    { key: "claims", ref: claimsRef },
    { key: "inventor", ref: inventorRef },
    { key: "status", ref: statusRef },
    { key: "technical", ref: technicalRef },
    { key: "conclusion", ref: conclusionRef },
  ];

  const scrollToSection = (sectionKey) => {
    const sec = sectionOrder.find(s => s.key === sectionKey);
    sec.ref.current.scrollIntoView({ behavior: "smooth" });
    setCurrentSection(sectionKey);
  };

  const goPrev = () => {
    const idx = sectionOrder.findIndex(s => s.key === currentSection);
    if (idx > 0) scrollToSection(sectionOrder[idx - 1].key);
  };

  const goNext = () => {
    const idx = sectionOrder.findIndex(s => s.key === currentSection);
    if (idx < sectionOrder.length - 1) scrollToSection(sectionOrder[idx + 1].key);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(asset, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ip-asset-${id}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!asset) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex h-screen text-white">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-900 p-4 overflow-y-auto transition-all">
          <h2 className="text-lg font-bold mb-4">Contents</h2>
          <input
            type="text"
            placeholder="Search..."
            className="w-full mb-4 px-2 py-1 rounded bg-gray-800 text-white focus:outline-none"
          />
          <ul className="space-y-2">
            {sectionOrder.map((sec) => (
              <li key={sec.key}>
                <button
                  onClick={() => scrollToSection(sec.key)}
                  className={`w-full text-left px-2 py-1 rounded ${
                    currentSection === sec.key ? "bg-blue-600" : "hover:bg-gray-700"
                  }`}
                >
                  {sec.key.charAt(0).toUpperCase() + sec.key.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={goPrev} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">&lt;</button>
          <button onClick={goNext} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">&gt;</button>
          <button onClick={handleExport} className="bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700">Download</button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">☰</button>
          <button onClick={() => setFontSize("text-sm")} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">A-</button>
          <button onClick={() => setFontSize("text-lg")} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">A+</button>
          <button className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Fb</button>
          <button className="bg-sky-500 px-3 py-1 rounded hover:bg-sky-600">Tw</button>
          <button className="bg-blue-800 px-3 py-1 rounded hover:bg-blue-900">In</button>
        </div>

        {/* Sections */}
        <section ref={prefaceRef} className={`mb-12 ${fontSize}`}>
          <h1 className="text-2xl font-bold mb-2">{asset.title}</h1>
          <h2 className="text-xl font-semibold mb-2">Preface</h2>
          <p>{asset.preface}</p>
        </section>

        <section ref={abstractRef} className={`mb-12 ${fontSize}`}>
          <h2 className="text-xl font-semibold mb-2">Abstract</h2>
          <p>{asset.abstract}</p>
        </section>

        <section ref={claimsRef} className={`mb-12 ${fontSize}`}>
          <h2 className="text-xl font-semibold mb-2">Claims</h2>
          <ul className="list-disc pl-6">
            {asset.claims?.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </section>

        <section ref={statusRef} className={`mb-12 ${fontSize}`}>
          <h2 className="text-xl font-semibold mb-2">Legal Status</h2>
          <p><strong>Application No:</strong> {asset.applicationNumber}</p>
          <p><strong>Filing Date:</strong> {asset.filingDate}</p>
          <p><strong>Status:</strong> {asset.status}</p>
        </section>

        <section ref={technicalRef} className={`mb-12 ${fontSize}`}>
          <h2 className="text-xl font-semibold mb-2">Technical Description</h2>
          <p>{asset.technical}</p>
        </section>

        <section ref={conclusionRef} className={`mb-12 ${fontSize}`}>
          <h2 className="text-xl font-semibold mb-2">Conclusion</h2>
          <p>{asset.conclusion}</p>
        </section>
      </div>
    </div>
  );
}
