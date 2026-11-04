"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Teacher"
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.role === "Admin" ? "approved" : "pending",
        createdAt: new Date().toISOString()
      });

      await sendEmailVerification(user);
      setMessage("Account created! Please check your email to verify your account.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-1">Ghana Basic School System</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{message}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-lg px-4 py-3">
              <option>Teacher</option>
              <option>Admin</option>
              <option>Headteacher</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white font-semibold py-3 rounded-lg">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link href="/login" className="text-green-700 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}