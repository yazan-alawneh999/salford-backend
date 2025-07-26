import express from "express";
import { getPlans } from "../database.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const plans = await getPlans();
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

export default router;
