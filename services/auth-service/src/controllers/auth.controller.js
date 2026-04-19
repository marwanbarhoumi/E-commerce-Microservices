// ============================================================
//  AUTH SERVICE — controllers/auth.controller.js
//  هذا الملف فيه المنطق الكامل لـ:
//    - register  → تسجيل مستخدم جديد
//    - login     → تسجيل الدخول
//    - verify    → التحقق من الـ Token
// ============================================================

const jwt  = require('jsonwebtoken'); // مكتبة إنشاء والتحقق من JWT
const User = require('../models/user.model'); // نستورد الـ Model

// ── دالة مساعدة: إنشاء JWT Token ────────────────────────────
// الـ Token هو "بطاقة هوية رقمية" للمستخدم
// نبعثوها له بعد Register أو Login
// بعدها يبعثها مع كل طلب باش نتأكدوا هو من هو

const signToken = (userId) => {
  return jwt.sign(
    { id: userId },              // البيانات اللي نخبّيوها في الـ Token
    process.env.JWT_SECRET,      // المفتاح السري للتشفير (في .env)
    { expiresIn: process.env.JWT_EXPIRES_IN } // مدة الصلاحية (مثلاً 7d)
  );
};

// ── 1. Register — تسجيل مستخدم جديد ─────────────────────────
// POST /api/auth/register
// Body: { name, email, password }

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ① التحقق إن كل الحقول موجودة
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'كل الحقول مطلوبة' });
    }

    // ② نتحققوا إن الإيميل مش مستخدم
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'هذا الإيميل مستخدم بالفعل' });
    }

    // ③ ننشئوا المستخدم في قاعدة البيانات
    // كلمة المرور تتشفّر تلقائياً (في user.model.js)
    const user = await User.create({ name, email, password });

    // ④ ننشئوا الـ Token
    const token = signToken(user._id);

    // ⑤ نرجعوا الـ Token + بيانات المستخدم
    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── 2. Login — تسجيل الدخول ──────────────────────────────────
// POST /api/auth/login
// Body: { email, password }

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ① التحقق إن الحقول موجودة
    if (!email || !password) {
      return res.status(400).json({ message: 'الإيميل وكلمة المرور مطلوبان' });
    }

    // ② نبحثوا على المستخدم بالإيميل
    const user = await User.findOne({ email });

    // ③ نتحققوا إن المستخدم موجود وكلمة المرور صحيحة
    // comparePassword موجودة في user.model.js
    if (!user || !(await user.comparePassword(password))) {
      // نرجعوا نفس الرسالة للأمان — ما نقولوش أيهم الغلط
      return res.status(401).json({ message: 'الإيميل أو كلمة المرور غلط' });
    }

    // ④ ننشئوا الـ Token
    const token = signToken(user._id);

    // ⑤ نرجعوا الـ Token + بيانات المستخدم
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── 3. Verify — التحقق من الـ Token ──────────────────────────
// GET /api/auth/verify
// Header: Authorization: Bearer <token>
//
// هذه الدالة تستخدمها بقية الـ services (product, order...)
// باش يتأكدوا إن المستخدم مسجّل دخول قبل ما يخدموا طلبيته

exports.verify = async (req, res) => {
  try {
    // ① نجيبوا الـ Token من الـ Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'لا يوجد Token' });
    }

    // الـ Header يكون هكذا: "Bearer eyJhbGci..."
    // نقسّموه ونأخذوا الجزء الثاني بس
    const token = authHeader.split(' ')[1];

    // ② نتحققوا من الـ Token
    // لو غلط أو منتهي الصلاحية → يرمي خطأ تلقائياً
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ③ نجيبوا بيانات المستخدم من قاعدة البيانات
    // select('-password') → ما نرجعوش كلمة المرور حتى المشفّرة
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }

    // ④ الـ Token صحيح — نرجعوا بيانات المستخدم
    res.json({
      valid: true,
      user,
    });

  } catch (err) {
    // الـ Token غلط أو منتهي الصلاحية
    res.status(401).json({ valid: false, message: 'Token غير صالح' });
  }
};