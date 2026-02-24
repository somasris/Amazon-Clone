const asyncHandler = require("../utils/asyncHandler");
const productModel = require("../models/productModel");

function normalizeProductPayload(payload = {}) {
  const normalized = {};

  if (payload.name !== undefined) normalized.name = String(payload.name).trim();
  if (payload.description !== undefined) normalized.description = String(payload.description).trim();
  if (payload.image_url !== undefined) normalized.image_url = String(payload.image_url).trim();
  if (payload.price !== undefined) normalized.price = Number(payload.price);
  if (payload.category_id !== undefined) normalized.category_id = Number(payload.category_id);
  if (payload.availability !== undefined) normalized.availability = Number(payload.availability) ? 1 : 0;
  if (payload.visibility_tier !== undefined) normalized.visibility_tier = String(payload.visibility_tier).trim();

  return normalized;
}

function validateProductPayload(payload, { partial = false } = {}) {
  const tiers = ["free", "pro", "premium"];

  if (!partial) {
    const required = ["name", "description", "image_url", "price", "category_id"];
    for (const key of required) {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
        return `${key} is required`;
      }
    }
  }

  if (payload.name !== undefined && !payload.name) return "name cannot be empty";
  if (payload.description !== undefined && !payload.description) return "description cannot be empty";
  if (payload.image_url !== undefined && !payload.image_url) return "image_url cannot be empty";
  if (payload.price !== undefined && (!Number.isFinite(payload.price) || payload.price < 0)) return "price must be a valid number";
  if (payload.category_id !== undefined && (!Number.isInteger(payload.category_id) || payload.category_id < 1)) {
    return "category_id must be a positive integer";
  }
  if (payload.availability !== undefined && ![0, 1].includes(payload.availability)) return "availability must be 0 or 1";
  if (payload.visibility_tier !== undefined && !tiers.includes(payload.visibility_tier)) {
    return "visibility_tier must be one of free, pro, premium";
  }

  return null;
}

const listProducts = asyncHandler(async (req, res) => {
  const accountType = req.user?.account_type || "free";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 60);
  const allowedSort = ["newest", "price_asc", "price_desc", "name_asc"];
  const sort = allowedSort.includes(req.query.sort) ? req.query.sort : "newest";
  const result = await productModel.getAll({
    q: req.query.q,
    category: req.query.category,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    accountType,
    page,
    limit,
    sort
  });
  res.json(result);
});

const getProduct = asyncHandler(async (req, res) => {
  const accountType = req.user?.account_type || "free";
  const product = await productModel.getById(req.params.id, accountType);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload({
    ...req.body,
    availability: req.body.availability ?? 1,
    visibility_tier: req.body.visibility_tier ?? "free",
  });
  const validationError = validateProductPayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const id = await productModel.createProduct(payload);

  const created = await productModel.getById(id, "premium");
  res.status(201).json(created);
});

const updateProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload(req.body);
  const allowedKeys = ["name", "description", "image_url", "price", "category_id", "availability", "visibility_tier"];
  const safePayload = Object.fromEntries(Object.entries(payload).filter(([key]) => allowedKeys.includes(key)));

  if (!Object.keys(safePayload).length) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }

  const validationError = validateProductPayload(safePayload, { partial: true });
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  await productModel.updateProduct(req.params.id, safePayload);
  const product = await productModel.getById(req.params.id, "premium");
  res.json({ message: "Product updated", product });
});

const removeProduct = asyncHandler(async (req, res) => {
  await productModel.deleteProduct(req.params.id);
  res.json({ message: "Product deleted" });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  removeProduct
};
