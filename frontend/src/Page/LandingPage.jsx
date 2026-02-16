export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-indigo-600">
          Global IP Intelligence
        </h1>

        <div className="space-x-6">
          <a href="/register" className="hover:text-indigo-600">Login</a>
          <a href="/register" className="hover:text-indigo-600">Register</a>
          <a href="/dashboard" className="hover:text-indigo-600">Dashboard</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-6 py-24">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Empowering Global Intellectual Property Insights
        </h2>

        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Analyze, track and manage intellectual property data across the globe with powerful analytics and secure access.
        </p>

        <div className="space-x-4">
          <a href="/register">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700">
              Get Started
            </button>
          </a>

          <a href="/dashboard">
            <button className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-xl hover:bg-indigo-100">
              Explore Dashboard
            </button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="px-10 py-20 bg-white text-center">
        <h3 className="text-3xl font-bold mb-12">Key Features</h3>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="shadow-lg p-6 rounded-xl">
            <h4 className="font-semibold mb-2">Advanced Search</h4>
            <p>Powerful filtering and global IP search.</p>
          </div>

          <div className="shadow-lg p-6 rounded-xl">
            <h4 className="font-semibold mb-2">Analytics Dashboard</h4>
            <p>Visual charts and reports for insights.</p>
          </div>

          <div className="shadow-lg p-6 rounded-xl">
            <h4 className="font-semibold mb-2">Global Tracking</h4>
            <p>Track patents and trademarks worldwide.</p>
          </div>

          <div className="shadow-lg p-6 rounded-xl">
            <h4 className="font-semibold mb-2">Secure Access</h4>
            <p>Safe and protected authentication system.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-600 text-white text-center py-6">
        © 2026 Global IP Intelligence Platform
      </footer>

    </div>
  );
}
