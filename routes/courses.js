import express from "express";
import {
  getCourses,
  getCourseById,
  getCourseByName,
  getCourseDetails,
  getTrendingCourses,
  getPopularCourses,
  getCoursesWithProgressByUser,
  getCoursesByCategoryId,
  getSubjectDetails,
  getTrendingCoursesById,
  getPopularCoursesById,
} from "../database.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const courses = await getCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const { name } = req.query;
    const courses = await getCourseByName(name);
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

router.get("/trending", async (req, res, next) => {
  try {
    const trending = await getTrendingCourses();
    res.json(trending);
  } catch (err) {
    next(err);
  }
});
router.get("/trending/:id", async (req, res, next) => {
  try {
    const trending = await getTrendingCoursesById(req.params.id);
    res.json(trending);
  } catch (err) {
    next(err);
  }
});

router.get("/popular/:id", async (req, res, next) => {
  try {
    const popular = await getPopularCoursesById(req.params.id);
    res.json(popular);
  } catch (err) {
    next(err);
  }
});
router.get("/popular", async (req, res, next) => {
  try {
    const popular = await getPopularCourses();
    res.json(popular);
  } catch (err) {
    next(err);
  }
});
``;

router.get("/details/:id", async (req, res, next) => {
  try {
    const course = await getCourseDetails(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
});

router.get("/progress/:userId", async (req, res, next) => {
  try {
    const progress = await getCoursesWithProgressByUser(req.params.userId);
    res.json(progress);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: "Not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
});

router.get("/category/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const courses = await getCoursesByCategoryId(categoryId);
    res.json(courses);
  } catch (err) {
    next(err);
  }
});
router.get("/subject/:subjectId", async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const result = await getSubjectDetails(subjectId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
