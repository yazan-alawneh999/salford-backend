// import mysql from "mysql2";
// import dotenv from "dotenv";
// dotenv.config();

// // const pool = mysql
// //   .createPool({
// //     host: "127.0.0.1",
// //     user: "salford",
// //     password: "salford",
// //     database: "salford-db",
// //   })
// //   .promise();
// export const pool = mysql
//   .createPool({
//     host: process.env.HOST,
//     user: process.env.USER,
//     password: process.env.PASSWORD,
//     database: process.env.DB,
//   })
//   .promise();

// /* --------------------------- Courses (basic) --------------------------- */

// export async function getCourses() {
//   const [rows] = await pool.query(`SELECT * FROM courses`);
//   return rows;
// }

// export async function getCourseById(id) {
//   const [rows] = await pool.query(`SELECT * FROM courses WHERE id = ?`, [id]);
//   return rows[0] ?? null;
// }

// export async function getCourseByName(name) {
//   const [rows] = await pool.query(
//     `SELECT * FROM courses WHERE title_name LIKE ?`,
//     [`%${name}%`]
//   );
//   return rows;
// }

// /* -------------------- Popularity filtered course lists -------------------- */

// export async function getTrendingCourses() {
//   const [rows] = await pool.query(
//     `SELECT *
//      FROM courses
//      WHERE popularity_type = 'trending'
//      ORDER BY id DESC`
//   );
//   return rows;
// }

// export async function getPopularCourses() {
//   const [rows] = await pool.query(
//     `SELECT *
//      FROM courses
//      WHERE popularity_type = 'popular'
//      ORDER BY id DESC`
//   );
//   return rows;
// }

// /* ------------------------------- Plans -------------------------------- */

// export async function getPlans() {
//   const [rows] = await pool.query(`SELECT * FROM plans ORDER BY price ASC`);
//   return rows;
// }

// /* --------------------- Categories (simple helpers) --------------------- */

// export async function getCategories() {
//   const [rows] = await pool.query(`SELECT * FROM categories `);
//   return rows;
// }

// /* --------------- Course details (with subjects & lessons) --------------- */
// /**
//  * Returns:
//  * {
//  *   course: {...},
//  *   subjects: [
//  *     {
//  *       ...subject,
//  *       lessons: [...]
//  *     }
//  *   ]
//  * }
//  */
// export async function getCourseDetails(courseId) {
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     const [courseRows] = await conn.query(
//       `SELECT * FROM courses WHERE id = ?`,
//       [courseId]
//     );
//     if (courseRows.length === 0) {
//       await conn.release();
//       return null;
//     }
//     const course = courseRows[0];

//     const [subjectRows] = await conn.query(
//       `SELECT * FROM subjects WHERE course_id = ? ORDER BY id`,
//       [courseId]
//     );
//     const numSubjects = subjectRows.length;

//     const subjectsWithLessons = await Promise.all(
//       subjectRows.map(async (subject) => {
//         const [lessons] = await conn.query(
//           `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id LIMIT 3`,
//           [subject.id]
//         );
//         return { ...subject, lessons };
//       })
//     );

//     const [lessonCountResult] = await conn.query(
//       `SELECT COUNT(*) AS totalLessons FROM lessons WHERE subject_id IN (
//         SELECT id FROM subjects WHERE course_id = ?
//       )`,
//       [courseId]
//     );

//     const totalLessons =
//       lessonCountResult.length > 0 ? lessonCountResult[0].totalLessons : 0;

//     await conn.commit();
//     await conn.release();

//     const result = {
//       course,
//       numSubjects,
//       totalLessons,
//       subjects: subjectsWithLessons,
//     };

//     console.log("Final course details result:", result); // ← Debug here

//     return result;
//   } catch (err) {
//     await conn.rollback();
//     await conn.release();
//     throw err;
//   }
// }

// // export async function getCourseDetails(courseId) {
// //   const conn = await pool.getConnection();
// //   try {
// //     await conn.beginTransaction();

// //     // 1. Get course
// //     const [courseRows] = await conn.query(
// //       `SELECT * FROM courses WHERE id = ?`,
// //       [courseId]
// //     );

// //     if (courseRows.length === 0) {
// //       await conn.release();
// //       return null;
// //     }

// //     const course = courseRows[0];

// //     // 2. Get subjects
// //     const [subjectRows] = await conn.query(
// //       `SELECT * FROM subjects WHERE course_id = ? ORDER BY id`,
// //       [courseId]
// //     );

// //     const numSubjects = subjectRows.length;

// //     // 3. Get 3 lessons per subject
// //     const subjectsWithLessons = await Promise.all(
// //       subjectRows.map(async (subject) => {
// //         const [lessons] = await conn.query(
// //           `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id LIMIT 3`,
// //           [subject.id]
// //         );
// //         return {
// //           ...subject,
// //           lessons,
// //         };
// //       })
// //     );

// //     // 4. Count total lessons for the course
// //     const [lessonCountResult] = await conn.query(
// //       `
// //   SELECT COUNT(*) AS totalLessons
// //   FROM lessons
// //   WHERE subject_id IN (
// //     SELECT id FROM subjects WHERE course_id = ?
// //   )`,
// //       [courseId]
// //     );

// //     const totalLessons =
// //       lessonCountResult.length > 0 ? lessonCountResult[0].totalLessons : 0;

// //     await conn.commit();
// //     await conn.release();

// //     return {
// //       course,
// //       numSubjects,
// //       totalLessons,
// //       subjects: subjectsWithLessons,
// //     };
// //   } catch (err) {
// //     await conn.rollback();
// //     await conn.release();
// //     throw err;
// //   }
// // }

// // export async function getCourseDetails(courseId) {
// //   const conn = await pool.getConnection();
// //   try {
// //     await conn.beginTransaction();

// //     // Get course details
// //     const [[course]] = await conn.query(`SELECT * FROM courses WHERE id = ?`, [
// //       courseId,
// //     ]);

// //     if (!course) {
// //       await conn.release();
// //       return null;
// //     }

// //     // Get all subjects for the course
// //     const [subjects] = await conn.query(
// //       `SELECT * FROM subjects
// //        WHERE course_id = ?
// //        ORDER BY id`,
// //       [courseId]
// //     );

// //     // Get exactly 3 lessons for each subject
// //     const subjectsWithLessons = await Promise.all(
// //       subjects.map(async (subject) => {
// //         const [lessons] = await conn.query(
// //           `SELECT * FROM lessons
// //            WHERE subject_id = ?
// //            ORDER BY id
// //            LIMIT 3`,
// //           [subject.id]
// //         );
// //         return {
// //           ...subject,
// //           lessons,
// //         };
// //       })
// //     );

// //     await conn.commit();
// //     await conn.release();

// //     return {
// //       course,
// //       subjects: subjectsWithLessons,
// //     };
// //   } catch (err) {
// //     await conn.rollback();
// //     await conn.release();
// //     throw err;
// //   }
// // }
// // export async function getCourseDetails(courseId) {
// //   const conn = await pool.getConnection();
// //   try {
// //     await conn.beginTransaction();

// //     const [[course]] = await conn.query(`SELECT * FROM courses WHERE id = ?`, [
// //       courseId,
// //     ]);
// //     if (!course) {
// //       await conn.release();
// //       return null;
// //     }

// //     const [subjects] = await conn.query(
// //       `SELECT * FROM subjects WHERE course_id = ? ORDER BY id`,
// //       [courseId]
// //     );

// //     // Fetch lessons for all subjects in one go
// //     let lessonsBySubject = {};
// //     if (subjects.length > 0) {
// //       const subjectIds = subjects.map((s) => s.id);
// //       const [lessons] = await conn.query(
// //         `SELECT *
// //          FROM lessons
// //          WHERE subject_id IN ( ${subjectIds.map(() => "?").join(", ")} )
// //          ORDER BY id`,
// //         subjectIds
// //       );

// //       // group lessons by subject_id
// //       lessonsBySubject = lessons.reduce((acc, l) => {
// //         acc[l.subject_id] ??= [];
// //         acc[l.subject_id].push(l);
// //         return acc;
// //       }, {});
// //     }

// //     const subjectsWithLessons = subjects.map((s) => ({
// //       ...s,
// //       lessons: lessonsBySubject[s.id] ?? [],
// //     }));

// //     await conn.commit();
// //     await conn.release();

// //     return {
// //       course,
// //       subjects: subjectsWithLessons,
// //     };
// //   } catch (err) {
// //     await pool.query("ROLLBACK");
// //     throw err;
// //   }
// // }

// /* --------------------- Subject details (with lessons) --------------------- */
// /**
//  * Returns:
//  * {
//  *   subject: {...},
//  *   lessons: [...]
//  * }
//  */
// export async function getSubjectDetails(subjectId) {
//   const [[subject]] = await pool.query(`SELECT * FROM subjects WHERE id = ?`, [
//     subjectId,
//   ]);
//   if (!subject) return null;

//   const [lessons] = await pool.query(
//     `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id`,
//     [subjectId]
//   );

//   return {
//     subject,
//     lessons,
//   };
// }

// /* ------------- All courses with aggregated progress by user ------------- */
// /**
//  * Returns one row per course with progress averaged across that user's subjects.
//  * progress_percent will be 0 when user has no progress on that course.
//  */
// export async function getCoursesWithProgressByUser(userId) {
//   const [rows] = await pool.query(
//     `
//     SELECT
//       c.id,
//       c.category_id,
//       c.title_name,
//       c.lecturer_name,
//       c.price,
//       c.image_url,
//       c.video_url,
//       c.total_chapters,
//       c.popularity_type,
//       COALESCE(AVG(usp.progress_percent), 0) AS progress_percent
//     FROM courses c
//     LEFT JOIN subjects s
//       ON s.course_id = c.id
//     LEFT JOIN user_subject_progress usp
//       ON usp.subject_id = s.id
//       AND usp.user_id = ?
//     GROUP BY
//       c.id, c.category_id, c.title_name, c.lecturer_name, c.price,
//       c.image_url, c.video_url, c.total_chapters, c.popularity_type
//     ORDER BY c.id
//     `,
//     [userId]
//   );
//   return rows;
// }

// /* --------------- Course details (with subjects & lessons) --------------- */
// /**
//  * Returns:
//  * {
//  *   course: {...},
//  *   subjects: [
//  *     {
//  *       ...subject,
//  *       lessons: [...]
//  *     }
//  *   ]
//  * }
//  */
// export async function getCourseInfo(courseId) {
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     const [[course]] = await conn.query(`SELECT * FROM courses WHERE id = ?`, [
//       courseId,
//     ]);
//     if (!course) {
//       await conn.release();
//       return null;
//     }

//     const [subjects] = await conn.query(
//       `SELECT * FROM subjects WHERE course_id = ? ORDER BY id`,
//       [courseId]
//     );

//     await conn.commit();
//     await conn.release();

//     return {
//       course,
//       subjects: subjects,
//     };
//   } catch (err) {
//     await pool.query("ROLLBACK");
//     throw err;
//   }
// }
// export async function getCoursesByCategoryId(categoryId) {
//   const [rows] = await pool.query(
//     `SELECT * FROM courses WHERE category_id = ? ORDER BY id DESC`,
//     [categoryId]
//   );
//   return rows;
// }

// /* --------------------------- Courses (basic) --------------------------- */

// export async function getCourses() {
//   const [rows] = await pool.query(`SELECT * FROM courses`);
//   return rows;
// }

// export async function getCourseById(id) {
//   const [rows] = await pool.query(`SELECT * FROM courses WHERE id = ?`, [id]);
//   return rows[0] ?? null;
// }

// export async function getCourseByName(name) {
//   const [rows] = await pool.query(
//     `SELECT * FROM courses WHERE title_name LIKE ?`,
//     [`%${name}%`]
//   );
//   return rows;
// }

// /* --------------------------- User Subscriptions --------------------------- */

// export async function addSubscription(userId, planId) {
//   const startDate = new Date();
//   const endDate = new Date();
//   endDate.setDate(endDate.getDate() + 30);

//   const [result] = await pool.query(
//     `INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date) VALUES (?, ?, ?, ?)`,
//     [userId, planId, startDate, endDate]
//   );
//   return {
//     id: result.insertId,
//     userId,
//     planId,
//     startDate,
//     endDate,
//     isActive: true,
//   };
// }

// export async function getSubscriptions() {
//   const [rows] = await pool.query(
//     `SELECT
//       us.id,
//       p.display_name,
//       p.image_url
//     FROM user_subscriptions us
//     JOIN users u ON us.user_id = u.id
//     JOIN profiles p ON us.user_id = p.user_id
//     `
//   );
//   return rows;
// }

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

export async function getPopularCourses() {
  const [rows] = await pool.query(
    `SELECT * FROM courses WHERE popularity_type = 'popular' ORDER BY id DESC`
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
          `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id LIMIT 3`,
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

export async function getSubjectDetails(subjectId) {
  const [[subject]] = await pool.query(`SELECT * FROM subjects WHERE id = ?`, [
    subjectId,
  ]);
  if (!subject) return null;

  const [lessons] = await pool.query(
    `SELECT * FROM lessons WHERE subject_id = ? ORDER BY id`,
    [subjectId]
  );

  return { subject, lessons };
}

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
