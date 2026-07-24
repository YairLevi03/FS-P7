import pool from '../config/db.js';

export const findUserByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT id, full_name, username, role, phone, branch_id, created_at FROM users WHERE id = ?', [id]);
  return rows[0];
};

export const createUser = async (userData) => {
  const { full_name, username, password_hash, role, phone, branch_id } = userData;
  const [result] = await pool.query(
    'INSERT INTO users (full_name, username, password_hash, role, phone, branch_id) VALUES (?, ?, ?, ?, ?, ?)',
    [full_name, username, password_hash, role || 'customer', phone, branch_id]
  );
  return result.insertId;
};

export const updateUserProfile = async (id, updateData) => {
  const { full_name, phone } = updateData;
  await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone, id]);
};

export const getAllCustomers = async (branchId = null) => {
  let query = 'SELECT id, full_name, username, role, phone, branch_id, failed_login_attempts, status, created_at FROM users WHERE role = "customer"';
  const params = [];
  if (branchId) {
    query += ' AND branch_id = ?';
    params.push(branchId);
  }
  const [rows] = await pool.query(query, params);
  return rows;
};

export const incrementFailedLogin = async (id) => {
  await pool.query('UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?', [id]);
};

export const resetFailedLogin = async (id) => {
  await pool.query('UPDATE users SET failed_login_attempts = 0 WHERE id = ?', [id]);
};

export const lockUser = async (id) => {
  await pool.query('UPDATE users SET status = "locked" WHERE id = ?', [id]);
};

export const unlockUser = async (id) => {
  await pool.query('UPDATE users SET status = "active", failed_login_attempts = 0 WHERE id = ?', [id]);
};
