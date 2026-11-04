"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-green-200 text-sm">{user.email}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded text-sm">
          Logout
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Link href="/students" className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-3xl mb-2">👨‍🎓</div>
          <p className="font-semibold">Students</p>
        </Link>
        <Link href="/scores" className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-3xl mb-2">📝</div>
          <p className="font-semibold">Scores</p>
        </Link>
        <Link href="/attendance" className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="font-semibold">Attendance</p>
        </Link>
        <Link href="/reports" className="bg-white p-6 rounded-xl shadow text-center">
          <div className="text-3xl mb-2">📄</div>
          <p className="font-semibold">Reports</p>
        </Link>
        <Link href="/admin" className="bg-white p-6 rounded-xl shadow text-center col-span-2">
          <div className="text-3xl mb-2">⚙️</div>
          <p className="font-semibold">Admin Panel</p>
        </Link>
      </div>
    </div>
  );
}