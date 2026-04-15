const express    = require('express');
const router     = express.Router();
const { register, login, verify } = require('../controllers/auth.controller');
const { protect, restrictTo }     = require('../middleware/auth.middleware');

router.post('/register',  register);
router.post('/login',     login);
router.get('/verify',     verify);

// Route admin — seulement un admin connecté peut créer un autre admin
router.post(
  '/register-admin',
  protect,
  restrictTo('admin'),
  async (req, res) => {
    req.body.role = 'admin'; // force le role
    return register(req, res);
  }
);

module.exports = router;