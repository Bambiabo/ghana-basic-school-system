"use client";

import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center print:hidden">
        <div>
          <h1 className="font-bold text-lg">Ghana Basic School</h1>
          <p className="text-sm text-green-200">Generate Report Cards</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">
          ← Back to Dashboard
        </Link>
      </header>

      {/* Report Card */}
      <main className="p-4 max-w-4xl mx-auto">
        <div className="bg-white border-2 border-gray-300 p-8 print:p-6 print:border-0 print:shadow-none">
          {/* School Header */}
          <div className="text-center border-b-2 border-green-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-green-900">GHANA BASIC SCHOOL</h1>
            <p className="text-sm text-gray-600">P.O. Box 123, Accra</p>
            <p className="text-sm text-gray-600">Tel: 024 XXX XXXX</p>
            <h2 className="text-xl font-semibold mt-3 text-green-800">TERMINAL REPORT CARD</h2>
            <p className="text-sm">1st Term — 2025/2026 Academic Year</p>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p><span className="font-semibold">Name:</span> Ama Serwaa Mensah</p>
              <p><span className="font-semibold">Admission No:</span> GES/2023/0145</p>
            </div>
            <div>
              <p><span className="font-semibold">Class:</span> JHS 2</p>
              <p><span className="font-semibold">Position:</span> 1st out of 35</p>
            </div>
          </div>

          {/* Scores Table */}
          <table className="w-full border-collapse border border-gray-400 text-sm mb-6">
            <thead className="bg-green-50">
              <tr>
                <th className="border border-gray-400 px-3 py-2 text-left">Subject</th>
                <th className="border border-gray-400 px-3 py-2">CAT 1</th>
                <th className="border border-gray-400 px-3 py-2">CAT 2</th>
                <th className="border border-gray-400 px-3 py-2">Project</th>
                <th className="border border-gray-400 px-3 py-2">Exam</th>
                <th className="border border-gray-400 px-3 py-2">Total</th>
                <th className="border border-gray-400 px-3 py-2">Grade</th>
                <th className="border border-gray-400 px-3 py-2">Position</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2">Mathematics</td>
                <td className="border border-gray-400 px-3 py-2 text-center">18</td>
                <td className="border border-gray-400 px-3 py-2 text-center">16</td>
                <td className="border border-gray-400 px-3 py-2 text-center">9</td>
                <td className="border border-gray-400 px-3 py-2 text-center">42</td>
                <td className="border border-gray-400 px-3 py-2 text-center font-bold">85</td>
                <td className="border border-gray-400 px-3 py-2 text-center font-semibold">A</td>
                <td className="border border-gray-400 px-3 py-2 text-center">1st</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2">English Language</td>
                <td className="border border-gray-400 px-3 py-2 text-center">17</td>
                <td className="border border-gray-400 px-3 py-2 text-center">15</td>
                <td className="border border-gray-400 px-3 py-2 text-center">8</td>
                <td className="border border-gray-400 px-3 py-2 text-center">40</td>
                <td className="border border-gray-400 px-3 py-2 text-center font-bold">80</td>
                <td className="border border-gray-400 px-3 py-2 text-center font-semibold">A</td>
                <td className="border border-gray-400 px-3 py-2 text-center">2nd</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2">Integrated Science</td>
                <td className="border border-gray-400 px-3 py-2 text-center">16</td>
                <td className="border border-gray-400 px-3 py-2 text-center">14</td>
                <td className="border border-gray-400 px-3 py-2 text-center">8</td>
                <td className="border border-gray-400 px-3 py-2 text-center">38</td>
                <td className="border border-gray-400 px-3 py-2 text-center font-bold">76</td>
                <td className="border border-gray-400 px-3 py-2 text-center font-semibold">B</td>
                <td className="border border-gray-400 px-3 py-2 text-center">3rd</td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p><span className="font-semibold">Total Score:</span> 241</p>
              <p><span className="font-semibold">Average:</span> 80.3%</p>
            </div>
            <div>
              <p><span className="font-semibold">Attendance:</span> 62 / 65</p>
              <p><span className="font-semibold">Class Position:</span> 1st</p>
            </div>
          </div>

          {/* Remarks */}
          <div className="text-sm mb-8">
            <p className="font-semibold mb-1">Class Teacher’s Remarks:</p>
            <p className="border-b border-gray-300 pb-6">Excellent performance. Keep it up.</p>

            <p className="font-semibold mt-4 mb-1">Headteacher’s Remarks:</p>
            <p className="border-b border-gray-300 pb-6">Very good result. Well done.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-sm mt-10">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-12">Class Teacher’s Signature</div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2 mt-12">Headteacher’s Signature & Stamp</div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Print Report Card
          </button>
        </div>
      </main>
    </div>
  );
}