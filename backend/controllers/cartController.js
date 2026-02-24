const asyncHandler = require("../utils/asyncHandler");
const cartModel = require("../models/cartModel");

const getCart = asyncHandler(async (req, res) => {
  const items = await cartModel.listByUser(req.user.id);
  res.json(items);
});

const addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) {
    return res.status(400).json({ message: "product_id is required" });
  }

  await cartModel.addOrIncrement(req.user.id, product_id, quantity);
  const items = await cartModel.listByUser(req.user.id);
  res.status(201).json(items);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: "quantity must be >= 1" });
  }

  await cartModel.updateQuantity(req.params.id, req.user.id, quantity);
  const items = await cartModel.listByUser(req.user.id);
  res.json(items);
});

const removeCartItem = asyncHandler(async (req, res) => {
  await cartModel.removeItem(req.params.id, req.user.id);
  const items = await cartModel.listByUser(req.user.id);
  res.json(items);
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
};
