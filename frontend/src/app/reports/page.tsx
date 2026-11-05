"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
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
  const [commentId, setCommentId] = useState<string | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, absent: 0, total: 0 });
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
    setTeacherComment("");
    setHeadComment("");
    setCommentId(null);
    setAttendanceSummary({ present: 0, absent: 0, total: 0 });

    // Load scores
    const scoresQuery = query(
      collection(db, "scores"),
      where("studentId", "==", student.id),
      where("term", "==", term)
    );
    const scoresSnapshot = await getDocs(scoresQuery);
    const scoresData = scoresSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setScores(scoresData);

    // Load comments
    const commentsQuery = query(
      collection(db, "comments"),
      where("studentId", "==", student.id),
      where("term", "==", term)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    if (!commentsSnapshot.empty) {
      const commentDoc = commentsSnapshot.docs[0];
      setCommentId(commentDoc.id);
      setTeacherComment(commentDoc.data().teacherComment || "");
      setHeadComment(commentDoc.data().headComment || "");
    }

    // Load attendance
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("studentId", "==", student.id)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    let present = 0;
    let absent = 0;
    attendanceSnapshot.docs.forEach(d => {
      if (d.data().status === "Present") present++;
      else if (d.data().status === "Absent") absent++;
    });
    setAttendanceSummary({ present, absent, total: present + absent });
  };

  const updateScoreField = (scoreId: string, field: string, value: string) => {
    setScores(prev =>
      prev.map(s => (s.id === scoreId ? { ...s, [field]: value } : s))
    );
  };

  const saveScores = async () => {
    for (const score of scores) {
      if (score.id) {
        await updateDoc(doc(db, "scores", score.id), {
          cat1: Number(score.cat1) || 0,
          cat2: Number(score.cat2) || 0,
          project: Number(score.project) || 0,
          exam: Number(score.exam) || 0
        });
      }
    }
    alert("Scores updated successfully!");
  };

  const saveComments = async () => {
    if (!selectedStudent) return;
    const commentData = {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      term,
      teacherComment,
      headComment,
      updatedAt: new Date().toISOString()
    };

    if (commentId) {
      await updateDoc(doc(db, "comments", commentId), commentData);
    } else {
      const newDoc = await addDoc(collection(db, "comments"), commentData);
      setCommentId(newDoc.id);
    }
    alert("Comments saved successfully!");
  };

  const calculateTotal = (score: any) => {
    return (Number(score.cat1) || 0) + (Number(score.cat2) || 0) + (Number(score.project) || 0) + (Number(score.exam) || 0);
  };

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
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl overflow-hidden">
                    {s.photo ? <img src={s.photo} alt="" className="w-12 h-12 object-cover" /> : "👤"}
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
              <div className="w-24 h-28 border border-gray-400 flex items-center justify-center bg-gray-100 overflow-hidden">
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
                  scores.map((s) => {
                    const total = calculateTotal(s);
                    return (
                      <tr key={s.id}>
                        <td className="border border-gray-400 p-2">{s.subject}</td>
                        <td className="border border-gray-400 p-2 text-center">
                          <input type="number" value={s.cat1 || ""} onChange={(e) => updateScoreField(s.id, "cat1", e.target.value)} className="w-14 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-400 p-2 text-center">
                          <input type="number" value={s.cat2 || ""} onChange={(e) => updateScoreField(s.id, "cat2", e.target.value)} className="w-14 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-400 p-2 text-center">
                          <input type="number" value={s.project || ""} onChange={(e) => updateScoreField(s.id, "project", e.target.value)} className="w-14 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-400 p-2 text-center">
                          <input type="number" value={s.exam || ""} onChange={(e) => updateScoreField(s.id, "exam", e.target.value)} className="w-14 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-400 p-2 text-center font-semibold">{total}</td>
                        <td className="border border-gray-400 p-2 text-center font-bold">{getGrade(total)}</td>
                        <td className="border border-gray-400 p-2 text-center">{getRemark(total)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Attendance Summary */}
            <div className="mb-4 text-sm border border-gray-400 p-3">
              <p className="font-semibold mb-2">Attendance Summary</p>
              <div className="grid grid-cols-3 gap-4">
                <p><strong>Days Present:</strong> {attendanceSummary.present}</p>
                <p><strong>Days Absent:</strong> {attendanceSummary.absent}</p>
                <p><strong>Total Days:</strong> {attendanceSummary.total}</p>
              </div>
            </div>

            <div className="mb-4 text-sm">
              <p className="font-semibold mb-1">Class Teacher’s Remarks:</p>
              <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} className="w-full border rounded p-2 h-16 print:hidden" placeholder="Enter class teacher remarks..." />
              <p className="border border-gray-400 p-2 min-h-12 hidden print:block">{teacherComment || " "}</p>
            </div>

            <div className="mb-6 text-sm">
              <p className="font-semibold mb-1">Headteacher’s Remarks:</p>
              <textarea value={headComment} onChange={(e) => setHeadComment(e.target.value)} className="w-full border rounded p-2 h-16 print:hidden" placeholder="Enter headteacher remarks..." />
              <p className="border border-gray-400 p-2 min-h-12 hidden print:block">{headComment || " "}</p>
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

            <div className="flex gap-3 mt-6 print:hidden flex-wrap">
              <button onClick={saveScores} className="bg-blue-600 text-white px-4 py-2 rounded">Save Score Changes</button>
              <button onClick={saveComments} className="bg-indigo-600 text-white px-4 py-2 rounded">Save Comments</button>
              <button onClick={printReport} className="bg-green-700 text-white px-4 py-2 rounded">Print Report</button>
              <button onClick={() => setSelectedStudent(null)} className="bg-gray-600 text-white px-4 py-2 rounded">Back to List</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}