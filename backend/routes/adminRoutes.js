const express = require("express");
const { listAllOrders, transitionOrder } = require("../controllers/adminOrderController");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();

router.use(authenticateToken, authorizeRole("admin"));
router.get("/orders", listAllOrders);
router.patch("/orders/:id/status", transitionOrder);

module.exports = router;
