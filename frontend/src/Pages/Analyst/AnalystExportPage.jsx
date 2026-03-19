import { useLocation } from "react-router-dom";
import { useMemo } from "react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";

export default function AnalystExportPage() {

  const location = useLocation();
  const assets = location.state?.results || [];

  console.log("DATA RECEIVED:", assets);

  // ❌ No Data Case
  if (!assets.length) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl text-red-400 font-bold">No Data Found</h2>
          <p className="text-gray-400 mt-2">
            Please go back and search patents first
          </p>
        </div>
      </div>
    );
  }

  // ✅ Format Data
  const formattedData = useMemo(() =>
    assets.map(a => ({
      Title: a.title,
      Inventor: a.inventors?.join(", "),
      Applicant: a.applicants?.join(", "),
      Status: a.patentStatus,
      Jurisdiction: a.jurisdiction,
      PublishedDate: a.datePublished
    })),
  [assets]);

  /* ================= EXPORT ================= */

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv]), "Patent_Report.csv");
  };

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "Patent_Report.xlsx");
  };

  const exportJSON = () => {
    saveAs(
      new Blob([JSON.stringify(formattedData, null, 2)]),
      "Patent_Report.json"
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Patent Intelligence Report", 14, 15);

    doc.autoTable({
      head: [["Title","Inventor","Applicant","Status","Country"]],
      body: formattedData.map(a => [
        a.Title,
        a.Inventor,
        a.Applicant,
        a.Status,
        a.Jurisdiction
      ]),
      startY: 25
    });

    doc.save("Patent_Report.pdf");
  };

  const exportWord = async () => {

    const rows = formattedData.map(a =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(a.Title)] }),
          new TableCell({ children: [new Paragraph(a.Inventor)] }),
          new TableCell({ children: [new Paragraph(a.Applicant)] }),
          new TableCell({ children: [new Paragraph(a.Status)] }),
          new TableCell({ children: [new Paragraph(a.Jurisdiction)] })
        ]
      })
    );

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph("Patent Intelligence Report"),
          new Table({ rows })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Patent_Report.docx");
  };

  /* ================= UI ================= */

  return (

    <div className="min-h-screen bg-[#0b1220] text-white p-8 space-y-10">

      {/* HEADER */}
      <div className="
        bg-[#1e293b]
        p-8
        rounded-2xl
        border border-slate-700
        shadow-lg
        hover:shadow-indigo-500/20
        transition
      ">
        <h2 className="text-3xl font-bold text-indigo-400">
          🚀 Patent Export Center
        </h2>

        <p className="mt-2 text-gray-400">
          Total Records: {assets.length}
        </p>
      </div>

      {/* EXPORT CARDS */}
      <div className="grid md:grid-cols-3 gap-8">

        <ExportCard
          title="CSV Export"
          desc="Download CSV dataset"
          action={exportCSV}
          color="green"
        />

        <ExportCard
          title="Excel (.xlsx)"
          desc="Spreadsheet report"
          action={exportXLSX}
          color="emerald"
        />

        <ExportCard
          title="PDF Report"
          desc="Formatted document"
          action={exportPDF}
          color="red"
        />

        <ExportCard
          title="Word Document"
          desc="Editable file"
          action={exportWord}
          color="blue"
        />

        <ExportCard
          title="JSON Dataset"
          desc="Developer format"
          action={exportJSON}
          color="purple"
        />

      </div>

    </div>
  );
}

/* ================= CARD ================= */

function ExportCard({ title, desc, action, color }) {

  const colors = {
    green: "bg-green-500/20 text-green-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    red: "bg-red-500/20 text-red-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400"
  };

  return (
    <div className="
      bg-[#1e293b]
      border border-slate-700
      p-6
      rounded-xl
      transition-all duration-300
      hover:-translate-y-2
      hover:shadow-indigo-500/30
      cursor-pointer
    ">

      <h3 className="text-lg font-semibold mb-2 text-indigo-400">
        {title}
      </h3>

      <p className="text-gray-400 text-sm mb-5">
        {desc}
      </p>

      <button
        onClick={action}
        className={`
          w-full py-2 rounded-lg font-semibold
          ${colors[color]}
          transition-all duration-300
          hover:scale-105
          hover:shadow-lg
        `}
      >
        ⬇ Download
      </button>

    </div>
  );
}

