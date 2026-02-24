const express = require("express");
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  removeProduct
} = require("../controllers/productController");
const authenticateToken = require("../middleware/authenticateToken");
const optionalAuthenticateToken = require("../middleware/optionalAuthenticateToken");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();

router.get("/", optionalAuthenticateToken, listProducts);
router.get("/:id", optionalAuthenticateToken, getProduct);
router.post("/", authenticateToken, authorizeRole("admin"), createProduct);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateProduct);
router.delete("/:id", authenticateToken, authorizeRole("admin"), removeProduct);

module.exports = router;
