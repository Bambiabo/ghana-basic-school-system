"use client";

import Link from "next/link";
import { useState } from "react";

export default function StudentsPage() {
  const [students, setStudents] = useState([
    { id: 1, name: "Ama Serwaa Mensah", admissionNo: "GES/2023/0145", class: "JHS 2", gender: "Female" },
    { id: 2, name: "Kwame Asante", admissionNo: "GES/2023/0146", class: "JHS 2", gender: "Male" },
    { id: 3, name: "Abena Osei", admissionNo: "GES/2023/0147", class: "Basic 6", gender: "Female" },
    { id: 4, name: "Kofi Boateng", admissionNo: "GES/2023/0148", class: "JHS 1", gender: "Male" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    admissionNo: "",
    class: "Basic 1",
    gender: "Male",
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.admissionNo) return;

    const student = {
      id: students.length + 1,
      ...newStudent,
    };

    setStudents([...students, student]);
    setNewStudent({ name: "", admissionNo: "", class: "Basic 1", gender: "Male" });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Ghana Basic School</h1>
          <p className="text-sm text-green-200">Students</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">
          ← Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Students</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            {showForm ? "Cancel" : "+ Add Student"}
          </button>
        </div>

        {/* Add Student Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Add New Student</h3>
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                <input
                  type="text"
                  value={newStudent.admissionNo}
                  onChange={(e) => setNewStudent({ ...newStudent, admissionNo: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="e.g. GES/2024/0001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={newStudent.class}
                  onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={newStudent.gender}
                  onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg font-medium"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Admission No.</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Gender</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student, index) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{student.name}</td>
                  <td className="px-6 py-4">{student.admissionNo}</td>
                  <td className="px-6 py-4">{student.class}</td>
                  <td className="px-6 py-4">{student.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}