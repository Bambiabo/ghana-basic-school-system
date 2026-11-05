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
  const [showPosition, setShowPosition] = useState(false);
  const [classPositions, setClassPositions] = useState<{ [key: string]: number }>({});
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkReports, setBulkReports] = useState<any[]>([]);
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

  const calculatePositions = async () => {
    const positions: { [key: string]: number } = {};
    const allScoresQuery = query(
      collection(db, "scores"),
      where("class", "==", selectedClass),
      where("term", "==", term)
    );
    const allScoresSnapshot = await getDocs(allScoresQuery);
    const studentTotals: { [key: string]: number } = {};

    allScoresSnapshot.docs.forEach(d => {
      const data = d.data();
      const total = (Number(data.cat1) || 0) + (Number(data.cat2) || 0) + (Number(data.project) || 0) + (Number(data.exam) || 0);
      studentTotals[data.studentId] = (studentTotals[data.studentId] || 0) + total;
    });

    const sorted = Object.entries(studentTotals).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([studentId], index) => {
      positions[studentId] = index + 1;
    });

    setClassPositions(positions);
  };

  const viewReport = async (student: any) => {
    setSelectedStudent(student);
    setBulkMode(false);
    setTeacherComment("");
    setHeadComment("");
    setCommentId(null);
    setAttendanceSummary({ present: 0, absent: 0, total: 0 });

    const scoresQuery = query(
      collection(db, "scores"),
      where("studentId", "==", student.id),
      where("term", "==", term)
    );
    const scoresSnapshot = await getDocs(scoresQuery);
    const scoresData = scoresSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setScores(scoresData);

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

    if (showPosition) await calculatePositions();
  };

  const generateBulkReports = async () => {
    setBulkMode(true);
    setSelectedStudent(null);
    const reports: any[] = [];

    for (const student of students) {
      const scoresQuery = query(
        collection(db, "scores"),
        where("studentId", "==", student.id),
        where("term", "==", term)
      );
      const scoresSnapshot = await getDocs(scoresQuery);
      const studentScores = scoresSnapshot.docs.map(d => d.data());

      const commentsQuery = query(
        collection(db, "comments"),
        where("studentId", "==", student.id),
        where("term", "==", term)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      let tComment = "";
      let hComment = "";
      if (!commentsSnapshot.empty) {
        tComment = commentsSnapshot.docs[0].data().teacherComment || "";
        hComment = commentsSnapshot.docs[0].data().headComment || "";
      }

      reports.push({
        student,
        scores: studentScores,
        teacherComment: tComment,
        headComment: hComment
      });
    }

    if (showPosition) await calculatePositions();
    setBulkReports(reports);
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

  const ReportCard = ({ student, reportScores, tComment, hComment, position }: any) => (
    <div className="bg-white p-6 border-2 border-gray-300 mb-8 break-after-page">
      <div className="text-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-2xl font-bold">GHANA BASIC SCHOOL</h1>
        <p className="text-sm">TERMINAL REPORT CARD</p>
        <p className="font-semibold mt-1">{term} • Academic Year 2025/2026</p>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="w-24 h-28 border border-gray-400 flex items-center justify-center bg-gray-100 overflow-hidden">
          {student.photo ? (
            <img src={student.photo} alt="Passport" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-500 text-center">Passport<br/>Photo</span>
          )}
        </div>
        <div className="flex-1 text-sm space-y-1">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Admission No:</strong> {student.admissionNumber}</p>
          <p><strong>Class:</strong> {student.class}</p>
          <p><strong>Gender:</strong> {student.gender || "—"}</p>
          <p><strong>Term:</strong> {term}</p>
          {showPosition && position && <p><strong>Class Position:</strong> {position}</p>}
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
          {reportScores.length === 0 ? (
            <tr>
              <td colSpan={8} className="border border-gray-400 p-3 text-center text-gray-500">
                No scores recorded
              </td>
            </tr>
          ) : (
            reportScores.map((s: any, i: number) => {
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

      <div className="mb-4 text-sm">
        <p className="font-semibold">Class Teacher’s Remarks:</p>
        <p className="border border-gray-400 p-2 min-h-12">{tComment || " "}</p>
      </div>

      <div className="mb-6 text-sm">
        <p className="font-semibold">Headteacher’s Remarks:</p>
        <p className="border border-gray-400 p-2 min-h-12">{hComment || " "}</p>
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
    </div>
  );

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center print:hidden">
        <h1 className="text-xl font-bold">Terminal Reports</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-4xl mx-auto print:p-0">
        {!selectedStudent && !bulkMode ? (
          <>
            <div className="bg-white p-4 rounded-xl shadow mb-4 space-y-3 print:hidden">
              <div className="flex gap-3">
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-2 flex-1">
                  <option>Basic 1</option><option>Basic 2</option><option>Basic 3</option>
                  <option>Basic 4</option><option>Basic 5</option><option>Basic 6</option>
                  <option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
                </select>
                <select value={term} onChange={(e) => setTerm(e.target.value)} className="border rounded-lg px-3 py-2">
                  <option>Term 1</option><option>Term 2</option><option>Term 3</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showPosition} onChange={(e) => setShowPosition(e.target.checked)} />
                Show Class Position (optional)
              </label>
              <button onClick={generateBulkReports} className="w-full bg-blue-600 text-white py-2 rounded-lg">
                Generate Bulk Reports for {selectedClass}
              </button>
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
        ) : bulkMode ? (
          <div>
            <div className="flex gap-3 mb-4 print:hidden">
              <button onClick={printReport} className="bg-green-700 text-white px-4 py-2 rounded">Print All Reports</button>
              <button onClick={() => setBulkMode(false)} className="bg-gray-600 text-white px-4 py-2 rounded">Back</button>
            </div>
            {bulkReports.map((r, i) => (
              <ReportCard
                key={i}
                student={r.student}
                reportScores={r.scores}
                tComment={r.teacherComment}
                hComment={r.headComment}
                position={classPositions[r.student.id]}
              />
            ))}
          </div>
        ) : (
          <div>
            <ReportCard
              student={selectedStudent}
              reportScores={scores}
              tComment={teacherComment}
              hComment={headComment}
              position={classPositions[selectedStudent?.id]}
            />

            <div className="flex gap-3 mt-4 print:hidden flex-wrap">
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