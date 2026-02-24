const asyncHandler = require("../utils/asyncHandler");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const { ORDER_STATUS } = require("../constants/orderStatus");
const { buildAdminOrderEmail } = require("../utils/orderMessages");
const { sendAdminEmail } = require("../services/emailService");

const placeOrder = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const parsedProductId = Number(product_id);
  const parsedQty = Number(quantity);

  if (!parsedProductId) {
    return res.status(400).json({ message: "product_id is required" });
  }
  if (!Number.isInteger(parsedQty) || parsedQty < 1) {
    return res.status(400).json({ message: "quantity must be a positive integer" });
  }

  const product = await productModel.getById(parsedProductId, req.user.account_type);
  if (!product || !product.availability) {
    return res.status(400).json({ message: "Product is unavailable for purchase" });
  }

  const orderId = await orderModel.createOrderWithNotification({
    userId: req.user.id,
    productId: parsedProductId,
    quantity: parsedQty,
    status: ORDER_STATUS.PENDING
  });

  const order = await orderModel.getById(orderId);

  // Non-blocking admin email: order creation should succeed even if SMTP is unavailable.
  try {
    const admin = await userModel.findPrimaryAdmin();
    const requester = await userModel.findById(req.user.id);
    if (admin?.email) {
      const mail = buildAdminOrderEmail({
        orderId,
        userName: requester?.name,
        userEmail: req.user.email,
        productName: product.name,
        quantity: parsedQty,
      });
      await sendAdminEmail(mail);
    }
  } catch (error) {
    console.warn("Failed to send admin order email:", error.message);
  }

  res.status(201).json(order);
});

const myOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.listUserOrders(req.user.id, req.query.status);
  res.json(orders);
});

const listStatuses = asyncHandler(async (req, res) => {
  const statuses = await orderModel.getStatuses();
  res.json(statuses);
});

const listTransitions = asyncHandler(async (req, res) => {
  const fromStatus = String(req.query.from_status || "").trim();
  const actorRole = req.user.role;

  if (!fromStatus) {
    return res.status(400).json({ message: "from_status is required" });
  }

  const transitions = await orderModel.listTransitions({ fromStatus, actorRole });
  res.json(transitions);
});

module.exports = {
  placeOrder,
  myOrders,
  listStatuses,
  listTransitions
};
