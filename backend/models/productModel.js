const pool = require("../config/db");

async function getAll({ q, category, minPrice, maxPrice, accountType, page = 1, limit = 12, sort = "newest" }) {
  let whereSql = `
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    whereSql += " AND p.name LIKE ?";
    params.push(`%${q}%`);
  }

  if (category) {
    whereSql += " AND c.name = ?";
    params.push(category);
  }

  if (minPrice !== undefined) {
    whereSql += " AND p.price >= ?";
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined) {
    whereSql += " AND p.price <= ?";
    params.push(Number(maxPrice));
  }

  whereSql += `
    AND (
      p.visibility_tier = 'free'
      OR (p.visibility_tier = 'pro' AND ? IN ('pro', 'premium'))
      OR (p.visibility_tier = 'premium' AND ? = 'premium')
    )
  `;
  params.push(accountType || "free", accountType || "free");

  let orderBy = " ORDER BY p.created_at DESC";
  if (sort === "price_asc") orderBy = " ORDER BY p.price ASC";
  if (sort === "price_desc") orderBy = " ORDER BY p.price DESC";
  if (sort === "name_asc") orderBy = " ORDER BY p.name ASC";

  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 60);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${whereSql}`, params);
  const total = Number(countRows[0].total || 0);

  const [rows] = await pool.query(
    `
      SELECT p.id, p.name, p.description, p.price, p.category_id, c.name AS category_name, p.availability,
             p.visibility_tier, p.image_url, p.created_at
      ${whereSql}
      ${orderBy}
      LIMIT ? OFFSET ?
    `,
    [...params, safeLimit, offset]
  );
  return {
    items: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1)
    }
  };
}

async function getById(id, accountType) {
  const [rows] = await pool.query(
    `
      SELECT p.id, p.name, p.description, p.price, p.category_id, c.name AS category_name,
             p.availability, p.visibility_tier, p.image_url, p.created_at
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
      AND (
        p.visibility_tier = 'free'
        OR (p.visibility_tier = 'pro' AND ? IN ('pro', 'premium'))
        OR (p.visibility_tier = 'premium' AND ? = 'premium')
      )
      LIMIT 1
    `,
    [id, accountType || "free", accountType || "free"]
  );
  return rows[0] || null;
}

async function createProduct({ name, description, image_url, price, category_id, availability, visibility_tier }) {
  const [result] = await pool.query(
    "INSERT INTO products (name, description, image_url, price, category_id, availability, visibility_tier) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, description, image_url, price, category_id, availability, visibility_tier]
  );
  return result.insertId;
}

async function updateProduct(id, payload) {
  const fields = [];
  const values = [];

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  if (!fields.length) return;

  values.push(id);
  await pool.query(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, values);
}

async function deleteProduct(id) {
  await pool.query("DELETE FROM products WHERE id = ?", [id]);
}

module.exports = {
  getAll,
  getById,
  createProduct,
  updateProduct,
  deleteProduct
};
