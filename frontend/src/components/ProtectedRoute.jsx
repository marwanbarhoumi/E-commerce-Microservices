import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/products" />;
  }

  return children;
}