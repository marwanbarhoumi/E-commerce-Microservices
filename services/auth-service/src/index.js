// ============================================================
//  AUTH SERVICE — index.js
//  هذا هو أول ملف يشتغل لما تبدأ الـ service
// ============================================================

// ── 1. استيراد المكتبات ──────────────────────────────────────

const express  = require('express');   // إطار العمل — يخلينا نبني سيرفر HTTP
const mongoose = require('mongoose');  // يخلينا نتكلم مع MongoDB
const cors     = require('cors');      // يسمح للـ frontend يبعث طلبات للسيرفر
require('dotenv').config();   
const adminRoutes = require('./routes/admin.routes');         // يقرأ المتغيرات من ملف .env

// ── 2. استيراد الـ Routes ────────────────────────────────────

// الـ routes هي الـ URLs اللي يقبلها السيرفر
// مثال: POST /api/auth/register
const authRoutes = require('./routes/auth.routes');

// ── 3. إنشاء التطبيق ─────────────────────────────────────────

const app = express(); // ننشئ تطبيق Express

// ── 4. الـ Middlewares ───────────────────────────────────────
// الـ middleware هي كود يشتغل على كل طلبية قبل ما توصل للـ route

app.use(cors());         // نسمح للـ frontend يبعث طلبات (من أي عنوان)
app.use(express.json()); 
// Prometheus metrics
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
// نقولوله إنا نقبل بيانات بصيغة JSON

// ── 5. الـ Routes ────────────────────────────────────────────

// كل طلبية تبدأ بـ /api/auth راه تروح لملف auth.routes.js
app.use('/', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // ← jdid

// ── 6. Health Check ──────────────────────────────────────────
// طريقة نتأكدوا بيها إن السيرفر شاغل ومزيان
// GET http://localhost:3001/health → { status: 'ok' }
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// ── 7. الاتصال بـ MongoDB وتشغيل السيرفر ────────────────────

// نتصلوا بـ MongoDB أولاً
// لما ينجح الاتصال، نشغّلوا السيرفر
mongoose
  .connect(process.env.MONGO_URI) // MONGO_URI موجودة في ملف .env
  .then(() => {
    console.log('✅ MongoDB متصل بنجاح');

    // نشغّل السيرفر على الـ PORT الموجود في .env
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Auth Service شاغل على البورت ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    // لو فيه مشكلة في الاتصال — نطبعوا الخطأ ونوقفوا البرنامج
    console.error('❌ فشل الاتصال بـ MongoDB:', err.message);
    process.exit(1); // 1 = خروج بسبب خطأ
  });