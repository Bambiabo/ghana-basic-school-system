import Link from "next/link";
export default function ReportsPage() { return ( <div className="min-h-screen bg-gray-100"> <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center"> <div> <h1 className="font-bold text-lg">Ghana Basic School</h1> <p className="text-sm text-green-200">Generate Report Cards</p> </div> <Link href="/dashboard" className="text-sm hover:underline"> ← Back to Dashboard </Link> </header>
  <main className="p-6 max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Select Class and Term</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select className="border rounded-lg px-4 py-2">
          <option>Select Class</option>
          <option>Basic 1</option>
          <option>Basic 2</option>
          <option>Basic 3</option>
          <option>Basic 4</option>
          <option>Basic 5</option>
          <option>Basic 6</option>
          <option>JHS 1</option>
          <option>JHS 2</option>
          <option>JHS 3</option>
        </select>

        <select className="border rounded-lg px-4 py-2">
          <option>Select Term</option>
          <option>1st Term</option>
          <option>2nd Term</option>
          <option>3rd Term</option>
        </select>

        <button className="bg-green-700 text-white rounded-lg py-2 font-medium">
          Load Students
        </button>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Students</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          Generate All Reports
        </button>
      </div>

      <p className="text-gray-600">Cletus bambiabo — GES/2023/0145</p>
      <p className="text-gray-600 mt-2">willford offosuhene — GES/2023/0146</p>
      <p className="text-gray-600 mt-2">rachel tetteh — GES/2023/0147</p>
    </div>
  </main>
</div>
); }