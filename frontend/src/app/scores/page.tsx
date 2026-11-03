"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://ghana-basic-school-system.onrender.com";

export default function ScoresPage() {
  const [students, setStudents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadScores();
  }, [router]);

  const loadScores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scores`);
      const data = await res.json();
      if (data && data.length > 0) setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateScore = (id: number, field: string, value: string) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const getTotal = (s: any) => {
    return (Number(s.cat1) || 0) + (Number(s.cat2) || 0) + (Number(s.project) || 0) + (Number(s.exam) || 0);
  };

  const getGrade = (total: number) => {
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    return "F";
  };

  const saveScores = async () => {
    try {
      await fetch(`${API_URL}/api/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(students),
      });
      alert("Scores saved successfully!");
    } catch (error) {
      alert("Failed to save scores.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Ghana Basic School</h1>
          <p className="text-sm text-green-200">Enter Scores</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">← Back to Dashboard</Link>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Enter Student Scores</h2>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg">Score Sheet</h3>
            <button onClick={saveScores} className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Save All Scores</button>
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
                      <td className="px-4 py-3 font-medium">{student.name || `Student ${student.student_id}`}</td>
                      <td className="px-4 py-3"><input type="number" value={student.cat1 || ""} onChange={(e) => updateScore(student.id, "cat1", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" /></td>
                      <td className="px-4 py-3"><input type="number" value={student.cat2 || ""} onChange={(e) => updateScore(student.id, "cat2", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" /></td>
                      <td className="px-4 py-3"><input type="number" value={student.project || ""} onChange={(e) => updateScore(student.id, "project", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" /></td>
                      <td className="px-4 py-3"><input type="number" value={student.exam || ""} onChange={(e) => updateScore(student.id, "exam", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" /></td>
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