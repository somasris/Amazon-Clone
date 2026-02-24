const express = require("express");
const { placeOrder, myOrders, listStatuses, listTransitions } = require("../controllers/orderController");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();

router.get("/statuses", authenticateToken, listStatuses);
router.get("/transitions", authenticateToken, listTransitions);
router.post("/", authenticateToken, authorizeRole("user"), placeOrder);
router.get("/my", authenticateToken, authorizeRole("user"), myOrders);

module.exports = router;
