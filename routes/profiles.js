// import express from "express";
// import { pool } from "../database.js";

// const router = express.Router();

// // Get profile by user ID
// router.get("/:userId", async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const [rows] = await pool.query(
//       "SELECT * FROM profiles WHERE user_id = ?",
//       [userId]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Profile not found" });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Failed to retrieve profile", details: err.message });
//   }
// });

// export default router;
import express from "express";
import { pool } from "../database.js";

const router = express.Router();

// Get profile and email by user ID
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        profiles.id AS profile_id,
        profiles.user_id,
        profiles.display_name,
        profiles.image_url,
        users.email
      FROM profiles
      INNER JOIN users ON profiles.user_id = users.id
      WHERE profiles.user_id = ?
      `,
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
