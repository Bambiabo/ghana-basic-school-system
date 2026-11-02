"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://ghana-basic-school-system.onrender.com";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ students: 0, classes: 0, pendingReports: 0 });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/students`);
      const students = await res.json();
      const uniqueClasses = new Set(students.map((s: any) => s.class)).size;
      setStats({
        students: students.length,
        classes: uniqueClasses,
        pendingReports: 0
      });
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏫</span>
          <div>
            <h1 className="font-bold text-lg">Ghana Basic School</h1>
            <p className="text-sm text-green-200">School Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            Welcome, <span className="font-semibold">{user.name}</span>
          </div>
          <button onClick={logout} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.students}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">Classes</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.classes}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Pending Reports</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingReports}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/scores" className="bg-green-100 hover:bg-green-200 text-green-800 py-3 px-4 rounded-lg font-medium transition text-center">
              Enter Scores
            </Link>
            <Link href="/students" className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 px-4 rounded-lg font-medium transition text-center">
              View Students
            </Link>
            <Link href="/reports" className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 px-4 rounded-lg font-medium transition text-center">
              Generate Reports
            </Link>
            <Link href="/attendance" className="bg-orange-100 hover:bg-orange-200 text-orange-800 py-3 px-4 rounded-lg font-medium transition text-center">
              Attendance
            </Link>
            <Link href="/admin" className="bg-red-100 hover:bg-red-200 text-red-800 py-3 px-4 rounded-lg font-medium transition text-center">
              Admin Panel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}