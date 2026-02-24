const asyncHandler = require("../utils/asyncHandler");
const orderModel = require("../models/orderModel");

const listAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.listAllOrders();
  const statuses = [...new Set(orders.map((o) => o.status))];
  const transitionsByStatus = await Promise.all(
    statuses.map(async (status) => {
      const transitions = await orderModel.listTransitions({
        fromStatus: status,
        actorRole: "admin",
      });
      return [status, transitions];
    })
  );
  const groupedTransitions = Object.fromEntries(transitionsByStatus);

  res.json({
    items: orders.map((order) => ({
      ...order,
      allowed_transitions: groupedTransitions[order.status] || [],
    })),
  });
});

const transitionOrder = asyncHandler(async (req, res) => {
  const { to_status, delay_reason = null, eta_days = null } = req.body;
  if (!to_status) {
    return res.status(400).json({ message: "to_status is required" });
  }
  if (eta_days !== null && eta_days !== undefined && (!Number.isInteger(Number(eta_days)) || Number(eta_days) < 1)) {
    return res.status(400).json({ message: "eta_days must be a positive integer" });
  }

  const updated = await orderModel.transitionOrderWithNotification({
    orderId: req.params.id,
    toStatus: to_status,
    delayReason: delay_reason,
    etaDays: eta_days,
    actorRole: "admin"
  });
  res.json(updated);
});

module.exports = {
  listAllOrders,
  transitionOrder
};
