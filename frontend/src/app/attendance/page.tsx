"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Attendance</h1>
        <Link href="/dashboard" className="text-sm">← Back</Link>
      </div>
      <div className="p-4 text-center">
        <p className="text-gray-600">Attendance page is working.</p>
      </div>
    </div>
  );
}