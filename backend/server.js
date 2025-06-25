import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';

/* existing route imports */
import studentRoutes         from './routes/students.js';
import attendanceRoutes      from './routes/attendance.js';
import assessmentRoutes      from './routes/assessments.js';
import statsRoutes           from './routes/stats.js';
import lessonRoutes          from './routes/lessonPlans.js';
import reportRoutes          from './routes/generateReports.js';
import groupRoutes           from './routes/groups.js';
import studentDashboardRoute from './routes/studentDashboard.js';
import teachersRoutes        from './routes/teachers.js';
import clerkRoutes           from './routes/clerk.js';
import autoGradeRoutes       from './routes/autoGrade.js';

/* NEW – quizzes router */
import quizzesRouter         from './routes/quizzes.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ───────────────── middleware ───────────────── */
app.use(cors());

/* Accept JSON or urlencoded bodies up to 10 MB (supports images as base-64) */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/* simple request logger */
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

/* ───────────────── routes ───────────────────── */
app.use('/students',          studentRoutes);
app.use('/attendance',        attendanceRoutes);
app.use('/assessments',       assessmentRoutes);
app.use('/stats',             statsRoutes);
app.use('/lesson-plans',      lessonRoutes);
app.use('/reports',           reportRoutes);
app.use('/ai-reports',        reportRoutes);
app.use('/groups',            groupRoutes);
app.use('/student-dashboard', studentDashboardRoute);
app.use('/teachers',          teachersRoutes);
app.use('/auto-grade',        autoGradeRoutes);

/* quizzes */
app.use('/quizzes',           quizzesRouter);

app.use('/', clerkRoutes);

app.get('/', (_req, res) => {
  res.send('✅ Key2Enable backend is up and running!');
});

/* ───────────────── start ────────────────────── */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
