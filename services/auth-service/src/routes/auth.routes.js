const express = require('express');
const router  = express.Router();
const { register, login, verify } = require('../controllers/auth.controller');

// يقبل بالطريقتين
router.post('/register',           register);
router.post('/login',              login);
router.get('/verify',              verify);

module.exports = router;