import express from "express";
import cors from "cors";
import coursesRouter from "./routes/courses.js";
import plansRouter from "./routes/plans.js";
import categoriesRouter from "./routes/categories.js";
import subscriptionRouter from "./routes/subscriptions.js";
import authRoutes from "./routes/auth.js";
import profilesRouter from "./routes/profiles.js";
import { verifyToken } from "./middleware/auth.midleware.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Use Auth Routes

// Static file serving
app.use("/images", express.static("public/images"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", verifyToken, profilesRouter);
app.use("/courses", coursesRouter);
app.use("/plans", verifyToken, plansRouter);
app.use("/categories", verifyToken, categoriesRouter);
app.use("/subscriptions", verifyToken, subscriptionRouter);

// Health check
app.get("/", (req, res) => {
  res.send("API is running");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
