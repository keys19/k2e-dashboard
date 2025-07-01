import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import studentRoutes from './routes/students.js';
import attendanceRoutes from './routes/attendance.js';
import assessmentRoutes from './routes/assessments.js';
import statsRoutes from './routes/stats.js';
import lessonRoutes from './routes/lessonPlans.js';
import reportRoutes from './routes/generateReports.js';
import groupRoutes from './routes/groups.js';
import studentDashboardRoute from './routes/studentDashboard.js';
import teachersRoutes from './routes/teachers.js';
import clerkRoutes from './routes/clerk.js';
import autoGradeRoutes from './routes/autoGrade.js';
import webhookRoutes from './routes/webhooks.js';
import quizzesRouter from './routes/quizzes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ✅ Setup CORS to allow requests from localhost and Vercel frontend */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://k2e-dashboard-git-armaanmerge-keyas-projects.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

/* ✅ Handle large JSON + form data (support base64 images) */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/* ✅ Simple logger for all requests */
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

/* ✅ Route setup */
app.use('/students', studentRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/assessments', assessmentRoutes);
app.use('/stats', statsRoutes);
app.use('/lesson-plans', lessonRoutes);
app.use('/reports', reportRoutes);
app.use('/ai-reports', reportRoutes);
app.use('/groups', groupRoutes);
app.use('/student-dashboard', studentDashboardRoute);
app.use('/teachers', teachersRoutes);
app.use('/auto-grade', autoGradeRoutes);
app.use('/quizzes', quizzesRouter);
app.use('/', clerkRoutes);

app.get('/', (_req, res) => {
  res.send('✅ Key2Enable backend is up and running!');
});

/* ✅ Start server */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
