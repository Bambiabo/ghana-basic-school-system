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
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}
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
      photo TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      student_id INTEGER,
      class TEXT,
      term TEXT,
      subject TEXT,
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

app.post("/api/send-verification", async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const code = generateCode();
  await pool.query("DELETE FROM verification_codes WHERE email = $1", [email.toLowerCase()]);
  await pool.query(
    "INSERT INTO verification_codes (email, code, expires, name) VALUES ($1, $2, $3, $4)",
    [email.toLowerCase(), code, Date.now() + 10 * 60 * 1000, name]
  );

  if (resend) {
    try {
      await resend.emails.send({
        from: "Ghana Basic School <onboarding@resend.dev>",
        to: email,
        subject: "Your Verification Code",
        html: `<p>Hello ${name || ""},</p><p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
      });
    } catch (error) {
      console.error(error);
    }
  }

  res.json({ message: "Verification code generated", code });
});

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

  const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'Admin' AND status = 'approved'");
  const status = (role === "Admin" && adminCount.rows[0].count === "0") ? "approved" : "pending";

  await pool.query(
    "INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5)",
    [verification.name || "User", email.toLowerCase(), hashedPassword, role || "Teacher", status]
  );
  await pool.query("DELETE FROM verification_codes WHERE email = $1", [email.toLowerCase()]);

  res.json({ message: "Account created successfully." });
});

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

  if (resend) {
    try {
      await resend.emails.send({
        from: "Ghana Basic School <onboarding@resend.dev>",
        to: email,
        subject: "Password Reset Code",
        html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
      });
    } catch (error) {
      console.error(error);
    }
  }

  res.json({ message: "Reset code generated", code });
});

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
    return res.status(403).json({ error: "Account is not approved or has been revoked" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

app.get("/api/pending-users", authenticateToken, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users WHERE status = 'pending'"
  );
  res.json(result.rows);
});

app.post("/api/approve-user", authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.body;
  await pool.query("UPDATE users SET status = 'approved' WHERE id = $1", [userId]);
  res.json({ message: "User approved" });
});

app.get("/api/all-users", authenticateToken, requireAdmin, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, role, status, created_at FROM users ORDER BY id DESC"
  );
  res.json(result.rows);
});

app.post("/api/revoke-user", authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.body;
  await pool.query("UPDATE users SET status = 'revoked' WHERE id = $1", [userId]);
  res.json({ message: "User access revoked" });
});

app.post("/api/delete-user", authenticateToken, requireAdmin, async (req, res) => {
  const { userId } = req.body;
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  res.json({ message: "User deleted" });
});

app.get("/api/students", async (req, res) => {
  const result = await pool.query("SELECT * FROM students ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/students", async (req, res) => {
  const { name, admissionNo, class: className, gender, photo } = req.body;
  const result = await pool.query(
    "INSERT INTO students (name, admission_no, class, gender, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, admissionNo, className, gender, photo || null]
  );
  res.json(result.rows[0]);
});

app.get("/api/scores", async (req, res) => {
  const result = await pool.query("SELECT * FROM scores");
  res.json(result.rows);
});

app.post("/api/scores", async (req, res) => {
  const scores = req.body;
  for (const s of scores) {
    await pool.query(
      "INSERT INTO scores (student_id, class, term, subject, cat1, cat2, project, exam) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [s.studentId || s.id, s.class, s.term, s.subject, s.cat1 || 0, s.cat2 || 0, s.project || 0, s.exam || 0]
    );
  }
  res.json({ message: "Scores saved" });
});

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