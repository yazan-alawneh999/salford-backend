import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Sign up route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check for existing user
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashed]
    );

    const userId = result.insertId;

    // Auto-create profile (optional)
    await pool.query(
      "INSERT INTO profiles (user_id, display_name,image_url) VALUES (?, ?,?)",
      [userId, email.split("@")[0], "profile.jpg"]
    );

    const token = jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
});

// Sign in route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Signin failed", details: err.message });
  }
});

export default router;
