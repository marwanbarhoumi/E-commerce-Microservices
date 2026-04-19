import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar         from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import ProductsPage   from './pages/ProductsPage';
import OrdersPage     from './pages/OrdersPage';
import DashboardPage  from './pages/DashboardPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/products" element={
          <ProtectedRoute><ProductsPage /></ProtectedRoute>
        }/>
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        }/>

        {/* Admin only */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <DashboardPage />
          </ProtectedRoute>
        }/>

        <Route path="/" element={<Navigate to="/products" />} />
      </Routes>
    </>
  );
}