import pool from '../config/db.js';

export const createAuditLog = async ({ user_id, action_type, description, ip_address }) => {
  const [result] = await pool.query(
    'INSERT INTO audit_logs (user_id, action_type, description, ip_address) VALUES (?, ?, ?, ?)',
    [user_id || null, action_type, description || null, ip_address || null]
  );
  return result.insertId;
};

export const getAuditLogs = async (limit = 100) => {
  const [rows] = await pool.query(
    'SELECT a.*, u.username as user_username FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT ?',
    [limit]
  );
  return rows;
};
