import pool from '../config/db.js';

export const getPaymentsByAccountId = async (accountId) => {
  const [rows] = await pool.query('SELECT * FROM payments WHERE account_id = ? ORDER BY created_at DESC', [accountId]);
  return rows;
};

export const createPayment = async (connection, paymentData) => {
  const { account_id, payee_name, category, amount, status } = paymentData;
  const [result] = await connection.query(
    'INSERT INTO payments (account_id, payee_name, category, amount, status) VALUES (?, ?, ?, ?, ?)',
    [account_id, payee_name, category, amount, status || 'completed']
  );
  return result.insertId;
};
