// ============================================================
//  ProtectedRoute — يحمي الصفحات من غير المسجّلين
//  لو ما فيه token → يحوّل للـ Login
// ============================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
}