"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
import Link from "next/link";

const TEACHER_REMARKS = [
  "Excellent performance. Keep it up.",
  "Very good work. Continue working hard.",
  "Good effort. Can do better with more practice.",
  "Average performance. Needs more attention.",
  "Weak in most subjects. Needs serious improvement.",
  "Shows great interest in learning.",
  "Needs to improve on class participation.",
  "A hardworking and disciplined student.",
  "Should pay more attention in class.",
  "Promising student with room for improvement."
];

const HEAD_REMARKS = [
  "Promoted to the next class.",
  "Encouraged to work harder next term.",
  "Good conduct and academic performance.",
  "Needs improvement in academic work.",
  "Has the potential to do better.",
  "Satisfactory performance.",
  "Must put in more effort next term.",
  "Well done. Keep it up.",
  "Advised to take studies more seriously.",
  "Recommended for promotion."
];

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
  const [photoUrl, setPhotoUrl] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
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
    setPhotoUrl(student.photo || "");

    const scoresQuery = query(
      collection(db, "scores"),
      where("studentId", "==", student.id),
      where("term", "==", term)
    );
    const scoresSnapshot = await getDocs(scoresQuery);
    setScores(scoresSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setPhotoUrl(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const savePhoto = async () => {
    if (!selectedStudent || !photoUrl) return;
    setSavingPhoto(true);
    try {
      await updateDoc(doc(db, "students", selectedStudent.id), { photo: photoUrl });
      setSelectedStudent({ ...selectedStudent, photo: photoUrl });
      alert("Photo saved successfully!");
    } catch (error) {
      alert("Failed to save photo.");
    }
    setSavingPhoto(false);
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
    <div className="min-h-screen bg-gray-100">
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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                    {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : "👤"}
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
          <div className="bg-white shadow-lg border border-gray-300 p-8 print:shadow-none print:border-0">
            {/* Header */}
            <div className="text-center border-b-4 border-green-800 pb-4 mb-6">
              <div className="flex justify-center items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center text-white text-2xl">🏫</div>
                <div>
                  <h1 className="text-2xl font-bold text-green-900 tracking-wide">GHANA BASIC SCHOOL</h1>
                  <p className="text-sm text-gray-600">Excellence in Education</p>
                </div>
              </div>
              <h2 className="text-lg font-semibold mt-3 text-gray-800">TERMINAL REPORT CARD</h2>
              <p className="text-sm font-medium text-green-800 mt-1">{term} • Academic Year 2025/2026</p>
            </div>

            {/* Student Info */}
            <div className="flex gap-6 mb-6">
              <div className="w-32 h-40 border-2 border-green-800 flex items-center justify-center bg-gray-50 overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} alt="Passport" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400 text-center">Passport<br/>Photograph</span>
                )}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-y-2 text-sm">
                <p><span className="font-semibold text-gray-600">Name:</span> {selectedStudent.name}</p>
                <p><span className="font-semibold text-gray-600">Admission No:</span> {selectedStudent.admissionNumber}</p>
                <p><span className="font-semibold text-gray-600">Class:</span> {selectedStudent.class}</p>
                <p><span className="font-semibold text-gray-600">Gender:</span> {selectedStudent.gender || "—"}</p>
                <p><span className="font-semibold text-gray-600">Term:</span> {term}</p>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mb-5 print:hidden bg-gray-50 p-3 rounded">
              <label className="text-sm font-medium text-gray-700">Upload Passport Photo</label>
              <div className="flex gap-2 mt-1 items-center">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
                <button onClick={savePhoto} disabled={savingPhoto || !photoUrl} className="bg-green-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50">
                  {savingPhoto ? "Saving..." : "Save Photo"}
                </button>
              </div>
            </div>

            {/* Scores Table */}
            <table className="w-full text-sm border-collapse mb-6">
              <thead>
                <tr className="bg-green-800 text-white">
                  <th className="border border-green-900 p-2 text-left">Subject</th>
                  <th className="border border-green-900 p-2">CAT 1</th>
                  <th className="border border-green-900 p-2">CAT 2</th>
                  <th className="border border-green-900 p-2">Project</th>
                  <th className="border border-green-900 p-2">Exam</th>
                  <th className="border border-green-900 p-2">Total</th>
                  <th className="border border-green-900 p-2">Grade</th>
                  <th className="border border-green-900 p-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="border border-gray-300 p-4 text-center text-gray-500">
                      No scores recorded for this term
                    </td>
                  </tr>
                ) : (
                  scores.map(s => {
                    const total = calculateTotal(s);
                    return (
                      <tr key={s.id} className="even:bg-gray-50">
                        <td className="border border-gray-300 p-2">{s.subject}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input type="number" value={s.cat1 || ""} onChange={(e) => updateScoreField(s.id, "cat1", e.target.value)} className="w-12 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input type="number" value={s.cat2 || ""} onChange={(e) => updateScoreField(s.id, "cat2", e.target.value)} className="w-12 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input type="number" value={s.project || ""} onChange={(e) => updateScoreField(s.id, "project", e.target.value)} className="w-12 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <input type="number" value={s.exam || ""} onChange={(e) => updateScoreField(s.id, "exam", e.target.value)} className="w-12 border rounded px-1 text-center print:border-0 print:bg-transparent" />
                        </td>
                        <td className="border border-gray-300 p-2 text-center font-semibold">{total}</td>
                        <td className="border border-gray-300 p-2 text-center font-bold text-green-800">{getGrade(total)}</td>
                        <td className="border border-gray-300 p-2 text-center text-xs">{getRemark(total)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Remarks */}
            <div className="mb-4">
              <p className="font-semibold text-sm text-green-900 mb-1">Class Teacher’s Remarks</p>
              <select onChange={(e) => setTeacherComment(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-2 print:hidden">
                <option value="">— Select a standard remark —</option>
                {TEACHER_REMARKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="border border-gray-300 rounded p-2 min-h-14 text-sm bg-gray-50">
                <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} className="w-full bg-transparent outline-none resize-none h-12 print:hidden" placeholder="Type or select a remark..." />
                <p className="hidden print:block">{teacherComment || " "}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="font-semibold text-sm text-green-900 mb-1">Headteacher’s Remarks</p>
              <select onChange={(e) => setHeadComment(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mb-2 print:hidden">
                <option value="">— Select a standard remark —</option>
                {HEAD_REMARKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="border border-gray-300 rounded p-2 min-h-14 text-sm bg-gray-50">
                <textarea value={headComment} onChange={(e) => setHeadComment(e.target.value)} className="w-full bg-transparent outline-none resize-none h-12 print:hidden" placeholder="Type or select a remark..." />
                <p className="hidden print:block">{headComment || " "}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between text-sm mt-10">
              <div className="text-center">
                <div className="border-b-2 border-gray-800 w-48 mb-1"></div>
                <p className="font-medium">Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-gray-800 w-48 mb-1"></div>
                <p className="font-medium">Headteacher</p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap mt-8 print:hidden">
              <button onClick={saveScores} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Save Score Changes</button>
              <button onClick={saveComments} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">Save Comments</button>
              <button onClick={() => window.print()} className="bg-green-700 text-white px-4 py-2 rounded text-sm">Print Report</button>
              <button onClick={() => setSelectedStudent(null)} className="bg-gray-600 text-white px-4 py-2 rounded text-sm">Back to List</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}