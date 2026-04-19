// ============================================================
//  ORDER SERVICE — controllers/order.controller.js
//  المنطق الكامل للطلبيات
// ============================================================

const axios = require('axios');
const Order = require('../models/order.model');

// ── 1. create — إنشاء طلبية جديدة ────────────────────────────
// POST /api/orders
// Body: { items: [{ productId, quantity }], shippingAddress, notes }

exports.create = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    // userId يجي من الـ API Gateway اللي يحطها في الـ Header
    // بعد ما يتحقق من الـ JWT Token
    const userId = req.headers['x-user-id'];

    // ① التحقق من البيانات
    if (!userId) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'الطلبية فارغة — أضف منتجات' });
    }

    // ② نجيبوا تفاصيل كل منتج من Product Service
    // نتأكدوا إن المنتج موجود وسعره الحقيقي
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const { data: product } = await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`
          );

          // نتأكدوا إن فيه stock كافي
          if (product.stock < item.quantity) {
            throw new Error(`المنتج "${product.name}" — الكمية المتاحة فقط ${product.stock}`);
          }

          return {
            productId: product._id,
            name:      product.name,
            price:     product.price,  // السعر الحقيقي من Product Service
            quantity:  item.quantity,
          };
        } catch (err) {
          if (err.response?.status === 404) {
            throw new Error(`المنتج ${item.productId} غير موجود`);
          }
          throw err;
        }
      })
    );

    // ③ نحسبوا الإجمالي
    const total = enrichedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ④ ننشئوا الطلبية
    const order = await Order.create({
      userId,
      items: enrichedItems,
      total,
      shippingAddress,
      notes,
    });

    res.status(201).json({
      message: 'تم إنشاء الطلبية بنجاح',
      order,
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── 2. getMyOrders — جلب طلبيات المستخدم ─────────────────────
// GET /api/orders/my

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }); // الأحدث أولاً

    res.json({
      orders,
      total: orders.length,
    });

  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── 3. getOne — جلب طلبية واحدة ──────────────────────────────
// GET /api/orders/:id

exports.getOne = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const order  = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'الطلبية غير موجودة' });
    }

    // نتأكدوا إن الطلبية تخص هذا المستخدم
    if (order.userId !== userId) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لرؤية هذه الطلبية' });
    }

    res.json(order);

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'ID غير صالح' });
    }
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── 4. updateStatus — تحديث حالة الطلبية ────────────────────
// PATCH /api/orders/:id/status
// Body: { status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }
// هذا للـ admin فقط

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `الحالة غير صالحة — الحالات المتاحة: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'الطلبية غير موجودة' });
    }

    res.json({
      message: `تم تحديث حالة الطلبية إلى: ${status}`,
      order,
    });

  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── 5. cancel — إلغاء طلبية ──────────────────────────────────
// PATCH /api/orders/:id/cancel

exports.cancel = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const order  = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'الطلبية غير موجودة' });
    }

    // نتأكدوا إن الطلبية تخص هذا المستخدم
    if (order.userId !== userId) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لإلغاء هذه الطلبية' });
    }

    // ما نقدروش نلغي طلبية تم شحنها أو توصيلها
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        message: 'لا يمكن إلغاء طلبية تم شحنها أو توصيلها',
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'تم إلغاء الطلبية بنجاح', order });

  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};
// ── 6. getAllOrders — كل الطلبيات (admin) ─────────────────────
// GET /api/orders/admin/all

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders, total: orders.length });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── 7. getStats — إحصائيات (admin) ───────────────────────────
// GET /api/orders/admin/stats

exports.getStats = async (req, res) => {
  try {
    const totalOrders   = await Order.countDocuments();
    const totalRevenue  = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
    });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};