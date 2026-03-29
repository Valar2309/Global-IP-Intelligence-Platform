export default function AdminApiHealthPage() {
  return (
    <div className="bg-slate-800 p-5 rounded-xl">
      <h2 className="text-xl mb-4">API Health</h2>
      <p>WIPO: ✅ Active</p>
      <p>USPTO: ⚠ Slow</p>
      <p>EPO: ❌ Down</p>
    </div>
  );
}