import pool from '../config/db.js';

export const getAccountsByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM accounts WHERE user_id = ?', [userId]);
  return rows;
};

export const getAccountById = async (accountId) => {
  const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ?', [accountId]);
  return rows[0];
};

export const createAccount = async (accountData) => {
  const { user_id, account_number, account_type, balance, currency } = accountData;
  const [result] = await pool.query(
    'INSERT INTO accounts (user_id, account_number, account_type, balance, currency) VALUES (?, ?, ?, ?, ?)',
    [user_id, account_number, account_type, balance || 0, currency || 'ILS']
  );
  return result.insertId;
};

export const updateAccountBalance = async (connection, accountId, amountChange) => {
  await connection.query(
    'UPDATE accounts SET balance = balance + ? WHERE id = ?',
    [amountChange, accountId]
  );
};

export const updateAccountStatus = async (accountId, status) => {
  await pool.query('UPDATE accounts SET status = ? WHERE id = ?', [status, accountId]);
};

export const getAllAccounts = async () => {
  const [rows] = await pool.query(`
    SELECT a.*, u.full_name, u.username 
    FROM accounts a 
    JOIN users u ON a.user_id = u.id
  `);
  return rows;
};
