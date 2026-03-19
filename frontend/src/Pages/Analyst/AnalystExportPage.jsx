
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";

export default function AnalystExportPage() {

  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "artificial intelligence";

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [query]);

  const fetchAssets = async () => {

    setLoading(true);

    try {

      const response = await axios.get(
        "http://localhost:8081/api/search",
        {
          params: {
            q: query,
            type: "PATENT",
            page: 0,
            size: 50
          }
        }
      );

      setAssets(response.data.results || []);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  const formattedData = assets.map(a => ({
    Title: a.title,
    Inventor: a.inventors?.join(", "),
    Applicant: a.applicants?.join(", "),
    Status: a.patentStatus,
    Jurisdiction: a.jurisdiction,
    PublishedDate: a.datePublished
  }));

  const exportCSV = () => {

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    saveAs(blob, "Patent_Report.csv");

  };

  const exportXLSX = () => {

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Patent Report"
    );

    XLSX.writeFile(workbook, "Patent_Report.xlsx");

  };

  const exportJSON = () => {

    const blob = new Blob(
      [JSON.stringify(formattedData, null, 2)],
      { type: "application/json" }
    );

    saveAs(blob, "Patent_Report.json");

  };

  const exportPDF = () => {

    const doc = new jsPDF();

    doc.text(
      `Patent Intelligence Report: ${query}`,
      14,
      15
    );

    doc.autoTable({

      head: [
        [
          "Title",
          "Inventor",
          "Applicant",
          "Status",
          "Jurisdiction"
        ]
      ],

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

    const tableRows = formattedData.map(a =>
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
      sections: [
        {
          children: [
            new Paragraph(`Patent Intelligence Report: ${query}`),
            new Table({
              rows: tableRows
            })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);

    saveAs(blob, "Patent_Report.docx");

  };

  return (

    <div className="space-y-10 text-white">

      {/* HEADER */}

      <div className="
      bg-gradient-to-r
      from-indigo-500
      to-purple-600
      p-8
      rounded-xl
      shadow-2xl
      ">

        <h2 className="text-3xl font-bold">
          Patent Export Center
        </h2>

        <p className="mt-2 opacity-90">
          Export search results for:
          <span className="ml-2 font-semibold">
            {query}
          </span>
        </p>

      </div>

      {loading && (
        <p className="text-gray-400">
          Loading patents...
        </p>
      )}

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-6">

        <StatCard title="Patents Loaded" value={assets.length} />

        <StatCard title="Export Formats" value="5" />

        <StatCard
          title="System Status"
          value={loading ? "Loading" : "Ready"}
        />

      </div>

      {/* EXPORT OPTIONS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <ExportCard
          title="CSV Export"
          desc="Download structured CSV dataset"
          action={exportCSV}
          color="bg-green-600"
        />

        <ExportCard
          title="Excel (.xlsx)"
          desc="Professional spreadsheet report"
          action={exportXLSX}
          color="bg-emerald-600"
        />

        <ExportCard
          title="PDF Report"
          desc="Formatted patent intelligence report"
          action={exportPDF}
          color="bg-red-600"
        />

        <ExportCard
          title="Word Document"
          desc="Editable research document"
          action={exportWord}
          color="bg-blue-600"
        />

        <ExportCard
          title="JSON Dataset"
          desc="Machine readable export"
          action={exportJSON}
          color="bg-purple-600"
        />

      </div>

    </div>

  );

}

function ExportCard({ title, desc, action, color }) {

  return (

    <div className="
      bg-slate-800
      border border-slate-700
      p-6
      rounded-xl
      shadow-xl
      hover:-translate-y-2
      hover:shadow-indigo-500/20
      transition
    ">

      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-400 text-sm mb-5">
        {desc}
      </p>

      <button
        onClick={action}
        className={`${color}
        px-6
        py-3
        rounded-lg
        w-full
        text-white
        hover:scale-105
        transition
        `}
      >
        Download
      </button>

    </div>

  );

}

function StatCard({ title, value }) {

  return (

    <div className="
      bg-slate-800
      border border-slate-700
      p-6
      rounded-xl
      shadow-xl
      hover:-translate-y-1
      hover:shadow-indigo-500/20
      transition
    ">

      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-indigo-400 mt-1">
        {value}
      </h3>

    </div>

  );

}

