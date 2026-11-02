import express from "express";
import cors from "cors";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "./data.json";
const JWT_SECRET = process.env.JWT_SECRET || "ghana-school-secret-key-change-this-in-production-2026";
const resend = new Resend(process.env.RESEND_API_KEY);

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { users: [], students: [], scores: [], attendance: [], verificationCodes: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

// Send verification code
app.post("/api/send-verification", async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const code = generateCode();
  const data = loadData();

  data.verificationCodes = data.verificationCodes || [];
  data.verificationCodes = data.verificationCodes.filter(v => v.email !== email.toLowerCase());
  data.verificationCodes.push({
    email: email.toLowerCase(),
    code,
    expires: Date.now() + 10 * 60 * 1000,
    name
  });
  saveData(data);

  try {
    await resend.emails.send({
      from: "Ghana Basic School <onboarding@resend.dev>",
      to: email,
      subject: "Your Verification Code",
      html: `<p>Hello ${name || ""},</p><p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    });
    res.json({ message: "Verification code sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Verify code and register
app.post("/api/verify-and-register", async (req, res) => {
  const { email, code, password, role } = req.body;
  if (!email || !code || !password) {
    return res.status(400).json({ error: "Email, code and password required" });
  }

  const data = loadData();
  const verification = data.verificationCodes?.find(v => v.email === email.toLowerCase() && v.code === code);

  if (!verification || Date.now() > verification.expires) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  if (data.users.some(u => u.email === email.toLowerCase())) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = {
    id: Date.now(),
    name: verification.name || "User",
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role || "Teacher",
    status: "pending",
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  data.verificationCodes = data.verificationCodes.filter(v => v.email !== email.toLowerCase());
  saveData(data);

  res.json({ message: "Account created. Waiting for Admin approval." });
});

// Forgot password - send code
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const data = loadData();
  const user = data.users.find(u => u.email === email.toLowerCase());
  if (!user) return res.status(404).json({ error: "No account found with this email" });

  const code = generateCode();
  data.verificationCodes = data.verificationCodes || [];
  data.verificationCodes = data.verificationCodes.filter(v => v.email !== email.toLowerCase());
  data.verificationCodes.push({
    email: email.toLowerCase(),
    code,
    expires: Date.now() + 10 * 60 * 1000,
    type: "reset"
  });
  saveData(data);

  try {
    await resend.emails.send({
      from: "Ghana Basic School <onboarding@resend.dev>",
      to: email,
      subject: "Password Reset Code",
      html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
    });
    res.json({ message: "Reset code sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Reset password
app.post("/api/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code and new password required" });
  }

  const data = loadData();
  const verification = data.verificationCodes?.find(v => v.email === email.toLowerCase() && v.code === code && v.type === "reset");

  if (!verification || Date.now() > verification.expires) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  const user = data.users.find(u => u.email === email.toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found" });

  user.password = await bcrypt.hash(newPassword, 12);
  data.verificationCodes = data.verificationCodes.filter(v => v.email !== email.toLowerCase());
  saveData(data);

  res.json({ message: "Password reset successfully" });
});

// Login
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

// Existing routes (kept)
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

app.post("/api/approve-user", authenticateToken, requireAdmin, (req, res) => {
  const { userId } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.status = "approved";
  saveData(data);
  res.json({ message: "User approved" });
});

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