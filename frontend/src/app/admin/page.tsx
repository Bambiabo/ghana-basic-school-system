"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "https://ghana-basic-school-system.onrender.com";

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== "Admin") {
      alert("Access denied. Admin only.");
      router.push("/dashboard");
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch(`${API_URL}/api/pending-users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/all-users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPendingUsers(await pendingRes.json());
      setAllUsers(await allRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: number) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/approve-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    });
    fetchData(token!);
  };

  const revokeUser = async (userId: number) => {
    if (!confirm("Revoke this user's access?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/revoke-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    });
    fetchData(token!);
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Permanently delete this user?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/delete-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId }),
    });
    fetchData(token!);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <p className="text-sm text-green-200">Manage Users</p>
        </div>
        <Link href="/dashboard" className="text-sm hover:underline">← Back to Dashboard</Link>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Approvals</h2>
          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">No pending accounts</div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm">Name</th>
                    <th className="px-6 py-3 text-left text-sm">Email</th>
                    <th className="px-6 py-3 text-left text-sm">Role</th>
                    <th className="px-6 py-3 text-left text-sm">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => approveUser(user.id)} className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg">Approve</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Users</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Name</th>
                  <th className="px-6 py-3 text-left text-sm">Email</th>
                  <th className="px-6 py-3 text-left text-sm">Role</th>
                  <th className="px-6 py-3 text-left text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4 capitalize">{user.status}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {user.status === "approved" && (
                        <button onClick={() => revokeUser(user.id)} className="bg-yellow-600 text-white text-sm px-3 py-1.5 rounded">Revoke</button>
                      )}
                      <button onClick={() => deleteUser(user.id)} className="bg-red-600 text-white text-sm px-3 py-1.5 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}