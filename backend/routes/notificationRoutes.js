const express = require("express");
const { myNotifications, readNotification } = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

router.use(authenticateToken);
router.get("/", myNotifications);
router.patch("/:id/read", readNotification);

module.exports = router;
