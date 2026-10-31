import Link from "next/link";
export default function StudentsPage() { return ( <div className="min-h-screen bg-gray-100"> {/* Header */} <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center"> <div> <h1 className="font-bold text-lg">Ghana Basic School</h1> <p className="text-sm text-green-200">Students</p> </div> <Link href="/dashboard" className="text-sm hover:underline"> ← Back to Dashboard </Link> </header>
  {/* Main Content */}
  <main className="p-6 max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">All Students</h2>
      <button className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium">
        + Add Student
      </button>
    </div>

    {/* Students Table */}
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-sm">
          <tr>
            <th className="px-6 py-3">#</th>
            <th className="px-6 py-3">Full Name</th>
            <th className="px-6 py-3">Admission No.</th>
            <th className="px-6 py-3">Class</th>
            <th className="px-6 py-3">Gender</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">1</td>
            <td className="px-6 py-4 font-medium">Ama Serwaa Mensah</td>
            <td className="px-6 py-4">GES/2023/0145</td>
            <td className="px-6 py-4">JHS 2</td>
            <td className="px-6 py-4">Female</td>
            <td className="px-6 py-4">
              <button className="text-green-700 hover:underline text-sm">View</button>
            </td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">2</td>
            <td className="px-6 py-4 font-medium">Cletus Bambiabo</td>
            <td className="px-6 py-4">GES/2023/0146</td>
            <td className="px-6 py-4">JHS 2</td>
            <td className="px-6 py-4">Male</td>
            <td className="px-6 py-4">
              <button className="text-green-700 hover:underline text-sm">View</button>
            </td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">3</td>
            <td className="px-6 py-4 font-medium">Abena Osei</td>
            <td className="px-6 py-4">GES/2023/0147</td>
            <td className="px-6 py-4">Basic 6</td>
            <td className="px-6 py-4">Female</td>
            <td className="px-6 py-4">
              <button className="text-green-700 hover:underline text-sm">View</button>
            </td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">4</td>
            <td className="px-6 py-4 font-medium">Kofi Boateng</td>
            <td className="px-6 py-4">GES/2023/0148</td>
            <td className="px-6 py-4">JHS 1</td>
            <td className="px-6 py-4">Male</td>
            <td className="px-6 py-4">
              <button className="text-green-700 hover:underline text-sm">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</div>
); }