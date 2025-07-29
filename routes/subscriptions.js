import express from "express";
import { addSubscription, getSubscriptions } from "../database.js";
import { verifyToken } from "../middleware/auth.midleware.js";

const router = express.Router();

// Add a new subscription
router.post("/create", async (req, res, next) => {
  try {
    const { userId, planId } = req.body;
    const subscription = await addSubscription(userId, planId);
    res.status(201).json(subscription);
  } catch (err) {
    next(err);
  }
});

// Get all subscriptions for a user
router.get("/", async (req, res, next) => {
  try {
    const subscriptions = await getSubscriptions();
    res.json(subscriptions);
  } catch (err) {
    next(err);
  }
});

export default router;
