import express from "express";
import cors from "cors";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "./data.json";
const JWT_SECRET = process.env.JWT_SECRET || "ghana-school-secret-key-change-this-in-production-2026";

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { users: [], students: [], scores: [], attendance: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const loginAttempts = new Map();

function isRateLimited(email) {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  const recent = attempts.filter(t => now - t < 15 * 60 * 1000);
  loginAttempts.set(email, recent);
  return recent.length >= 5;
}

function recordAttempt(email) {
  const attempts = loginAttempts.get(email) || [];
  attempts.push(Date.now());
  loginAttempts.set(email, attempts);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Register (creates pending account)
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters with uppercase, lowercase and number" });
  }

  const data = loadData();
  if (data.users.some(u => u.email === email.toLowerCase())) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = {
    id: Date.now(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || "Teacher",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  saveData(data);

  res.json({ message: "Account created. Waiting for Admin approval." });
});

// Login (only approved users)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  if (isRateLimited(email)) {
    return res.status(429).json({ error: "Too many login attempts. Try again later." });
  }

  const data = loadData();
  const user = data.users.find(u => u.email === email.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.password))) {
    recordAttempt(email);
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (user.status !== "approved") {
    return res.status(403).json({ error: "Account is pending Admin approval" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// Get pending users (Admin only)
app.get("/api/pending-users", authenticateToken, requireAdmin, (req, res) => {
  const data = loadData();
  const pending = data.users.filter(u => u.status === "pending").map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json(pending);
});

// Approve user (Admin only)
app.post("/api/approve-user", authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.status = "approved";
  saveData(data);
  res.json({ message: "User approved" });
});

// Existing routes
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
  console.log("Backend running on port 5000");
});