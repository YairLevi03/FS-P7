import pool from '../config/db.js';

export const getStandingOrdersByAccountId = async (accountId) => {
  const [rows] = await pool.query('SELECT * FROM standing_orders WHERE source_account_id = ? OR target_account_id = ?', [accountId, accountId]);
  return rows;
};

export const createStandingOrder = async (orderData) => {
  const { source_account_id, target_account_id, amount, frequency, next_run_date } = orderData;
  const [result] = await pool.query(
    'INSERT INTO standing_orders (source_account_id, target_account_id, amount, frequency, next_run_date) VALUES (?, ?, ?, ?, ?)',
    [source_account_id, target_account_id || null, amount, frequency, next_run_date]
  );
  return result.insertId;
};

export const updateStandingOrder = async (id, updateData) => {
  const { amount, frequency, next_run_date, is_active } = updateData;
  await pool.query(
    'UPDATE standing_orders SET amount = ?, frequency = ?, next_run_date = ?, is_active = ? WHERE id = ?',
    [amount, frequency, next_run_date, is_active, id]
  );
};

export const deleteStandingOrder = async (id) => {
  await pool.query('DELETE FROM standing_orders WHERE id = ?', [id]);
};
