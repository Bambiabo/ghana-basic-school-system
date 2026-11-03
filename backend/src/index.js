import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "ghana-school-secret-key-change-this-in-production-2026";
const resend = new Resend(process.env.RESEND_API_KEY);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name TEXT,
      admission_no TEXT,
      class TEXT,
      gender TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      student_id INTEGER,
      cat1 INTEGER,
      cat2 INTEGER,
      project INTEGER,
      exam INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      date TEXT,
      records JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email TEXT,
      code TEXT,
      type TEXT,
      expires BIGINT,
      name TEXT
    );
  `);
}
initDB().catch(console.error);

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
  await pool.query("DELETE FROM verification_codes WHERE email = $1", [email.toLowerCase()]);
  await pool.query(
    "INSERT INTO verification_codes (email, code, expires, name) VALUES ($1, $2, $3, $4)",
    [email.toLowerCase(), code, Date.now() + 10 * 60 * 1000, name]
  );

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

// Verify and register
app.post("/api/verify-and-register", async (req, res) => {
  const { email, code, password, role } = req.body;
  if (!email || !code || !password) {
    return res.status(400).json({ error: "Email, code and password required" });
  }

  const result = await pool.query(
    "SELECT * FROM verification_codes WHERE email = $1 AND code = $2",
    [email.toLowerCase(), code]
  );
  const verification = result.rows[0];

  if (!verification || Date.now() > verification.expires) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await pool.query(
    "INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5)",
    [verification.name || "User", email.toLowerCase(), hashedPassword, role || "Teacher", "pending"]
  );
  await pool.query("DELETE FROM verification_codes WHERE email = $1", [email.toLowerCase()]);

  res.json({ message: "Account created. Waiting for Admin approval." });
});

// Forgot password
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const userResult = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: "No account found with this email" });
  }

  const code = generateCode();
  await pool.query("DELETE FROM verification_codes WHERE email = $1", [email.toLowerCase()]);
  await pool.query(
    "INSERT INTO verification_codes (email, code, type, expires) VALUES ($1, $2, $3, $4)",
    [email.toLowerCase(), code, "reset", Date.now() + 10 * 60 * 1000]
  );

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

  const result = await pool.query(
    "SELECT * FROM verification_codes WHERE email = $1 AND code = $2 AND type = 'reset'",
    [email.toLowerCase(), code]
  );
  const verification = result.rows[0];

  if (!verification || Date.now() > verification.expires) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email.toLowerCase()]);
  await pool.query("DELETE FROM verification_codes WHERE email = $1", [email.toLowerCase()]);

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

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
  const user = result.rows[0];

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

// Pending users
app.get("/api/pending-users", authenticateToken, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE status = 'pending'"
  );
  res.json(result.rows);
});

// Approve user
app.post("/api/approve-user", authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.body;
  await pool.query("UPDATE users SET status = 'approved' WHERE id = $1", [userId]);
  res.json({ message: "User approved" });
});

// Students
app.get("/api/students", async (req, res) => {
  const result = await pool.query("SELECT * FROM students ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/students", async (req, res) => {
  const { name, admissionNo, class: className, gender } = req.body;
  const result = await pool.query(
    "INSERT INTO students (name, admission_no, class, gender) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, admissionNo, className, gender]
  );
  res.json(result.rows[0]);
});

// Scores
app.get("/api/scores", async (req, res) => {
  const result = await pool.query("SELECT * FROM scores");
  res.json(result.rows);
});

app.post("/api/scores", async (req, res) => {
  // Simple version: clear and re-insert for now
  await pool.query("DELETE FROM scores");
  for (const s of req.body) {
    await pool.query(
      "INSERT INTO scores (student_id, cat1, cat2, project, exam) VALUES ($1, $2, $3, $4, $5)",
      [s.id, s.cat1 || 0, s.cat2 || 0, s.project || 0, s.exam || 0]
    );
  }
  res.json({ message: "Scores saved" });
});

// Attendance
app.get("/api/attendance", async (req, res) => {
  const result = await pool.query("SELECT * FROM attendance ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/attendance", async (req, res) => {
  const { date, records } = req.body;
  await pool.query("INSERT INTO attendance (date, records) VALUES ($1, $2)", [date, records]);
  res.json({ message: "Attendance saved" });
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});