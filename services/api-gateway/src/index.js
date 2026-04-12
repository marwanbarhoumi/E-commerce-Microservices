// ============================================================
//  API GATEWAY — index.js
//  بدون http-proxy-middleware — proxy يدوي بـ axios
// ============================================================

const express   = require('express');
const cors      = require('cors');
const axios     = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Rate Limiting ─────────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ── Routes مفتوحة بدون Token ──────────────────────────────────
const openRoutes = [
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'GET',  path: '/api/products' },
];

// ── Auth Middleware ───────────────────────────────────────────
app.use(async (req, res, next) => {
  const isOpen = openRoutes.some(
    (r) => r.method === req.method && req.path.startsWith(r.path)
  );
  if (isOpen) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'غير مصرح — سجّل دخول أولاً' });
  }

  try {
    const { data } = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
      { headers: { authorization: authHeader }, timeout: 5000 }
    );
    req.headers['x-user-id']   = data.user._id;
    req.headers['x-user-role'] = data.user.role;
    next();
  } catch {
    res.status(401).json({ message: 'غير مصرح — سجّل دخول أولاً' });
  }
});

// ── دالة الـ Proxy اليدوي ─────────────────────────────────────
const proxyRequest = (targetUrl) => async (req, res) => {
  try {
    const url = `${targetUrl}${req.originalUrl}`;

    const response = await axios({
      method:  req.method,
      url,
      data:    req.body,
      headers: {
        ...req.headers,
        host: undefined, // نحذف الـ host الأصلي
      },
      timeout: 10000,
    });

    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(503).json({ message: 'Service غير متاح' });
    }
  }
};

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     proxyRequest(process.env.AUTH_SERVICE_URL));
app.use('/api/products', proxyRequest(process.env.PRODUCT_SERVICE_URL));
app.use('/api/orders',   proxyRequest(process.env.ORDER_SERVICE_URL));

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// ── تشغيل السيرفر ─────────────────────────────────────────────
app.listen(process.env.PORT, () => {
  console.log(`🚀 API Gateway شاغل على البورت ${process.env.PORT}`);
  console.log(`   Auth    → ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   Product → ${process.env.PRODUCT_SERVICE_URL}`);
  console.log(`   Order   → ${process.env.ORDER_SERVICE_URL}`);
});