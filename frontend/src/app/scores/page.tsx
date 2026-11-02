"use client";

import Link from "next/link";
import { useState } from "react";

export default function ScoresPage() {
  const [students, setStudents] = useState([
    { id: 1, name: "Ama Serwaa Mensah", cat1: "", cat2: "", project: "", exam: "" },
    { id: 2, name: "Kwame Asante", cat1: "", cat2: "", project: "", exam: "" },
    { id: 3, name: "Abena Osei", cat1: "", cat2: "", project: "", exam: "" },
    { id: 4, name: "Kofi Boateng", cat1: "", cat2: "", project: "", exam: "" },
  ]);

  const updateScore = (id: number, field: string, value: string) => {
    setStudents(
      students.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const getTotal = (s: any) => {
    const c1 = Number(s.cat1) || 0;
    const c2 = Number(s.cat2) || 0;
    const p = Number(s.project) || 0;
    const e = Number(s.exam) || 0;
    return c1 + c2 + p + e;
  };

  const getGrade = (total: number) => {
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    return "F";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Ghana Basic School</h1>
          <p className="text-sm text-green-200">Enter Scores</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Student Scores</h2>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="border rounded-lg px-4 py-2.5">
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

            <select className="border rounded-lg px-4 py-2.5">
              <option>Select Subject</option>
              <option>English Language</option>
              <option>Mathematics</option>
              <option>Integrated Science</option>
              <option>Social Studies</option>
              <option>Our World Our People (OWOP)</option>
              <option>Ghanaian Language</option>
              <option>Religious and Moral Education (RME)</option>
              <option>Creative Arts</option>
              <option>Computing</option>
              <option>Career Technology</option>
              <option>French</option>
              <option>Physical Education</option>
            </select>

            <select className="border rounded-lg px-4 py-2.5">
              <option>1st Term</option>
              <option>2nd Term</option>
              <option>3rd Term</option>
            </select>

            <button className="bg-green-700 text-white font-semibold py-2.5 rounded-lg">
              Load Score Sheet
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg">Score Sheet</h3>
            <button className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Save All Scores
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Student Name</th>
                  <th className="px-4 py-3">CAT 1 (20)</th>
                  <th className="px-4 py-3">CAT 2 (20)</th>
                  <th className="px-4 py-3">Project (10)</th>
                  <th className="px-4 py-3">Exam (50)</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const total = getTotal(student);
                  const grade = getGrade(total);
                  return (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={student.cat1}
                          onChange={(e) => updateScore(student.id, "cat1", e.target.value)}
                          className="w-16 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={student.cat2}
                          onChange={(e) => updateScore(student.id, "cat2", e.target.value)}
                          className="w-16 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={student.project}
                          onChange={(e) => updateScore(student.id, "project", e.target.value)}
                          className="w-16 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={student.exam}
                          onChange={(e) => updateScore(student.id, "exam", e.target.value)}
                          className="w-16 border rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 font-bold text-center">{total}</td>
                      <td className="px-4 py-3 font-semibold text-center">{grade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}