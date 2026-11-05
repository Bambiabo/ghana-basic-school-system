"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("Basic 1");
  const [term, setTerm] = useState("Term 1");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [teacherComment, setTeacherComment] = useState("");
  const [headComment, setHeadComment] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      await loadStudents();
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadStudents = async () => {
    const q = query(collection(db, "students"), where("class", "==", selectedClass));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass]);

  const viewReport = async (student: any) => {
    setSelectedStudent(student);
    const q = query(
      collection(db, "scores"),
      where("studentId", "==", student.id),
      where("term", "==", term)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => d.data());
    setScores(data);
  };

  const calculateTotal = (score: any) => {
    return (Number(score.cat1) || 0) + (Number(score.cat2) || 0) + (Number(score.project) || 0) + (Number(score.exam) || 0);
  };

  // Ghana Standard Grading Scale
  const getGrade = (total: number) => {
    if (total >= 80) return "A1";
    if (total >= 75) return "B2";
    if (total >= 70) return "B3";
    if (total >= 65) return "C4";
    if (total >= 60) return "C5";
    if (total >= 55) return "C6";
    if (total >= 50) return "D7";
    if (total >= 45) return "E8";
    return "F9";
  };

  const getRemark = (total: number) => {
    if (total >= 80) return "Excellent";
    if (total >= 70) return "Very Good";
    if (total >= 60) return "Good";
    if (total >= 50) return "Credit";
    if (total >= 45) return "Pass";
    return "Fail";
  };

  const printReport = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center print:hidden">
        <h1 className="text-xl font-bold">Terminal Reports</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-4xl mx-auto print:p-0">
        {!selectedStudent ? (
          <>
            <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-3 print:hidden">
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-2 flex-1">
                <option>Basic 1</option><option>Basic 2</option><option>Basic 3</option>
                <option>Basic 4</option><option>Basic 5</option><option>Basic 6</option>
                <option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
              </select>
              <select value={term} onChange={(e) => setTerm(e.target.value)} className="border rounded-lg px-3 py-2">
                <option>Term 1</option><option>Term 2</option><option>Term 3</option>
              </select>
            </div>

            {students.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                    {s.photo ? <img src={s.photo} alt="" className="w-12 h-12 rounded-full object-cover" /> : "👤"}
                  </div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.class} • {s.admissionNumber}</p>
                  </div>
                </div>
                <button onClick={() => viewReport(s)} className="bg-green-700 text-white px-3 py-1 rounded text-sm">
                  View Report
                </button>
              </div>
            ))}
          </>
        ) : (
          <div className="bg-white p-6 border-2 border-gray-300">
            <div className="text-center border-b-2 border-black pb-3 mb-4">
              <h1 className="text-2xl font-bold">GHANA BASIC SCHOOL</h1>
              <p className="text-sm">TERMINAL REPORT CARD</p>
              <p className="font-semibold mt-1">{term} • Academic Year 2025/2026</p>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-24 h-28 border border-gray-400 flex items-center justify-center bg-gray-100">
                {selectedStudent.photo ? (
                  <img src={selectedStudent.photo} alt="Passport" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 text-center">Passport<br/>Photo</span>
                )}
              </div>
              <div className="flex-1 text-sm space-y-1">
                <p><strong>Name:</strong> {selectedStudent.name}</p>
                <p><strong>Admission No:</strong> {selectedStudent.admissionNumber}</p>
                <p><strong>Class:</strong> {selectedStudent.class}</p>
                <p><strong>Gender:</strong> {selectedStudent.gender || "—"}</p>
                <p><strong>Term:</strong> {term}</p>
              </div>
            </div>

            <table className="w-full text-sm border-collapse border border-gray-400 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left">Subject</th>
                  <th className="border border-gray-400 p-2">CAT 1</th>
                  <th className="border border-gray-400 p-2">CAT 2</th>
                  <th className="border border-gray-400 p-2">Project</th>
                  <th className="border border-gray-400 p-2">Exam</th>
                  <th className="border border-gray-400 p-2">Total</th>
                  <th className="border border-gray-400 p-2">Grade</th>
                  <th className="border border-gray-400 p-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border border-gray-400 p-3 text-center text-gray-500">
                      No scores recorded for this term
                    </td>
                  </tr>
                ) : (
                  scores.map((s, i) => {
                    const total = calculateTotal(s);
                    return (
                      <tr key={i}>
                        <td className="border border-gray-400 p-2">{s.subject}</td>
                        <td className="border border-gray-400 p-2 text-center">{s.cat1 || 0}</td>
                        <td className="border border-gray-400 p-2 text-center">{s.cat2 || 0}</td>
                        <td className="border border-gray-400 p-2 text-center">{s.project || 0}</td>
                        <td className="border border-gray-400 p-2 text-center">{s.exam || 0}</td>
                        <td className="border border-gray-400 p-2 text-center font-semibold">{total}</td>
                        <td className="border border-gray-400 p-2 text-center font-bold">{getGrade(total)}</td>
                        <td className="border border-gray-400 p-2 text-center">{getRemark(total)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p><strong>Conduct:</strong> Good</p>
                <p><strong>Attitude:</strong> Excellent</p>
                <p><strong>Interest:</strong> Very Good</p>
              </div>
              <div>
                <p><strong>Attendance:</strong> 45/50</p>
                <p><strong>Class Position:</strong> —</p>
              </div>
            </div>

            <div className="mb-4 text-sm print:hidden">
              <p className="font-semibold mb-1">Class Teacher’s Remarks:</p>
              <textarea
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                className="w-full border rounded p-2 h-16"
                placeholder="Enter class teacher remarks..."
              />
            </div>
            <div className="mb-4 text-sm hidden print:block">
              <p className="font-semibold">Class Teacher’s Remarks:</p>
              <p className="border border-gray-400 p-2 min-h-12">{teacherComment || " "}</p>
            </div>

            <div className="mb-6 text-sm print:hidden">
              <p className="font-semibold mb-1">Headteacher’s Remarks:</p>
              <textarea
                value={headComment}
                onChange={(e) => setHeadComment(e.target.value)}
                className="w-full border rounded p-2 h-16"
                placeholder="Enter headteacher remarks..."
              />
            </div>
            <div className="mb-6 text-sm hidden print:block">
              <p className="font-semibold">Headteacher’s Remarks:</p>
              <p className="border border-gray-400 p-2 min-h-12">{headComment || " "}</p>
            </div>

            <div className="flex justify-between text-sm mt-8">
              <div className="text-center">
                <div className="border-b border-black w-40 mb-1"></div>
                <p>Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="border-b border-black w-40 mb-1"></div>
                <p>Headteacher</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 print:hidden">
              <button onClick={printReport} className="bg-green-700 text-white px-4 py-2 rounded">
                Print Report
              </button>
              <button onClick={() => setSelectedStudent(null)} className="bg-gray-600 text-white px-4 py-2 rounded">
                Back to List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}