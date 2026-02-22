
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
// Student Pages
import { CoursesPage } from './pages/student/CoursesPage';
import { CourseDetailsPage } from './pages/student/CourseDetailsPage';
import { AssignmentsPage } from './pages/student/AssignmentsPage';
import { ProgressPage } from './pages/student/ProgressPage';
// Faculty Pages
import { CourseManagementPage } from './pages/faculty/CourseManagementPage';
import { StudyMaterialsPage } from './pages/faculty/StudyMaterialsPage';
import { AssignmentManagementPage } from './pages/faculty/AssignmentManagementPage';
import { EvaluationPage } from './pages/faculty/EvaluationPage';
// Admin Pages
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AdminCourseManagementPage } from './pages/admin/CourseManagementPage';
import { ProgressMonitoringPage } from './pages/admin/ProgressMonitoringPage';
import { AnnouncementsPage } from './pages/admin/AnnouncementsPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="course/:id" element={<CourseDetailsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="progress" element={<ProgressPage />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="courses" element={<CourseManagementPage />} />
            <Route path="materials" element={<StudyMaterialsPage />} />
            <Route path="assignments" element={<AssignmentManagementPage />} />
            <Route path="evaluation" element={<EvaluationPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="courses" element={<AdminCourseManagementPage />} />
            <Route path="progress" element={<ProgressMonitoringPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}