// ============================================================
//  ORDER SERVICE — routes/order.routes.js
// ============================================================

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/order.controller');

// POST   /api/orders              → إنشاء طلبية جديدة
router.post('/', controller.create);

// GET    /api/orders/my           → طلبياتي
router.get('/my', controller.getMyOrders);

// GET    /api/orders/:id          → طلبية واحدة
router.get('/:id', controller.getOne);

// PATCH  /api/orders/:id/status   → تحديث الحالة (admin)
router.patch('/:id/status', controller.updateStatus);

// PATCH  /api/orders/:id/cancel   → إلغاء طلبية
router.patch('/:id/cancel', controller.cancel);

module.exports = router;

// ============================================================
//  ملخص الـ API:
//
//  POST   /api/orders              → إنشاء طلبية
//  GET    /api/orders/my           → طلبياتي
//  GET    /api/orders/:id          → طلبية واحدة
//  PATCH  /api/orders/:id/status   → تحديث الحالة
//  PATCH  /api/orders/:id/cancel   → إلغاء
// ============================================================