"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://ghana-basic-school-system.onrender.com";

const SUBJECTS = [
  "English Language",
  "Mathematics",
  "Integrated Science",
  "Social Studies",
  "Our World Our People (OWOP)",
  "Ghanaian Language",
  "Religious and Moral Education (RME)",
  "Creative Arts",
  "Computing",
  "Career Technology",
  "French",
  "Physical Education"
];

const CLASSES = ["Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6", "JHS 1", "JHS 2", "JHS 3"];
const TERMS = ["1st Term", "2nd Term", "3rd Term"];

export default function ScoresPage() {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("1st Term");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [scores, setScores] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/students`);
      const data = await res.json();
      setAllStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadScoreSheet = () => {
    if (!selectedClass || !selectedSubject) {
      alert("Please select Class and Subject");
      return;
    }
    const studentsInClass = allStudents.filter(s => s.class === selectedClass);
    setFilteredStudents(studentsInClass);
    setScores({});
  };

  const updateScore = (studentId: number, field: string, value: string) => {
    setScores({
      ...scores,
      [studentId]: {
        ...scores[studentId],
        [field]: value
      }
    });
  };

  const getTotal = (studentId: number) => {
    const s = scores[studentId] || {};
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
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      alert("Please select Class, Term and Subject");
      return;
    }

    const payload = filteredStudents.map(student => ({
      studentId: student.id,
      class: selectedClass,
      term: selectedTerm,
      subject: selectedSubject,
      cat1: scores[student.id]?.cat1 || 0,
      cat2: scores[student.id]?.cat2 || 0,
      project: scores[student.id]?.project || 0,
      exam: scores[student.id]?.exam || 0
    }));

    try {
      await fetch(`${API_URL}/api/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-4 py-2.5">
              <option value="">Select Class</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>

            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="border rounded-lg px-4 py-2.5">
              <option value="">Select Subject</option>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>

            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="border rounded-lg px-4 py-2.5">
              {TERMS.map(t => <option key={t}>{t}</option>)}
            </select>

            <button onClick={loadScoreSheet} className="bg-green-700 text-white font-semibold py-2.5 rounded-lg">
              Load Score Sheet
            </button>
          </div>
        </div>

        {filteredStudents.length > 0 && (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">{selectedSubject} — {selectedClass} ({selectedTerm})</h3>
              <button onClick={saveScores} className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
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
                  {filteredStudents.map((student) => {
                    const total = getTotal(student.id);
                    const grade = getGrade(total);
                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{student.name}</td>
                        <td className="px-4 py-3">
                          <input type="number" value={scores[student.id]?.cat1 || ""} onChange={(e) => updateScore(student.id, "cat1", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={scores[student.id]?.cat2 || ""} onChange={(e) => updateScore(student.id, "cat2", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={scores[student.id]?.project || ""} onChange={(e) => updateScore(student.id, "project", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <input type="number" value={scores[student.id]?.exam || ""} onChange={(e) => updateScore(student.id, "exam", e.target.value)} className="w-16 border rounded px-2 py-1 text-center" />
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
        )}
      </main>
    </div>
  );
}