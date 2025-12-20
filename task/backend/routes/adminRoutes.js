const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");

router.get("/pending-users", auth, adminOnly, adminController.getPendingUsers);
router.post("/verify-user/:id", auth, adminOnly, adminController.verifyUser);
router.post("/reject-user/:id", auth, adminOnly, adminController.rejectUser);

module.exports = router;