// ============================================================
//  PRODUCT SERVICE — models/product.model.js
//  هذا الملف يعرّف شكل المنتج في قاعدة البيانات
// ============================================================

const mongoose = require('mongoose');

// ── تعريف الـ Schema ──────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'اسم المنتج مطلوب'],
      trim:     true,
    },

    description: {
      type:    String,
      trim:    true,
      default: '',
    },

    price: {
      type:     Number,
      required: [true, 'السعر مطلوب'],
      min:      [0, 'السعر لا يمكن أن يكون سالباً'],
    },

    stock: {
      type:    Number,
      default: 0,
      min:     [0, 'الكمية لا يمكن أن تكون سالبة'],
    },

    category: {
      type:  String,
      trim:  true,
      default: 'عام',
    },

    imageUrl: {
      type:    String,
      default: '',
    },

    isActive: {
      type:    Boolean,
      default: true,
      // false = المنتج محذوف (soft delete)
      // ما نحذفوش من قاعدة البيانات فعلياً
    },
  },
  {
    timestamps: true,
    // يضيف تلقائياً:
    // createdAt → متى أُضيف المنتج
    // updatedAt → متى عُدِّل
  }
);

// ── Index للبحث السريع ────────────────────────────────────────
// يخلي البحث في name و description أسرع بكثير
productSchema.index({ name: 'text', description: 'text' });

// ── Index للفلترة بالـ category ──────────────────────────────
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);

// ============================================================
//  مثال على شكل المنتج في قاعدة البيانات:
//
//  {
//    "_id":         "64f1a2b3c4d5e6f7a8b9c0d1",
//    "name":        "لابتوب Dell",
//    "description": "لابتوب قوي للبرمجة",
//    "price":       2500,
//    "stock":       10,
//    "category":    "إلكترونيات",
//    "imageUrl":    "https://...",
//    "isActive":    true,
//    "createdAt":   "2024-01-15T10:30:00.000Z",
//    "updatedAt":   "2024-01-15T10:30:00.000Z"
//  }
// ============================================================