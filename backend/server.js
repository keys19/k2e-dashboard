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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());

app.use(express.json());

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
app.use('/', clerkRoutes);
app.get('/', (req, res) => {
  res.send('✅ Key2Enable backend is up and running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
