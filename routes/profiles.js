import express from "express";
import { pool } from "../database.js";

const router = express.Router();

// Get profile by user ID
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to retrieve profile", details: err.message });
  }
});

export default router;
