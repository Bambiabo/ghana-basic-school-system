"use client";
import Link from "next/link"; import { useState } from "react";
export default function ScoresPage() { const [students, setStudents] = useState([ { id: 1, name: "Ama Serwaa Mensah", cat1: "", cat2: "", project: "", exam: "" }, { id: 2, name: "Kwame Asante", cat1: "", cat2: "", project: "", exam: "" }, { id: 3, name: "Abena Osei", cat1: "", cat2: "", project: "", exam: "" }, ]);
const updateScore = (id: number, field: string, value: string) => { setStudents(students.map(student => student.id === id ? { ...student, [field]: value } : student )); };
const calculateTotal = (student: any) => { const cat1 = Number(student.cat1)  0; const cat2 = Number(student.cat2)  0; const project = Number(student.project)  0; const exam = Number(student.exam)  0; return cat1 + cat2 + project + exam; };
const getGrade = (total: number) => { if (total >= 80) return "A"; if (total >= 70) return "B"; if (total >= 60) return "C"; if (total >= 50) return "D"; return "F"; };
return ( <div className="min-h-screen bg-gray-100"> <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center"> <div> <h1 className="font-bold text-lg">Ghana Basic School</h1> <p className="text-sm text-green-200">Enter Scores</p> </div> <Link href="/dashboard" className="text-sm hover:underline"> ← Back to Dashboard </Link> </header>
  <main className="p-6 max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Student Scores</h2>

    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select className="border border-gray-300 rounded-lg px-4 py-2.5">
          <option>Select Class</option>
          <option>JHS 2</option>
          <option>Basic 6</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-4 py-2.5">
          <option>Select Subject</option>
          <option>Mathematics</option>
          <option>English Language</option>
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
        {students.map((student) => {
          const total = calculateTotal(student);
          const grade = getGrade(total);
          return (
            <div key={student.id} className="flex flex-wrap items-center gap-3 border-b pb-4">
              <span className="w-48 font-medium">{student.name}</span>
              <input
                type="number"
                placeholder="CAT 1"
                value={student.cat1}
                onChange={(e) => updateScore(student.id, "cat1", e.target.value)}
                className="w-20 border rounded px-2 py-1"
              />
              <input
                type="number"
                placeholder="CAT 2"
                value={student.cat2}
                onChange={(e) => updateScore(student.id, "cat2", e.target.value)}
                className="w-20 border rounded px-2 py-1"
              />
              <input
                type="number"
                placeholder="Project"
                value={student.project}
                onChange={(e) => updateScore(student.id, "project", e.target.value)}
                className="w-20 border rounded px-2 py-1"
              />
              <input
                type="number"
                placeholder="Exam"
                value={student.exam}
                onChange={(e) => updateScore(student.id, "exam", e.target.value)}
                className="w-20 border rounded px-2 py-1"
              />
              <span className="font-bold w-24">Total: {total}</span>
              <span className={`font-semibold w-12 ${grade === "A" ? "text-green-700" : grade === "B" ? "text-green-600" : "text-yellow-600"}`}>
                {grade}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </main>
</div>
); } 