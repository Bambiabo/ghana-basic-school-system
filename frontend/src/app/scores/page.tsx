"use client";

import Link from "next/link";
import { useState } from "react";

export default function ScoresPage() {
  const [score, setScore] = useState("");

  const total = Number(score) || 0;
  const grade = total >= 50 ? "Pass" : "Fail";

  return (
    <div className="p-6">
      <Link href="/dashboard">Back to Dashboard</Link>
      <h1 className="text-2xl font-bold my-4">Enter Scores</h1>
      <input 
        type="number" 
        value={score} 
        onChange={(e) => setScore(e.target.value)} 
        className="border p-2"
        placeholder="Enter score"
      />
      <p className="mt-4 text-lg">Total: {total}</p>
      <p className="text-lg">Grade: {grade}</p>
    </div>
  );
}