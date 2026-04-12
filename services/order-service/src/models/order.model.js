 // ============================================================
//  ORDER SERVICE — models/order.model.js
//  شكل الطلبية في قاعدة البيانات
// ============================================================

const mongoose = require('mongoose');

// ── شكل كل منتج داخل الطلبية ─────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  productId: {
    type:     String,
    required: true,
    // ID المنتج من Product Service
  },
  name: {
    type:     String,
    required: true,
    // نحفظوا الاسم هنا — لو المنتج اتحذف بعدين نقدروا نشوفوا الطلبية
  },
  price: {
    type:     Number,
    required: true,
    // نحفظوا السعر وقت الشراء — لو السعر تغيّر بعدين ما يأثّرش
  },
  quantity: {
    type:     Number,
    required: true,
    min:      [1, 'الكمية لازم تكون 1 على الأقل'],
  },
});

// ── شكل الطلبية الكاملة ───────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type:     String,
      required: true,
      // ID المستخدم — يجي من الـ JWT Token
    },

    items: {
      type:     [orderItemSchema],
      required: true,
      // قائمة المنتجات في الطلبية
    },

    total: {
      type:     Number,
      required: true,
      // إجمالي السعر — نحسبوه تلقائياً
    },

    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      // pending   = في الانتظار
      // confirmed = تم التأكيد
      // shipped   = تم الشحن
      // delivered = تم التوصيل
      // cancelled = ملغية
    },

    shippingAddress: {
      street:  { type: String },
      city:    { type: String },
      country: { type: String, default: 'تونس' },
    },

    notes: {
      type:    String,
      default: '',
      // ملاحظات إضافية من المستخدم
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);

// ============================================================
//  مثال على شكل الطلبية في قاعدة البيانات:
//
//  {
//    "_id":    "64f1a2b3...",
//    "userId": "64f9x8y7...",
//    "items": [
//      { "productId": "abc123", "name": "لابتوب", "price": 2500, "quantity": 1 },
//      { "productId": "def456", "name": "ماوس",   "price": 50,   "quantity": 2 }
//    ],
//    "total":  2600,
//    "status": "pending",
//    "shippingAddress": { "city": "تونس", "country": "تونس" },
//    "createdAt": "2024-01-15T10:30:00.000Z"
//  }
// ============================================================