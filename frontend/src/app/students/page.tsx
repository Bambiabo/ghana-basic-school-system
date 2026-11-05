"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        // Load students here later
        setStudents([
          { id: 1, name: "Kwame Mensah", class: "Basic 5", admission: "2024/001" },
          { id: 2, name: "Ama Owusu", class: "Basic 4", admission: "2024/002" },
        ]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Students</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>
      <div className="p-4 max-w-2xl mx-auto">
        {students.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-xl shadow mb-3">
            <p className="font-semibold">{s.name}</p>
            <p className="text-sm text-gray-500">{s.class} • {s.admission}</p>
          </div>
        ))}
      </div>
    </div>
  );
}