import Link from "next/link";
export default function Dashboard() { return ( <div className="min-h-screen bg-gray-100"> {/* Top Navigation */} <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center shadow"> <div className="flex items-center gap-3"> <span className="text-2xl">🏫</span> <div> <h1 className="font-bold text-lg">Ghana Basic School</h1> <p className="text-sm text-green-200">School Management System</p> </div> </div> <div className="text-sm"> Welcome, <span className="font-semibold">Teacher</span> </div> </header>
  {/* Main Content */}
  <main className="p-6 max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-600">
        <p className="text-gray-500 text-sm">Total Students</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">248</p>
      </div>
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600">
        <p className="text-gray-500 text-sm">Classes</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">12</p>
      </div>
      <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
        <p className="text-gray-500 text-sm">Pending Reports</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">5</p>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-green-100 hover:bg-green-200 text-green-800 py-3 px-4 rounded-lg font-medium transition">
          Enter Scores
        </button>

        <Link
          href="/students"
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg font-medium transition text-center"
        >
          View Students
        </Link>

        <Link
          href="/reports"
          className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 px-4 rounded-lg font-medium transition text-center"
        >
          Generate Reports
        </Link>

        <button className="bg-orange-100 hover:bg-orange-200 text-orange-800 py-3 px-4 rounded-lg font-medium transition">
          Attendance
        </button>
      </div>
    </div>
  </main>
</div>
); }