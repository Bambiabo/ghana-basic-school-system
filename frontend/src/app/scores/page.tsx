"use client";
import Link from "next/link"; import { useState } from "react";
export default function ScoresPage() { const [cat1, setCat1] = useState(""); const [cat2, setCat2] = useState(""); const [project, setProject] = useState(""); const [exam, setExam] = useState("");
const total = (Number(cat1)  0) + (Number(cat2)  0) + (Number(project)  0) + (Number(exam)  0);
let grade = "F"; if (total >= 80) grade = "A"; else if (total >= 70) grade = "B"; else if (total >= 60) grade = "C"; else if (total >= 50) grade = "D";
return ( <div className="min-h-screen bg-gray-100 p-6"> <Link href="/dashboard" className="text-green-700 underline">← Back to Dashboard</Link>
  <h1 className="text-2xl font-bold mt-4 mb-6">Enter Scores</h1>

  <div className="bg-white p-6 rounded-lg shadow max-w-md">
    <p className="font-medium mb-3">Ama Serwaa Mensah</p>
    
    <input type="number" placeholder="CAT 1" value={cat1} onChange={(e) => setCat1(e.target.value)} className="border p-2 mr-2 mb-2 w-20" />
    <input type="number" placeholder="CAT 2" value={cat2} onChange={(e) => setCat2(e.target.value)} className="border p-2 mr-2 mb-2 w-20" />
    <input type="number" placeholder="Project" value={project} onChange={(e) => setProject(e.target.value)} className="border p-2 mr-2 mb-2 w-20" />
    <input type="number" placeholder="Exam" value={exam} onChange={(e) => setExam(e.target.value)} className="border p-2 mr-2 mb-2 w-20" />
    
    <p className="mt-4 text-lg font-bold">Total: {total}</p>
    <p className="text-lg font-bold">Grade: {grade}</p>
  </div>
</div>
); } 