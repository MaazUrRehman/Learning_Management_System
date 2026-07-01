import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import SuperAdminLayout from "./pages/SuperAdminLayout.jsx";
import SuperAdminDashboard from "./pages/SuperAdminDashboard.jsx";
import SuperAdminUsers from "./pages/SuperAdminUsers.jsx";
import SuperAdminNotifications from "./pages/SuperAdminNotifications.jsx";
import SuperAdminAnnouncements from "./pages/SuperAdminAnnouncements.jsx";
import SuperAdminChat from "./pages/SuperAdminChat.jsx";
import SuperAdminAuditLogs from "./pages/SuperAdminAuditLogs.jsx";
import SuperAdminProfile from "./pages/SuperAdminProfile.jsx";
import SuperAdminSettings from "./pages/SuperAdminSettings.jsx";
import SuperAdminSessions from "./pages/SuperAdminSessions.jsx";
import SuperAdminClasses from "./pages/SuperAdminClasses.jsx";
import SuperAdminSections from "./pages/SuperAdminSections.jsx";
import SuperAdminSubjects from "./pages/SuperAdminSubjects.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Profile Pages
import AdminProfiles from "./pages/profiles/AdminProfiles.jsx";
import AccountantProfiles from "./pages/profiles/AccountantProfiles.jsx";
import FacultyProfiles from "./pages/profiles/FacultyProfiles.jsx";
import ParentProfiles from "./pages/profiles/ParentProfiles.jsx";
import StudentProfiles from "./pages/profiles/StudentProfiles.jsx";

// Dashboards (UI placeholders)
import AdminDashboard from "./pages/dashboards/AdminDashboard.jsx";
import AccountantDashboard from "./pages/dashboards/AccountantDashboard.jsx";
import FacultyDashboard from "./pages/dashboards/FacultyDashboard.jsx";
import ParentDashboard from "./pages/dashboards/ParentDashboard.jsx";
import StudentDashboard from "./pages/dashboards/StudentDashboard.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Role Dashboards */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/accountant" element={<ProtectedRoute requiredRole="ACCOUNTANT"><AccountantDashboard /></ProtectedRoute>} />
        <Route path="/faculty" element={<ProtectedRoute requiredRole="FACULTY"><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/parent" element={<ProtectedRoute requiredRole="PARENT"><ParentDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute requiredRole="STUDENT"><StudentDashboard /></ProtectedRoute>} />

        {/* Super Admin Routes */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          
          <Route path="users" element={<SuperAdminUsers />} />
          <Route path="users/admin" element={<AdminProfiles />} />
          <Route path="users/accountant" element={<AccountantProfiles />} />
          <Route path="users/faculty" element={<FacultyProfiles />} />
          <Route path="users/parent" element={<ParentProfiles />} />
          <Route path="users/student" element={<StudentProfiles />} />
          
          <Route path="sessions" element={<SuperAdminSessions />} />
          <Route path="classes" element={<SuperAdminClasses />} />
          <Route path="sections" element={<SuperAdminSections />} />
          <Route path="subjects" element={<SuperAdminSubjects />} />
          <Route path="notifications" element={<SuperAdminNotifications />} />
          <Route path="announcements" element={<SuperAdminAnnouncements />} />
          <Route path="chat" element={<SuperAdminChat />} />
          <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
          <Route path="profile" element={<SuperAdminProfile />} />
          <Route path="settings" element={<SuperAdminSettings />} />
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
