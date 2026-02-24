const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, account_type, location, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, password, role = "user", account_type = "free", location = null }) {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role, account_type, location) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, password, role, account_type, location]
  );
  return result.insertId;
}

async function findPrimaryAdmin() {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, account_type, location FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
  );
  return rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  findPrimaryAdmin
};
