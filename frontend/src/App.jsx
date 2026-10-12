import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import RecruiterLogin from './pages/RecruiterLogin';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public only routes - redirect to respective dashboard if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/recruiter" element={<RecruiterLogin />} />
        </Route>

        {/* Protected Dashboard routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
