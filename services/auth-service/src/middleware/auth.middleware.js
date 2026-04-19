// ============================================================
//  AUTH SERVICE — middleware/auth.middleware.js
//
//  الـ Middleware هو كود يشتغل بين استقبال الطلب والـ Route
//  مثل حارس الأمن — يتحقق من الـ Token قبل ما يسمح بالدخول
//
//  الاستخدام:
//    router.get('/profile', protect, getProfile)
//    أي route فيها protect → لازم المستخدم يكون مسجّل دخول
// ============================================================

const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

// ── 1. protect — التحقق من تسجيل الدخول ─────────────────────
// يتأكد إن المستخدم عنده Token صالح قبل ما يدخل للـ route

exports.protect = async (req, res, next) => {
  try {

    // ① نجيبوا الـ Token من الـ Header
    // الـ Header يكون هكذا: Authorization: Bearer eyJhbGci...
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'يجب تسجيل الدخول أولاً — لا يوجد Token',
      });
    }

    // نأخذوا الـ Token بعد كلمة "Bearer "
    const token = authHeader.split(' ')[1];

    // ② نتحققوا من صحة الـ Token
    // لو Token غلط أو منتهي → يرمي خطأ تلقائياً
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "64f1a2b3...", iat: 1234567890, exp: 1235567890 }

    // ③ نجيبوا بيانات المستخدم من قاعدة البيانات
    // select('-password') → ما نرجعوش كلمة المرور
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'المستخدم غير موجود — Token غير صالح',
      });
    }

    // ④ نحطوا بيانات المستخدم في req
    // باش الـ route تقدر تستخدمها بعدين
    // مثال: req.user.id, req.user.role
    req.user = user;

    // ⑤ نكملوا للـ route الأصلية
    next();

  } catch (err) {

    // Token غلط أو منتهي الصلاحية
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token غير صالح' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token منتهي الصلاحية — سجّل دخول مجدداً' });
    }

    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── 2. restrictTo — تقييد الوصول حسب الدور ───────────────────
// بعد protect، نستخدموا restrictTo باش نسمحوا فقط لـ admin مثلاً
//
// مثال الاستخدام:
//   router.delete('/product/:id', protect, restrictTo('admin'), deleteProduct)
//   → فقط admin يقدر يحذف منتج

exports.restrictTo = (...roles) => {
  // roles = ['admin'] أو ['admin', 'manager'] إلخ
  return (req, res, next) => {

    // req.user.role جاي من middleware protect اللي اشتغل قبلها
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `ليس لديك صلاحية — هذا الإجراء مخصص لـ: ${roles.join(', ')}`,
      });
    }

    next(); // الدور مسموح → نكملوا
  };
};

