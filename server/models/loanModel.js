import pool from '../config/db.js';

export const getLoansByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows;
};

export const getAllPendingLoans = async () => {
  const [rows] = await pool.query(
    'SELECT l.*, u.full_name, u.email FROM loans l JOIN users u ON l.user_id = u.id WHERE l.status = "pending" ORDER BY l.created_at ASC'
  );
  return rows;
};

export const createLoan = async (userId, amount, interestRate, termMonths, purpose) => {
  const [result] = await pool.query(
    'INSERT INTO loans (user_id, amount, interest_rate, term_months, purpose) VALUES (?, ?, ?, ?, ?)',
    [userId, amount, interestRate, termMonths, purpose]
  );
  return result.insertId;
};

export const updateLoanStatus = async (loanId, status) => {
  await pool.query('UPDATE loans SET status = ? WHERE id = ?', [status, loanId]);
};
