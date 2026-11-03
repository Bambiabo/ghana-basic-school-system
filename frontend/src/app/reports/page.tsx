"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://ghana-basic-school-system.onrender.com";

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [studentsRes, scoresRes] = await Promise.all([
        fetch(`${API_URL}/api/students`),
        fetch(`${API_URL}/api/scores`)
      ]);
      setStudents(await studentsRes.json());
      setScores(await scoresRes.json());
    } catch (error) {
      console.error(error);
    }
  };

  const getStudentScores = (studentId: number) => {
    return scores.filter(s => s.student_id === studentId || s.studentId === studentId);
  };

  const getTotal = (score: any) => {
    return (Number(score.cat1) || 0) + (Number(score.cat2) || 0) + (Number(score.project) || 0) + (Number(score.exam) || 0);
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
            <p className="text-gray-600">No students found.</p>
          </div>
        ) : (
          students.map((student, index) => {
            const studentScores = getStudentScores(student.id);
            const overallTotal = studentScores.reduce((sum, s) => sum + getTotal(s), 0);
            const average = studentScores.length > 0 ? (overallTotal / studentScores.length).toFixed(1) : "-";

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
                    <p><span className="font-semibold">Name:</span> {student.name}</p>
                    <p><span className="font-semibold">Admission No:</span> {student.admission_no || "-"}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Class:</span> {student.class}</p>
                    <p><span className="font-semibold">Position:</span> {index + 1}</p>
                  </div>
                </div>

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
                    </tr>
                  </thead>
                  <tbody>
                    {studentScores.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-gray-400 px-3 py-4 text-center text-gray-500">
                          No scores entered yet
                        </td>
                      </tr>
                    ) : (
                      studentScores.map((score, i) => {
                        const total = getTotal(score);
                        const grade = getGrade(total);
                        return (
                          <tr key={i}>
                            <td className="border border-gray-400 px-3 py-2">{score.subject || "Subject"}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{score.cat1 || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{score.cat2 || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{score.project || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center">{score.exam || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center font-bold">{total}</td>
                            <td className="border border-gray-400 px-3 py-2 text-center font-semibold">{grade}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <p><span className="font-semibold">Overall Average:</span> {average}%</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Attendance:</span> 62 / 65</p>
                  </div>
                </div>

                <div className="text-sm mb-8">
                  <p className="font-semibold mb-1">Class Teacher’s Remarks:</p>
                  <p className="border-b border-gray-300 pb-6">Good effort. Keep working hard.</p>
                  <p className="font-semibold mt-4 mb-1">Headteacher’s Remarks:</p>
                  <p className="border-b border-gray-300 pb-6">Well done.</p>
                </div>

                <div className="grid grid-cols-2 gap-8 text-sm mt-10">
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 mt-12">Class Teacher’s Signature</div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 mt-12">Headteacher’s Signature & Stamp</div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {students.length > 0 && (
          <div className="mt-6 text-center print:hidden">
            <button onClick={() => window.print()} className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-semibold">
              Print All Report Cards
            </button>
          </div>
        )}
      </main>
    </div>
  );
}