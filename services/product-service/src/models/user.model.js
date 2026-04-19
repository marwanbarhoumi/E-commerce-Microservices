 // ============================================================
//  AUTH SERVICE — models/user.model.js
//  هذا الملف يعرّف شكل المستخدم في قاعدة البيانات
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs'); // مكتبة تشفير كلمة المرور

// ── 1. تعريف الـ Schema ──────────────────────────────────────
// الـ Schema هو "قالب" يحدد شكل البيانات في MongoDB
// مثلاً: المستخدم لازم يكون عنده name, email, password

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'الاسم مطلوب'], // لو ما بعتوش → خطأ
      trim:     true,                   // يحذف المسافات الزايدة
    },

    email: {
      type:     String,
      required: [true, 'الإيميل مطلوب'],
      unique:   true,       // ما يتكررش — كل إيميل مرة واحدة بس
      lowercase: true,      // يحوّل للأحرف الصغيرة تلقائياً
      trim:     true,
    },

    password: {
      type:     String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور لازم تكون 6 أحرف على الأقل'],
    },

    role: {
      type:    String,
      enum:    ['user', 'admin'], // قيم مسموح بيها بس
      default: 'user',            // القيمة الافتراضية
    },
  },
  {
    timestamps: true,
    // timestamps: true → يضيف تلقائياً:
    //   createdAt: متى تم إنشاء الحساب
    //   updatedAt: متى تم تعديله
  }
);

// ── 2. تشفير كلمة المرور قبل الحفظ ──────────────────────────
// هذا الكود يشتغل تلقائياً قبل ما نحفظوا المستخدم في قاعدة البيانات
// الهدف: ما نحفظوش كلمة المرور كما هي (خطر!)
// نحفظوها مشفّرة مثلاً: "123456" → "$2a$12$xK9..."

userSchema.pre('save', async function (next) {
  // لو كلمة المرور ما تغيّرتش — ما نشفّروهاش مرة ثانية
  if (!this.isModified('password')) return next();

  // نشفّر كلمة المرور
  // الرقم 12 = قوة التشفير (كلما زاد كلما صار أبطأ وأأمن)
  this.password = await bcrypt.hash(this.password, 12);

  next(); // نكملوا عملية الحفظ
});

// ── 3. دالة مقارنة كلمة المرور ───────────────────────────────
// نستخدمها في Login:
// المستخدم يكتب كلمة مرور → نقارنوها مع المشفّرة في قاعدة البيانات

userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare تقارن النص العادي مع المشفّر
  // ترجع true لو صحيحة، false لو غلط
  return bcrypt.compare(candidatePassword, this.password);
};

// ── 4. تصدير الـ Model ───────────────────────────────────────
// الـ Model هو الأداة اللي نستخدموها للتعامل مع قاعدة البيانات:
//   User.create()     → إنشاء مستخدم جديد
//   User.findOne()    → البحث عن مستخدم
//   User.findById()   → البحث بالـ ID

module.exports = mongoose.model('User', userSchema);