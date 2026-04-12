// ============================================================
//  App.jsx — الـ Router الرئيسي
// ============================================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar          from './components/Navbar';
import ProtectedRoute  from './components/ProtectedRoute';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import ProductsPage    from './pages/ProductsPage';
import OrdersPage      from './pages/OrdersPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* صفحات مفتوحة */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* صفحات محمية — تحتاج تسجيل دخول */}
        <Route path="/products" element={
          <ProtectedRoute><ProductsPage /></ProtectedRoute>
        }/>
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        }/>

        {/* الصفحة الرئيسية → المنتجات */}
        <Route path="/" element={<Navigate to="/products" />} />
      </Routes>
    </>
  );
}