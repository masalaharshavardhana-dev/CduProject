import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  // Trap and prevent browser Back navigation while authenticated
  useEffect(() => {
    if (token) {
      // Push state into history so backward navigation is trapped
      window.history.pushState(null, '', window.location.href);

      const handlePopState = (e) => {
        // Prevent navigating back to initial/login page; keep user on current dashboard
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [token, location.pathname]);

  if (!token) {
    return <Navigate to="/login/student" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
