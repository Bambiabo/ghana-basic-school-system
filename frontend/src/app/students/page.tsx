"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    admissionNumber: "",
    class: "Basic 1",
    gender: "Male",
    guardian: "",
    phone: ""
  });
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
    const snapshot = await getDocs(collection(db, "students"));
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setStudents(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "students"), {
      ...form,
      createdAt: new Date().toISOString()
    });
    setForm({ name: "", admissionNumber: "", class: "Basic 1", gender: "Male", guardian: "", phone: "" });
    setShowForm(false);
    await loadStudents();
  };

  const deleteStudent = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    await deleteDoc(doc(db, "students", id));
    await loadStudents();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Students</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg mb-4"
        >
          {showForm ? "Cancel" : "+ Add Student"}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
            <input
              type="text"
              placeholder="Student Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Admission Number"
              required
              value={form.admissionNumber}
              onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <select
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option>Basic 1</option>
              <option>Basic 2</option>
              <option>Basic 3</option>
              <option>Basic 4</option>
              <option>Basic 5</option>
              <option>Basic 6</option>
              <option>JHS 1</option>
              <option>JHS 2</option>
              <option>JHS 3</option>
            </select>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option>Male</option>
              <option>Female</option>
            </select>
            <input
              type="text"
              placeholder="Guardian Name"
              value={form.guardian}
              onChange={(e) => setForm({ ...form, guardian: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
            <button type="submit" className="w-full bg-green-700 text-white py-2 rounded-lg">
              Save Student
            </button>
          </form>
        )}

        {students.length === 0 ? (
          <p className="text-gray-500 text-center">No students yet. Click “Add Student” to begin.</p>
        ) : (
          students.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.class} • {s.admissionNumber}</p>
                {s.guardian && <p className="text-xs text-gray-400">Guardian: {s.guardian}</p>}
              </div>
              <button
                onClick={() => deleteStudent(s.id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}