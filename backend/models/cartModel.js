const pool = require("../config/db");

async function listByUser(userId) {
  const [rows] = await pool.query(
    `
      SELECT c.id, c.user_id, c.product_id, c.quantity,
             p.name, p.price, p.availability, p.visibility_tier, p.image_url
      FROM cart c
      JOIN products p ON p.id = c.product_id
      WHERE c.user_id = ?
      ORDER BY c.id DESC
    `,
    [userId]
  );
  return rows;
}

async function findItem(userId, productId) {
  const [rows] = await pool.query(
    "SELECT * FROM cart WHERE user_id = ? AND product_id = ? LIMIT 1",
    [userId, productId]
  );
  return rows[0] || null;
}

async function addOrIncrement(userId, productId, quantity) {
  const existing = await findItem(userId, productId);
  if (existing) {
    await pool.query("UPDATE cart SET quantity = quantity + ? WHERE id = ?", [quantity, existing.id]);
    return existing.id;
  }

  const [result] = await pool.query(
    "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
    [userId, productId, quantity]
  );
  return result.insertId;
}

async function updateQuantity(itemId, userId, quantity) {
  await pool.query("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?", [quantity, itemId, userId]);
}

async function removeItem(itemId, userId) {
  await pool.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [itemId, userId]);
}

module.exports = {
  listByUser,
  addOrIncrement,
  updateQuantity,
  removeItem
};
