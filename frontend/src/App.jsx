// Description: Main application routing and role-based access control for a school management system.
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, useUser } from '@clerk/clerk-react';

import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Attendance from './pages/Attendance';
import Assessments from './pages/Assessments';
import LessonPlans from './pages/LessonPlans';
import Reports from './pages/Reports';
import StudentReport from './pages/StudentReport';
import Lessons from './pages/Lessons';
import StudentGroups from './pages/StudentGroups';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AutoGrader from './pages/AutoGrader';

function RoleRedirect() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <div>⚠️ Role not assigned. Please contact admin.</div>;
}

function App() {
  return (
    <Routes>
      {/* Sign-in route */}
      {/* <Route
        path="/dashboard"
        element={
          <div className="min-h-screen flex items-center justify-center bg-[#F3F9FD]">
            <SignedOut>
              <SignIn
                routing="path"
                path="/dashboard"
                redirectUrl="/dashboard"
                appearance={{
                  variables: {
                    colorPrimary: "#2E87D4",
                    colorText: "#1F2937",
                    colorBackground: "#FFFFFF",
                  },
                  elements: {
                    formButtonPrimary: "bg-[#2E87D4] hover:bg-[#1c6cb7]",
                  },
                }}
              />
            </SignedOut>

            <SignedIn>
              <RoleRedirect />
            </SignedIn>
          </div>
        }
      /> */}

      {/* ✅ Protected student routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/lessons"
        element={
          <ProtectedRoute allowedRole="student">
            <Lessons />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/report"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentReport />
          </ProtectedRoute>
        }
      />

      {/* ✅ Protected teacher routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute allowedRole="teacher">
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assessments"
        element={
          <ProtectedRoute allowedRole="teacher">
            <Assessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/lesson-plans"
        element={
          <ProtectedRoute allowedRole="teacher">
            <LessonPlans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/reports"
        element={
          <ProtectedRoute allowedRole="teacher">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <ProtectedRoute allowedRole="teacher">
            <StudentGroups />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/auto-grade"
        element={
          <ProtectedRoute allowedRole="teacher">
            <AutoGrader />
          </ProtectedRoute>
        }
      />

      {/* Landing or fallback */}
      <Route path="/" element={<LandingPage />} />
      <Route
  path="/dashboard/*"
  element={
    <div className="min-h-screen flex items-center justify-center bg-[#F3F9FD]">
      <SignedOut>
        <SignIn
          routing="path"
          path="/dashboard"
          redirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#2E87D4",
              colorText: "#1F2937",
              colorBackground: "#FFFFFF",
            },
            elements: {
              formButtonPrimary: "bg-[#2E87D4] hover:bg-[#1c6cb7]",
            },
          }}
        />
      </SignedOut>
      <SignedIn>
        <RoleRedirect />
      </SignedIn>
    </div>
  }
/>


    </Routes>
  );
}

export default App;
