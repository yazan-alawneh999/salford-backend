import express from "express";
import cors from "cors";
import coursesRouter from "./routes/courses.js";
import plansRouter from "./routes/plans.js";
import categoriesRouter from "./routes/categories.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving
app.use("/images", express.static("public/images"));

// Routes
app.use("/courses", coursesRouter);
app.use("/plans", plansRouter);
app.use("/categories", categoriesRouter);

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
