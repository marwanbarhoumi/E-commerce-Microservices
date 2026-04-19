// ============================================================
//  ORDER SERVICE — index.js
// ============================================================

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB متصل بنجاح');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Order Service شاغل على البورت ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ فشل الاتصال بـ MongoDB:', err.message);
    process.exit(1);
  });