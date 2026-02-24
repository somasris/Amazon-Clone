const pool = require("../config/db");

async function listAll() {
  const [rows] = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
  return rows;
}

module.exports = {
  listAll
};
