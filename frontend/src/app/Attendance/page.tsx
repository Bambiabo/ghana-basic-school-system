"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState<any>({});

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/students");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAttendance = (studentId: number, status: string) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const saveAttendance = async () => {
    try {
      await fetch("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records: attendance }),
      });
      alert("Attendance saved successfully!");
    } catch (error) {
      alert("Failed to save attendance.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Ghana Basic School</h1>
          <p className="text-sm text-green-200">Attendance</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Attendance</h2>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Mark Attendance</h3>
            <button
              onClick={saveAttendance}
              className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Save Attendance
            </button>
          </div>

          <div className="divide-y">
            {students.map((student) => (
              <div key={student.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.class}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAttendance(student.id, "Present")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      attendance[student.id] === "Present"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => toggleAttendance(student.id, "Absent")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      attendance[student.id] === "Absent"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <p className="px-6 py-8 text-center text-gray-500">
                No students found. Add students first.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}