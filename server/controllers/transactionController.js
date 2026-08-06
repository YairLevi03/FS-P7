import pool from '../config/db.js';
import * as auditService from '../services/auditService.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, minAmount, maxAmount, type, accountNumber } = req.query;
    let query = `
      SELECT t.*, a.account_number 
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (startDate) {
      query += ' AND DATE(t.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(t.created_at) <= ?';
      params.push(endDate);
    }
    if (minAmount) {
      query += ' AND ABS(t.amount) >= ?';
      params.push(minAmount);
    }
    if (maxAmount) {
      query += ' AND ABS(t.amount) <= ?';
      params.push(maxAmount);
    }
    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }
    if (accountNumber) {
      query += ' AND a.account_number = ?';
      params.push(accountNumber);
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const depositCheck = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { accountId, amount } = req.body;
    if (!req.file) {
      throw { statusCode: 400, message: 'Check image is required' };
    }

    const checkImagePath = `/uploads/checks/${req.file.filename}`;

    // Verify account ownership and status
    const [accounts] = await connection.query('SELECT status FROM accounts WHERE id = ? AND user_id = ?', [accountId, req.user.id]);
    if (accounts.length === 0) {
      throw { statusCode: 404, message: 'Account not found' };
    }
    if (accounts[0].status !== 'active') {
      throw { statusCode: 403, message: 'Cannot deposit to a non-active account' };
    }

    const isHighValue = amount > 50000;
    const status = isHighValue ? 'pending' : 'completed';

    // Add transaction
    const [result] = await connection.query(
      'INSERT INTO transactions (account_id, type, amount, check_image_path, status, description) VALUES (?, "check_deposit", ?, ?, ?, "Check Deposit")',
      [accountId, amount, checkImagePath, status]
    );

    // Update balance if not pending
    if (!isHighValue) {
      await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, accountId]);
    }

    // Save to uploads
    await connection.query(
      'INSERT INTO uploads (user_id, file_path, file_type, related_entity) VALUES (?, ?, ?, ?)',
      [req.user.id, checkImagePath, req.file.mimetype, `transaction_${result.insertId}`]
    );

    await connection.commit();

    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'CHECK_DEPOSIT', `Deposited check of ${amount} to account ${accountId}`, ipAddress);

    res.status(201).json({ message: 'Check deposited successfully', transactionId: result.insertId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
