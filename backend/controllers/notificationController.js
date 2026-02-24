const asyncHandler = require("../utils/asyncHandler");
const notificationModel = require("../models/notificationModel");

const myNotifications = asyncHandler(async (req, res) => {
  const rows = await notificationModel.listByUser(req.user.id);
  res.json(rows);
});

const readNotification = asyncHandler(async (req, res) => {
  await notificationModel.markAsRead(req.params.id, req.user.id);
  res.json({ message: "Notification marked as read" });
});

module.exports = {
  myNotifications,
  readNotification
};
