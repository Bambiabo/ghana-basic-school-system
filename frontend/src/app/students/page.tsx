"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://ghana-basic-school-system.onrender.com";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    admissionNo: "",
    class: "Basic 1",
    gender: "Male",
    photo: ""
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/students`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewStudent({ ...newStudent, photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.admissionNo) return;

    try {
      await fetch(`${API_URL}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      setNewStudent({ name: "", admissionNo: "", class: "Basic 1", gender: "Male", photo: "" });
      setShowForm(false);
      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Ghana Basic School</h1>
          <p className="text-sm text-green-200">Students</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">← Back to Dashboard</Link>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Students</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium">
            {showForm ? "Cancel" : "+ Add Student"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                <input type="text" value={newStudent.admissionNo} onChange={(e) => setNewStudent({ ...newStudent, admissionNo: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={newStudent.class} onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                  <option>Basic 1</option><option>Basic 2</option><option>Basic 3</option><option>Basic 4</option><option>Basic 5</option><option>Basic 6</option>
                  <option>JHS 1</option><option>JHS 2</option><option>JHS 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={newStudent.gender} onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                  <option>Male</option><option>Female</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Photo</label>
                <input type="file" accept="image/*" onChange={handlePhoto} className="w-full border rounded-lg px-4 py-2" />
                {newStudent.photo && <img src={newStudent.photo} alt="Preview" className="mt-2 w-20 h-24 object-cover border" />}
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg font-medium">Save Student</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-3">Photo</th>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Admission No.</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Gender</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {student.photo ? <img src={student.photo} alt="" className="w-12 h-14 object-cover border" /> : <div className="w-12 h-14 bg-gray-200 border" />}
                  </td>
                  <td className="px-6 py-4 font-medium">{student.name}</td>
                  <td className="px-6 py-4">{student.admission_no}</td>
                  <td className="px-6 py-4">{student.class}</td>
                  <td className="px-6 py-4">{student.gender}</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No students yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}