import pool from '../config/db.js';

export const getTransactionsByAccountId = async (accountId, filters = {}) => {
  let query = 'SELECT * FROM transactions WHERE account_id = ?';
  const params = [accountId];

  if (filters.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters.from) {
    query += ' AND created_at >= ?';
    params.push(filters.from);
  }
  if (filters.to) {
    query += ' AND created_at <= ?';
    params.push(filters.to + ' 23:59:59'); // include full day
  }
  if (filters.minAmount) {
    query += ' AND amount >= ?';
    params.push(filters.minAmount);
  }
  if (filters.maxAmount) {
    query += ' AND amount <= ?';
    params.push(filters.maxAmount);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

export const createTransaction = async (connection, transactionData) => {
  const { account_id, type, amount, related_account_id, description, status } = transactionData;
  const [result] = await connection.query(
    'INSERT INTO transactions (account_id, type, amount, related_account_id, description, status) VALUES (?, ?, ?, ?, ?, ?)',
    [account_id, type, amount, related_account_id || null, description, status || 'completed']
  );
  return result.insertId;
};

export const getPendingTransactions = async () => {
  const [rows] = await pool.query('SELECT * FROM transactions WHERE status = "pending" ORDER BY created_at DESC');
  return rows;
};

export const updateTransactionStatus = async (transactionId, status) => {
  await pool.query('UPDATE transactions SET status = ? WHERE id = ?', [status, transactionId]);
};
