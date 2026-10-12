import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function PublicOnlyRoute() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (token) {
    if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
