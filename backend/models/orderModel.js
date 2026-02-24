const pool = require("../config/db");
const { buildOrderPlacedMessage, buildOrderStatusChangedMessage } = require("../utils/orderMessages");

async function getStatuses() {
  const [rows] = await pool.query("SELECT code, label FROM order_statuses ORDER BY sort_order ASC");
  return rows;
}

async function isValidTransition({ fromStatus, toStatus, actorRole }) {
  const [rows] = await pool.query(
    `
      SELECT id, requires_reason
      FROM order_status_transitions
      WHERE from_status = ? AND to_status = ? AND actor_role = ?
      LIMIT 1
    `,
    [fromStatus, toStatus, actorRole]
  );

  return rows[0] || null;
}

async function createOrder({ userId, productId, quantity, status = "pending" }) {
  const [result] = await pool.query(
    "INSERT INTO orders (user_id, product_id, quantity, status) VALUES (?, ?, ?, ?)",
    [userId, productId, quantity, status]
  );
  return result.insertId;
}

async function getById(id) {
  const [rows] = await pool.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function listUserOrders(userId, status) {
  let sql = `
    SELECT o.id, o.user_id, o.product_id, o.quantity, o.status, o.eta_days, os.label AS status_label,
           o.delay_reason, o.created_at, o.updated_at,
           p.name AS product_name, p.price AS product_price
    FROM orders o
    JOIN products p ON p.id = o.product_id
    JOIN order_statuses os ON os.code = o.status
    WHERE o.user_id = ?
  `;
  const params = [userId];

  if (status) {
    sql += " AND o.status = ?";
    params.push(status);
  }

  sql += " ORDER BY o.created_at DESC";

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function listAllOrders() {
  const [rows] = await pool.query(
    `
      SELECT o.id, o.user_id, u.name AS user_name, u.email AS user_email,
             o.product_id, p.name AS product_name, o.quantity,
             o.status, o.eta_days, os.label AS status_label, o.delay_reason,
             o.created_at, o.updated_at
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN products p ON p.id = o.product_id
      JOIN order_statuses os ON os.code = o.status
      ORDER BY o.created_at DESC
    `
  );
  return rows;
}

async function updateStatus({ orderId, toStatus, delayReason = null }) {
  await pool.query(
    "UPDATE orders SET status = ?, delay_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [toStatus, delayReason, orderId]
  );
}

async function createOrderWithNotification({ userId, productId, quantity, status = "pending", message }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      "INSERT INTO orders (user_id, product_id, quantity, status) VALUES (?, ?, ?, ?)",
      [userId, productId, quantity, status]
    );

    await connection.query("INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, 0)", [
      userId,
      message || buildOrderPlacedMessage(result.insertId),
    ]);

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function transitionOrderWithNotification({
  orderId,
  toStatus,
  delayReason = null,
  etaDays = null,
  actorRole = "admin"
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orderRows] = await connection.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [orderId]);
    const order = orderRows[0];
    if (!order) {
      const err = new Error("Order not found");
      err.status = 404;
      throw err;
    }

    const [transitionRows] = await connection.query(
      `
      SELECT id, requires_reason
      FROM order_status_transitions
      WHERE from_status = ? AND to_status = ? AND actor_role = ?
      LIMIT 1
    `,
      [order.status, toStatus, actorRole]
    );
    const transition = transitionRows[0];
    if (!transition) {
      const err = new Error(`Invalid status transition: ${order.status} -> ${toStatus}`);
      err.status = 400;
      throw err;
    }
    if (transition.requires_reason && !delayReason) {
      const err = new Error("delay_reason is required for this status");
      err.status = 400;
      throw err;
    }

    await connection.query(
      "UPDATE orders SET status = ?, eta_days = ?, delay_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [
        toStatus,
        Number.isInteger(Number(etaDays)) && Number(etaDays) > 0 ? Number(etaDays) : null,
        transition.requires_reason ? delayReason : null,
        order.id,
      ]
    );
    await connection.query("INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, 0)", [
      order.user_id,
      buildOrderStatusChangedMessage({
        orderId: order.id,
        fromStatus: order.status,
        toStatus,
        delayReason: transition.requires_reason ? delayReason : null,
        etaDays,
      }),
    ]);

    await connection.commit();

    const [updatedRows] = await pool.query("SELECT * FROM orders WHERE id = ? LIMIT 1", [order.id]);
    return updatedRows[0];
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listTransitions({ fromStatus, actorRole }) {
  const [rows] = await pool.query(
    `
      SELECT t.to_status, s.label AS to_status_label, t.requires_reason
      FROM order_status_transitions t
      JOIN order_statuses s ON s.code = t.to_status
      WHERE t.from_status = ? AND t.actor_role = ?
      ORDER BY s.sort_order ASC
    `,
    [fromStatus, actorRole]
  );
  return rows;
}

module.exports = {
  getStatuses,
  isValidTransition,
  createOrder,
  getById,
  listUserOrders,
  listAllOrders,
  updateStatus,
  createOrderWithNotification,
  transitionOrderWithNotification,
  listTransitions
};
