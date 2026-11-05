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
    setScores([]);

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
      const c = commentsSnapshot.docs[0];
      setCommentId(c.id);
      setTeacherComment(c.data().teacherComment || "");
      setHeadComment(c.data().headComment || "");
    }
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
    alert("Scores saved!");
  };

  const saveComments = async () => {
    if (!selectedStudent) return;
    const data = {
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      term,
      teacherComment,
      headComment,
      updatedAt: new Date().toISOString()
    };
    if (commentId) {
      await updateDoc(doc(db, "comments", commentId), data);
    } else {
      const newDoc = await addDoc(collection(db, "comments"), data);
      setCommentId(newDoc.id);
    }
    alert("Comments saved!");
  };

  const calculateTotal = (s: any) =>
    (Number(s.cat1) || 0) + (Number(s.cat2) || 0) + (Number(s.project) || 0) + (Number(s.exam) || 0);

  const getGrade = (t: number) => {
    if (t >= 80) return "A1";
    if (t >= 75) return "B2";
    if (t >= 70) return "B3";
    if (t >= 65) return "C4";
    if (t >= 60) return "C5";
    if (t >= 55) return "C6";
    if (t >= 50) return "D7";
    if (t >= 45) return "E8";
    return "F9";
  };

  const getRemark = (t: number) => {
    if (t >= 80) return "Excellent";
    if (t >= 70) return "Very Good";
    if (t >= 60) return "Good";
    if (t >= 50) return "Credit";
    if (t >= 45) return "Pass";
    return "Fail";
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center print:hidden">
        <h1 className="text-xl font-bold">Terminal Reports</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {!selectedStudent ? (
          <>
            <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-3">
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
              <div key={s.id} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.class} • {s.admissionNumber}</p>
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

            <div className="text-sm mb-4 space-y-1">
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <p><strong>Admission No:</strong> {selectedStudent.admissionNumber}</p>
              <p><strong>Class:</strong> {selectedStudent.class}</p>
              <p><strong>Term:</strong> {term}</p>
            </div>

            <table className="w-full text-sm border-collapse border border-gray-400 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Subject</th>
                  <th className="border p-2">CAT 1</th>
                  <th className="border p-2">CAT 2</th>
                  <th className="border p-2">Project</th>
                  <th className="border p-2">Exam</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Grade</th>
                  <th className="border p-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border p-3 text-center text-gray-500">
                      No scores recorded for this term
                    </td>
                  </tr>
                ) : (
                  scores.map(s => {
                    const total = calculateTotal(s);
                    return (
                      <tr key={s.id}>
                        <td className="border p-2">{s.subject}</td>
                        <td className="border p-2 text-center">
                          <input type="number" value={s.cat1 || ""} onChange={(e) => updateScoreField(s.id, "cat1", e.target.value)} className="w-14 border rounded px-1 text-center" />
                        </td>
                        <td className="border p-2 text-center">
                          <input type="number" value={s.cat2 || ""} onChange={(e) => updateScoreField(s.id, "cat2", e.target.value)} className="w-14 border rounded px-1 text-center" />
                        </td>
                        <td className="border p-2 text-center">
                          <input type="number" value={s.project || ""} onChange={(e) => updateScoreField(s.id, "project", e.target.value)} className="w-14 border rounded px-1 text-center" />
                        </td>
                        <td className="border p-2 text-center">
                          <input type="number" value={s.exam || ""} onChange={(e) => updateScoreField(s.id, "exam", e.target.value)} className="w-14 border rounded px-1 text-center" />
                        </td>
                        <td className="border p-2 text-center font-semibold">{total}</td>
                        <td className="border p-2 text-center font-bold">{getGrade(total)}</td>
                        <td className="border p-2 text-center">{getRemark(total)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="mb-4">
              <p className="font-semibold text-sm mb-1">Class Teacher’s Remarks:</p>
              <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} className="w-full border rounded p-2 h-16" placeholder="Type remarks here..." />
            </div>

            <div className="mb-6">
              <p className="font-semibold text-sm mb-1">Headteacher’s Remarks:</p>
              <textarea value={headComment} onChange={(e) => setHeadComment(e.target.value)} className="w-full border rounded p-2 h-16" placeholder="Type remarks here..." />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button onClick={saveScores} className="bg-blue-600 text-white px-4 py-2 rounded">Save Score Changes</button>
              <button onClick={saveComments} className="bg-indigo-600 text-white px-4 py-2 rounded">Save Comments</button>
              <button onClick={() => window.print()} className="bg-green-700 text-white px-4 py-2 rounded">Print Report</button>
              <button onClick={() => setSelectedStudent(null)} className="bg-gray-600 text-white px-4 py-2 rounded">Back to List</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}