import mysql from "mysql2";

const pool = mysql
  .createPool({
    host: "127.0.0.1",
    user: "salford",
    password: "salford",
    database: "salford-db",
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

/* -------------------- Popularity filtered course lists -------------------- */

export async function getTrendingCourses() {
  const [rows] = await pool.query(
    `SELECT * 
     FROM courses
     WHERE popularity_type = 'trending'
     ORDER BY id DESC`
  );
  return rows;
}

export async function getPopularCourses() {
  const [rows] = await pool.query(
    `SELECT * 
     FROM courses
     WHERE popularity_type = 'popular'
     ORDER BY id DESC`
  );
  return rows;
}

/* ------------------------------- Plans -------------------------------- */

export async function getPlans() {
  const [rows] = await pool.query(`SELECT * FROM plans ORDER BY price ASC`);
  return rows;
}

/* --------------------- Categories (simple helpers) --------------------- */

export async function getCategories() {
  const [rows] = await pool.query(`SELECT * FROM categories ORDER BY name ASC`);
  return rows;
}

/* --------------- Course details (with subjects & lessons) --------------- */
/**
 * Returns:
 * {
 *   course: {...},
 *   subjects: [
 *     {
 *       ...subject,
 *       lessons: [...]
 *     }
 *   ]
 * }
 */
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

    const [subjects] = await conn.query(
      `SELECT * FROM subjects WHERE course_id = ? ORDER BY id`,
      [courseId]
    );

    // Fetch lessons for all subjects in one go
    let lessonsBySubject = {};
    if (subjects.length > 0) {
      const subjectIds = subjects.map((s) => s.id);
      const [lessons] = await conn.query(
        `SELECT * 
         FROM lessons 
         WHERE subject_id IN ( ${subjectIds.map(() => "?").join(", ")} )
         ORDER BY id`,
        subjectIds
      );

      // group lessons by subject_id
      lessonsBySubject = lessons.reduce((acc, l) => {
        acc[l.subject_id] ??= [];
        acc[l.subject_id].push(l);
        return acc;
      }, {});
    }

    const subjectsWithLessons = subjects.map((s) => ({
      ...s,
      lessons: lessonsBySubject[s.id] ?? [],
    }));

    await conn.commit();
    await conn.release();

    return {
      course,
      subjects: subjectsWithLessons,
    };
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }
}

/* --------------------- Subject details (with lessons) --------------------- */
/**
 * Returns:
 * {
 *   subject: {...},
 *   lessons: [...]
 * }
 */
export async function getSubjectDetails(subjectId) {
  const [[subject]] = await pool.query(`SELECT * FROM subjects WHERE id = ?`, [
    subjectId,
  ]);
  if (!subject) return null;

  const [lessons] = await pool.query(
    `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id`,
    [subjectId]
  );

  return {
    subject,
    lessons,
  };
}

/* ------------- All courses with aggregated progress by user ------------- */
/**
 * Returns one row per course with progress averaged across that user's subjects.
 * progress_percent will be 0 when user has no progress on that course.
 */
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
    LEFT JOIN subjects s
      ON s.course_id = c.id
    LEFT JOIN user_subject_progress usp
      ON usp.subject_id = s.id
      AND usp.user_id = ?
    GROUP BY
      c.id, c.category_id, c.title_name, c.lecturer_name, c.price,
      c.image_url, c.video_url, c.total_chapters, c.popularity_type
    ORDER BY c.id
    `,
    [userId]
  );
  return rows;
}
