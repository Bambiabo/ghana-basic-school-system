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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Reports</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
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
            <button className="bg-green-700 text-white px-3 py-1 rounded text-sm">
              View Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}