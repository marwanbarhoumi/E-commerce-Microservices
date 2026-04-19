// ============================================================
//  PRODUCT SERVICE — index.js
//  نقطة البداية للـ Product Service
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const productRoutes = require('./routes/product.routes');

const app = express();

// ── Middlewares ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/products', productRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

// ── الاتصال بـ MongoDB وتشغيل السيرفر ────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB متصل بنجاح');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Product Service شاغل على البورت ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ فشل الاتصال بـ MongoDB:', err.message);
    process.exit(1);
  });