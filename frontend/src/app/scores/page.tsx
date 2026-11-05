"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function ScoresPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("Basic 1");
  const [subject, setSubject] = useState("Mathematics");
  const [term, setTerm] = useState("Term 1");
  const [scores, setScores] = useState<{ [key: string]: { cat1: string; cat2: string; project: string; exam: string } }>({});
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

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const saveScores = async () => {
    for (const student of students) {
      const score = scores[student.id] || {};
      await addDoc(collection(db, "scores"), {
        studentId: student.id,
        studentName: student.name,
        class: selectedClass,
        subject,
        term,
        cat1: Number(score.cat1) || 0,
        cat2: Number(score.cat2) || 0,
        project: Number(score.project) || 0,
        exam: Number(score.exam) || 0,
        createdAt: new Date().toISOString()
      });
    }
    alert("Scores saved successfully!");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Scores</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white p-4 rounded-xl shadow mb-4 grid grid-cols-3 gap-3">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-2">
            <option>Basic 1</option><option>Basic 2</option><option>Basic 3</option>
            <option>Basic 4</option><option>Basic 5</option><option>Basic 6</option>
            <option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
          </select>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border rounded-lg px-3 py-2">
            <option>Mathematics</option><option>English</option><option>Science</option>
            <option>Social Studies</option><option>RME</option><option>Ghanaian Language</option>
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="border rounded-lg px-3 py-2">
            <option>Term 1</option><option>Term 2</option><option>Term 3</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Student</th>
                <th className="p-2">CAT 1</th>
                <th className="p-2">CAT 2</th>
                <th className="p-2">Project</th>
                <th className="p-2">Exam</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2"><input type="number" className="w-16 border rounded px-1" onChange={(e) => handleScoreChange(s.id, "cat1", e.target.value)} /></td>
                  <td className="p-2"><input type="number" className="w-16 border rounded px-1" onChange={(e) => handleScoreChange(s.id, "cat2", e.target.value)} /></td>
                  <td className="p-2"><input type="number" className="w-16 border rounded px-1" onChange={(e) => handleScoreChange(s.id, "project", e.target.value)} /></td>
                  <td className="p-2"><input type="number" className="w-16 border rounded px-1" onChange={(e) => handleScoreChange(s.id, "exam", e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={saveScores} className="mt-4 w-full bg-green-700 text-white py-3 rounded-lg font-semibold">
          Save Scores
        </button>
      </div>
    </div>
  );
}