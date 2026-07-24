import pool from '../config/db.js';

export const getDepositsByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
};

export const createDeposit = async (userId, amount, interestRate, maturityDate) => {
  const [result] = await pool.query(
    'INSERT INTO deposits (user_id, amount, interest_rate, maturity_date) VALUES (?, ?, ?, ?)',
    [userId, amount, interestRate, maturityDate]
  );
  return result.insertId;
};

export const breakDeposit = async (depositId) => {
  await pool.query('UPDATE deposits SET status = "broken" WHERE id = ?', [depositId]);
};
