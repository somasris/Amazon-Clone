const pool = require("../config/db");

async function createNotification(userId, message) {
  await pool.query("INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, 0)", [userId, message]);
}

async function listByUser(userId) {
  const [rows] = await pool.query(
    "SELECT id, user_id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

async function markAsRead(notificationId, userId) {
  await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [notificationId, userId]);
}

module.exports = {
  createNotification,
  listByUser,
  markAsRead
};
