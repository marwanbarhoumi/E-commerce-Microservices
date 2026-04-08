// ============================================================
//  AUTH SERVICE — routes/auth.routes.js
//  هذا الملف يحدد الـ URLs وأي دالة تشتغل مع كل URL
// ============================================================

const express = require('express');
const router  = express.Router(); // ننشئوا Router صغير

// نستورد الدوال من الـ Controller
const {
  register,
  login,
  verify,
} = require('../controllers/auth.controller');

// ── تعريف الـ Routes ─────────────────────────────────────────

// POST /api/auth/register → تسجيل مستخدم جديد
// Body: { name, email, password }
router.post('/register', register);

// POST /api/auth/login → تسجيل الدخول
// Body: { email, password }
router.post('/login', login);

// GET /api/auth/verify → التحقق من الـ Token
// Header: Authorization: Bearer <token>
// تستخدمها بقية الـ services
router.get('/verify', verify);

module.exports = router;

// ============================================================
//  ملخص الـ API:
//
//  POST   /api/auth/register  → إنشاء حساب جديد
//  POST   /api/auth/login     → تسجيل الدخول
//  GET    /api/auth/verify    → التحقق من الـ Token
// ============================================================