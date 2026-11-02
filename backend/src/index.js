import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "./data.json";

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { students: [], scores: [], attendance: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Students
app.get("/api/students", (req, res) => {
  const data = loadData();
  res.json(data.students || []);
});

app.post("/api/students", (req, res) => {
  const data = loadData();
  const newStudent = { id: Date.now(), ...req.body };
  if (!data.students) data.students = [];
  data.students.push(newStudent);
  saveData(data);
  res.json(newStudent);
});

// Scores
app.get("/api/scores", (req, res) => {
  const data = loadData();
  res.json(data.scores || []);
});

app.post("/api/scores", (req, res) => {
  const data = loadData();
  data.scores = req.body;
  saveData(data);
  res.json({ message: "Scores saved" });
});

// Attendance
app.get("/api/attendance", (req, res) => {
  const data = loadData();
  res.json(data.attendance || []);
});

app.post("/api/attendance", (req, res) => {
  const data = loadData();
  if (!data.attendance) data.attendance = [];
  data.attendance.push(req.body);
  saveData(data);
  res.json({ message: "Attendance saved" });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});