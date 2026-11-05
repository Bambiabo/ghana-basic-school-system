"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("Basic 1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
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

  const markAttendance = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    for (const student of students) {
      await addDoc(collection(db, "attendance"), {
        studentId: student.id,
        studentName: student.name,
        class: selectedClass,
        date,
        status: attendance[student.id] || "Present",
        createdAt: new Date().toISOString()
      });
    }
    alert("Attendance saved!");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Attendance</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-3">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded-lg px-3 py-2 flex-1">
            <option>Basic 1</option><option>Basic 2</option><option>Basic 3</option>
            <option>Basic 4</option><option>Basic 5</option><option>Basic 6</option>
            <option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded-lg px-3 py-2" />
        </div>

        {students.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center">
            <p className="font-medium">{s.name}</p>
            <div className="space-x-2">
              <button onClick={() => markAttendance(s.id, "Present")} className={`px-3 py-1 rounded text-sm ${attendance[s.id] === "Present" || !attendance[s.id] ? "bg-green-600 text-white" : "bg-gray-200"}`}>Present</button>
              <button onClick={() => markAttendance(s.id, "Absent")} className={`px-3 py-1 rounded text-sm ${attendance[s.id] === "Absent" ? "bg-red-600 text-white" : "bg-gray-200"}`}>Absent</button>
            </div>
          </div>
        ))}

        <button onClick={saveAttendance} className="mt-4 w-full bg-green-700 text-white py-3 rounded-lg font-semibold">
          Save Attendance
        </button>
      </div>
    </div>
  );
}