import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
  })
  .promise();

/* --------------------------- Courses (basic) --------------------------- */

export async function getCourses() {
  const [rows] = await pool.query(`SELECT * FROM courses`);
  return rows;
}

export async function getCourseById(id) {
  const [rows] = await pool.query(`SELECT * FROM courses WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export async function getCourseByName(name) {
  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE title_name LIKE ?`,
    [`%${name}%`]
  );
  return rows;
}

export async function getCoursesByCategoryId(categoryId) {
  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE category_id = ? ORDER BY id DESC`,
    [categoryId]
  );
  return rows;
}

/* -------------------- Popularity filtered course lists -------------------- */

export async function getTrendingCourses() {
  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE popularity_type = 'trending' ORDER BY id DESC`
  );
  return rows;
}
export async function getTrendingCoursesById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE popularity_type = 'trending'  AND category_id = ? ORDER BY id DESC`,
    [id]
  );
  return rows;
}

export async function getPopularCourses() {
  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE popularity_type = 'popular' ORDER BY id DESC`
  );
  return rows;
}

export async function getPopularCoursesById(id) {
  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE popularity_type = 'popular'  AND category_id = ?  ORDER BY id DESC`,
    [id]
  );
  return rows;
}

/* ------------------------------- Plans -------------------------------- */

export async function getPlans() {
  const [rows] = await pool.query(`SELECT * FROM plans ORDER BY price ASC`);
  return rows;
}

/* --------------------- Categories --------------------- */

export async function getCategories() {
  const [rows] = await pool.query(`SELECT * FROM categories`);
  return rows;
}

/* --------------- Course details (subjects & lessons) --------------- */

export async function getCourseDetails(courseId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[course]] = await conn.query(`SELECT * FROM courses WHERE id = ?`, [
      courseId,
    ]);
    if (!course) {
      await conn.release();
      return null;
    }

    const [subjectRows] = await conn.query(
      `SELECT * FROM subjects WHERE course_id = ? ORDER BY id`,
      [courseId]
    );

    const subjectsWithLessons = await Promise.all(
      subjectRows.map(async (subject) => {
        const [lessons] = await conn.query(
          `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id `,
          [subject.id]
        );
        return { ...subject, lessons };
      })
    );

    const [lessonCountResult] = await conn.query(
      `SELECT COUNT(*) AS totalLessons FROM lessons WHERE subject_id IN (
        SELECT id FROM subjects WHERE course_id = ?
      )`,
      [courseId]
    );

    await conn.commit();
    await conn.release();

    return {
      course,
      subjects: subjectsWithLessons,
      numSubjects: subjectRows.length,
      totalLessons: lessonCountResult[0]?.totalLessons || 0,
    };
  } catch (err) {
    await conn.rollback();
    await conn.release();
    throw err;
  }
}

/* --------------------- Subject details (with lessons) --------------------- */

/* ------------- Courses with user-specific progress ------------- */

export async function getCoursesWithProgressByUser(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      c.id,
      c.category_id,
      c.title_name,
      c.lecturer_name,
      c.price,
      c.image_url,
      c.video_url,
      c.total_chapters,
      c.popularity_type,
      COALESCE(AVG(usp.progress_percent), 0) AS progress_percent
    FROM courses c
    LEFT JOIN subjects s ON s.course_id = c.id
    LEFT JOIN user_subject_progress usp
      ON usp.subject_id = s.id AND usp.user_id = ?
    GROUP BY
      c.id, c.category_id, c.title_name, c.lecturer_name, c.price,
      c.image_url, c.video_url, c.total_chapters, c.popularity_type
    ORDER BY c.id
    `,
    [userId]
  );
  return rows;
}

/* --------------------------- Course summary (no lessons) --------------------------- */

export async function getCourseInfo(courseId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[course]] = await conn.query(`SELECT * FROM courses WHERE id = ?`, [
      courseId,
    ]);
    if (!course) {
      await conn.release();
      return null;
    }

    const [subjects] = await conn.query(
      `SELECT * FROM subjects WHERE course_id = ? ORDER BY id`,
      [courseId]
    );

    await conn.commit();
    await conn.release();

    return {
      course,
      subjects,
    };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

/* --------------------------- User Subscriptions --------------------------- */

export async function addSubscription(userId, planId) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const [result] = await pool.query(
    `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date)
     VALUES (?, ?, ?, ?)`,
    [userId, planId, startDate, endDate]
  );

  return {
    id: result.insertId,
    userId,
    planId,
    startDate,
    endDate,
    isActive: true,
  };
}

export async function getSubscriptions() {
  const [rows] = await pool.query(
    `SELECT
      us.id,
      p.display_name,
      p.image_url
     FROM user_subscriptions us
     JOIN users u ON us.user_id = u.id
     JOIN profiles p ON us.user_id = p.user_id`
  );
  return rows;
}

export async function getSubjectDetails(subjectId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get the subject
    const [[subject]] = await conn.query(
      `SELECT * FROM subjects WHERE id = ?`,
      [subjectId]
    );
    if (!subject) {
      await conn.release();
      return null;
    }

    // 2. Get the lessons under the subject
    const [lessons] = await conn.query(
      `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id`,
      [subjectId]
    );

    // 3. Get the course that this subject belongs to
    const [[course]] = await conn.query(`SELECT * FROM courses WHERE id = ?`, [
      subject.course_id,
    ]);

    await conn.commit();
    await conn.release();

    return {
      course,
      subject,
      lessons,
    };
  } catch (err) {
    await conn.rollback();
    await conn.release();
    throw err;
  }
}
