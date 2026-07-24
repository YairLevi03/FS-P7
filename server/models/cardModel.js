import pool from '../config/db.js';

export const getCardsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT c.* FROM cards c 
     JOIN accounts a ON c.account_id = a.id 
     WHERE a.user_id = ?`,
    [userId]
  );
  return rows;
};

export const createCard = async (accountId, cardNumber, expirationDate, cvv, limitAmount) => {
  const [result] = await pool.query(
    'INSERT INTO cards (account_id, card_number, expiration_date, cvv, limit_amount) VALUES (?, ?, ?, ?, ?)',
    [accountId, cardNumber, expirationDate, cvv, limitAmount]
  );
  return result.insertId;
};

export const updateCardStatus = async (cardId, status) => {
  await pool.query('UPDATE cards SET status = ? WHERE id = ?', [status, cardId]);
};

export const updateCardLimit = async (cardId, limitAmount) => {
  await pool.query('UPDATE cards SET limit_amount = ? WHERE id = ?', [limitAmount, cardId]);
};
