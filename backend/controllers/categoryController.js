const asyncHandler = require("../utils/asyncHandler");
const categoryModel = require("../models/categoryModel");

const listCategories = asyncHandler(async (req, res) => {
  const rows = await categoryModel.listAll();
  res.json(rows);
});

module.exports = {
  listCategories
};
