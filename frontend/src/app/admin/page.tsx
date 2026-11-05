"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      await loadUsers();
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setUsers(data);
  };

  const approveUser = async (id: string) => {
    await updateDoc(doc(db, "users", id), { status: "approved" });
    await loadUsers();
  };

  const revokeUser = async (id: string) => {
    await updateDoc(doc(db, "users", id), { status: "revoked" });
    await loadUsers();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await deleteDoc(doc(db, "users", id));
    await loadUsers();
  };

  const downloadBackup = async () => {
    setBackingUp(true);
    try {
      const collections = ["students", "scores", "attendance", "comments", "users"];
      const backup: any = {};

      for (const col of collections) {
        const snapshot = await getDocs(collection(db, col));
        backup[col] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ghana-school-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Backup failed. Please try again.");
    }
    setBackingUp(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const pending = users.filter(u => u.status !== "approved");
  const approved = users.filter(u => u.status === "approved");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <Link href="/dashboard" className="text-sm">← Back to Dashboard</Link>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Backup Button */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="font-semibold text-lg mb-2">Data Backup</h2>
          <p className="text-sm text-gray-500 mb-3">Download all students, scores, attendance and comments.</p>
          <button
            onClick={downloadBackup}
            disabled={backingUp}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {backingUp ? "Preparing Backup..." : "Download Backup"}
          </button>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="font-semibold text-lg mb-3">Pending Approvals</h2>
          {pending.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending users</p>
          ) : (
            pending.map(u => (
              <div key={u.id} className="flex justify-between items-center border-b py-3">
                <div>
                  <p className="font-medium">{u.name || "No Name"}</p>
                  <p className="text-sm text-gray-500">{u.email} • {u.status || "pending"}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => approveUser(u.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                    Approve
                  </button>
                  <button onClick={() => deleteUser(u.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Approved Users */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold text-lg mb-3">Approved Users</h2>
          {approved.length === 0 ? (
            <p className="text-gray-500 text-sm">No approved users</p>
          ) : (
            approved.map(u => (
              <div key={u.id} className="flex justify-between items-center border-b py-3">
                <div>
                  <p className="font-medium">{u.name || "No Name"}</p>
                  <p className="text-sm text-gray-500">{u.email} • approved</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => revokeUser(u.id)} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                    Revoke
                  </button>
                  <button onClick={() => deleteUser(u.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}