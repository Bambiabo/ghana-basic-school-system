"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, []);

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setPending(users.filter(u => u.status === "pending"));
    setAllUsers(users);
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
    if (!confirm("Delete this user?")) return;
    await deleteDoc(doc(db, "users", id));
    await loadUsers();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-green-200 text-sm">Manage Users</p>
        </div>
        <button onClick={() => router.push("/dashboard")} className="text-sm">
          ← Back to Dashboard
        </button>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-3">Pending Approvals</h2>
        <div className="bg-white rounded-xl shadow mb-6 overflow-hidden">
          {pending.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No pending users</p>
          ) : (
            pending.map(u => (
              <div key={u.id} className="flex justify-between items-center p-4 border-b">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <button onClick={() => approveUser(u.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Approve
                </button>
              </div>
            ))
          )}
        </div>

        <h2 className="text-lg font-semibold mb-3">All Users</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {allUsers.map(u => (
            <div key={u.id} className="flex justify-between items-center p-4 border-b">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email} • {u.status}</p>
              </div>
              <div className="space-x-2">
                {u.status === "approved" && (
                  <button onClick={() => revokeUser(u.id)} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                    Revoke
                  </button>
                )}
                <button onClick={() => deleteUser(u.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}