const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { getAllUsers } = require("../controllers/admin.controller");

// كل routes هنا محمية بـ admin فقط
router.use(protect, restrictTo("admin"));

router.get("/users", getAllUsers);

module.exports = router;
