"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://ghana-basic-school-system.onrender.com";

export default function ReportsPage() {
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

  const getTotal = (s: any) => (Number(s.cat1) || 0) + (Number(s.cat2) || 0) + (Number(s.project) || 0) + (Number(s.exam) || 0);
  const getGrade = (total: number) => {
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    return "F";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center print:hidden">
        <div>
          <h1 className="font-bold text-lg">Ghana Basic School</h1>
          <p className="text-sm text-green-200">Generate Report Cards</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">← Back to Dashboard</Link>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {students.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg">
            <p className="text-gray-600">No scores found. Please enter and save scores first.</p>
            <Link href="/scores" className="text-green-700 underline mt-2 inline-block">Go to Enter Scores</Link>
          </div>
        ) : (
          students.map((student, index) => {
            const total = getTotal(student);
            const grade = getGrade(total);
            return (
              <div key={student.id} className="bg-white border-2 border-gray-300 p-8 mb-8 print:mb-0 print:border-0 print:break-after-page">
                <div className="text-center border-b-2 border-green-800 pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-green-900">GHANA BASIC SCHOOL</h1>
                  <p className="text-sm text-gray-600">P.O. Box 123, Accra</p>
                  <h2 className="text-xl font-semibold mt-3 text-green-800">TERMINAL REPORT CARD</h2>
                  <p className="text-sm">1st Term — 2025/2026 Academic Year</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p><span className="font-semibold">Name:</span> {student.name || `Student ${student.student_id}`}</p>
                    <p><span className="font-semibold">Admission No:</span> GES/2023/0{145 + index}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Class:</span> JHS 2</p>
                    <p><span className="font-semibold">Position:</span> {index + 1}</p>
                  </div>
                </div>
                <table className="w-full border-collapse border border-gray-400 text-sm mb-6">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="border border-gray-400 px-3 py-2 text-left">Subject</th>
                      <th className="border border-gray-400 px-3 py-2">Total</th>
                      <th className="border border-gray-400 px-3 py-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-400 px-3 py-2">Mathematics</td>
                      <td className="border border-gray-400 px-3 py-2 text-center font-bold">{total}</td>
                      <td className="border border-gray-400 px-3 py-2 text-center font-semibold">{grade}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-center mt-8 print:hidden">
                  <button onClick={() => window.print()} className="bg-green-700 text-white px-6 py-2 rounded-lg">Print</button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}