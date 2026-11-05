"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

const SUBJECTS = [
  "English Language",
  "Mathematics",
  "Integrated Science",
  "Social Studies",
  "Religious and Moral Education (RME)",
  "Ghanaian Language",
  "Creative Arts",
  "Our World Our People (OWOP)",
  "Computing",
  "French",
  "Physical Education",
  "Career Technology"
];

export default function ScoresPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("Basic 1");
  const [subject, setSubject] = useState("English Language");
  const [term, setTerm] = useState("Term 1");
  const [scores, setScores] = useState<{ [key: string]: { cat1: string; cat2: string; project: string; exam: string } }>({});
  const [saving, setSaving] = useState(false);
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
    setScores({});
  };

  useEffect(() => {
    if (!loading) loadStudents();
  }, [selectedClass]);

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const saveScores = async () => {
    setSaving(true);
    try {
      for (const student of students) {
        const score = scores[student.id] || {};
        if (!score.cat1 && !score.cat2 && !score.project && !score.exam) continue;

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
      setScores({});
    } catch (error) {
      alert("Error saving scores. Please try again.");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Enter Scores</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
              <option>Basic 1</option><option>Basic 2</option><option>Basic 3</option>
              <option>Basic 4</option><option>Basic 5</option><option>Basic 6</option>
              <option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
              {SUBJECTS.map(sub => <option key={sub}>{sub}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Term</label>
            <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
              <option>Term 1</option><option>Term 2</option><option>Term 3</option>
            </select>
          </div>
        </div>

        {/* Scores Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-center">CAT 1<br/><span className="text-xs font-normal">(10)</span></th>
                <th className="p-3 text-center">CAT 2<br/><span className="text-xs font-normal">(10)</span></th>
                <th className="p-3 text-center">Project<br/><span className="text-xs font-normal">(10)</span></th>
                <th className="p-3 text-center">Exam<br/><span className="text-xs font-normal">(70)</span></th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No students found in {selectedClass}
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-center">
                      <input type="number" min="0" max="10" className="w-16 border rounded px-2 py-1 text-center" 
                        value={scores[s.id]?.cat1 || ""} 
                        onChange={(e) => handleScoreChange(s.id, "cat1", e.target.value)} />
                    </td>
                    <td className="p-3 text-center">
                      <input type="number" min="0" max="10" className="w-16 border rounded px-2 py-1 text-center" 
                        value={scores[s.id]?.cat2 || ""} 
                        onChange={(e) => handleScoreChange(s.id, "cat2", e.target.value)} />
                    </td>
                    <td className="p-3 text-center">
                      <input type="number" min="0" max="10" className="w-16 border rounded px-2 py-1 text-center" 
                        value={scores[s.id]?.project || ""} 
                        onChange={(e) => handleScoreChange(s.id, "project", e.target.value)} />
                    </td>
                    <td className="p-3 text-center">
                      <input type="number" min="0" max="70" className="w-16 border rounded px-2 py-1 text-center" 
                        value={scores[s.id]?.exam || ""} 
                        onChange={(e) => handleScoreChange(s.id, "exam", e.target.value)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button
          onClick={saveScores}
          disabled={saving || students.length === 0}
          className="mt-4 w-full bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Scores"}
        </button>
      </div>
    </div>
  );
}