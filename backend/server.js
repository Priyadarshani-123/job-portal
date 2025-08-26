const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database"); // our SQLite connection

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("Job Portal Backend is running 🚀");
});


// ==========================
// 🔹 USER ROUTES
// ==========================

// Register
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, password],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "User already exists" });
      }
      res.json({ message: "User registered" });
    }
  );
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (!row) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      res.json({ user: row });
    }
  );
});


// ==========================
// 🔹 JOB ROUTES
// ==========================

// Get all jobs (seed database if empty)
app.get("/jobs", (req, res) => {
  db.all("SELECT * FROM jobs", [], (err, rows) => {
    if (rows.length === 0) {
      // Insert default jobs
      db.run("INSERT INTO jobs (title, company, skills, type) VALUES ('Frontend Developer', 'TechCorp', 'HTML, CSS, JS', 'Internship')");
      db.run("INSERT INTO jobs (title, company, skills, type) VALUES ('Backend Developer', 'CodeBase', 'Node.js, Express', 'Full-time')");
      db.run("INSERT INTO jobs (title, company, skills, type) VALUES ('Data Analyst', 'DataWorks', 'Python, SQL', 'Internship')");

      return res.json([
        { id: 1, title: "Frontend Developer", company: "TechCorp", skills: "HTML, CSS, JS", type: "Internship" },
        { id: 2, title: "Backend Developer", company: "CodeBase", skills: "Node.js, Express", type: "Full-time" },
        { id: 3, title: "Data Analyst", company: "DataWorks", skills: "Python, SQL", type: "Internship" }
      ]);
    }
    res.json(rows);
  });
});


// ==========================
// 🔹 APPLICATION ROUTES
// ==========================

// Apply for a job
app.post("/apply", (req, res) => {
  const { username, jobId } = req.body;

  db.run(
    "INSERT INTO applications (username, jobId) VALUES (?, ?)",
    [username, jobId],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Could not apply" });
      }
      res.json({ message: "Application submitted" });
    }
  );
});

// Get applications for a user
app.get("/applications/:username", (req, res) => {
  db.all(
    `SELECT applications.id, jobs.title, jobs.company, jobs.skills, jobs.type 
     FROM applications 
     JOIN jobs ON applications.jobId = jobs.id 
     WHERE applications.username = ?`,
    [req.params.username],
    (err, rows) => {
      res.json(rows);
    }
  );
});

// Withdraw (delete) application
app.delete("/applications/:id", (req, res) => {
  db.run("DELETE FROM applications WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(400).json({ error: "Error withdrawing" });
    }
    res.json({ message: "Application withdrawn" });
  });
});


// ==========================
// 🔹 START SERVER
// ==========================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
