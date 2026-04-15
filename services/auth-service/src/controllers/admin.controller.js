const User = require('../models/user.model');

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};