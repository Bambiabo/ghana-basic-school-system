import Link from "next/link";
export default function ScoresPage() { return ( <div className="min-h-screen bg-gray-100"> <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center"> <div> <h1 className="font-bold text-lg">Ghana Basic School</h1> <p className="text-sm text-green-200">Enter Scores</p> </div> <Link href="/dashboard" className="text-sm hover:underline"> ← Back to Dashboard </Link> </header>
  <main className="p-6 max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Student Scores</h2>

    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select className="border border-gray-300 rounded-lg px-4 py-2.5">
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

        <select className="border border-gray-300 rounded-lg px-4 py-2.5">
          <option>Select Subject</option>
          <option>Mathematics</option>
          <option>English Language</option>
          <option>Integrated Science</option>
          <option>Social Studies</option>
        </select>

        <select className="border border-gray-300 rounded-lg px-4 py-2.5">
          <option>1st Term</option>
          <option>2nd Term</option>
          <option>3rd Term</option>
        </select>

        <button className="bg-green-700 text-white font-semibold py-2.5 rounded-lg">
          Load Score Sheet
        </button>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Score Sheet — Mathematics</h3>
        <button className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
          Save All Scores
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b pb-3">
          <span className="w-48 font-medium">Ama Serwaa Mensah</span>
          <input type="number" placeholder="CAT 1" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="CAT 2" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="Project" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="Exam" className="w-20 border rounded px-2 py-1" />
          <span className="font-bold">Total: 85</span>
        </div>

        <div className="flex items-center gap-4 border-b pb-3">
          <span className="w-48 font-medium">Kwame Asante</span>
          <input type="number" placeholder="CAT 1" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="CAT 2" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="Project" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="Exam" className="w-20 border rounded px-2 py-1" />
          <span className="font-bold">Total: 75</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-48 font-medium">Abena Osei</span>
          <input type="number" placeholder="CAT 1" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="CAT 2" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="Project" className="w-20 border rounded px-2 py-1" />
          <input type="number" placeholder="Exam" className="w-20 border rounded px-2 py-1" />
          <span className="font-bold">Total: 67</span>
        </div>
      </div>
    </div>
  </main>
</div>
); }