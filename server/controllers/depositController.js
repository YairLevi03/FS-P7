import * as depositModel from '../models/depositModel.js';
import * as auditService from '../services/auditService.js';

export const getUserDeposits = async (req, res, next) => {
  try {
    const deposits = await depositModel.getDepositsByUserId(req.user.id);
    res.json(deposits);
  } catch (error) {
    next(error);
  }
};

export const openDeposit = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { amount, termMonths, accountId } = req.body;
    if (!accountId) throw { statusCode: 400, message: 'Funding account is required.' };

    const interestRate = termMonths >= 12 ? 4.0 : 2.5;
    
    // Check balance
    const [accounts] = await connection.query('SELECT balance, status FROM accounts WHERE id = ? AND user_id = ? FOR UPDATE', [accountId, req.user.id]);
    if (accounts.length === 0) throw { statusCode: 404, message: 'Account not found.' };
    if (accounts[0].status !== 'active') throw { statusCode: 403, message: 'Cannot fund from a non-active account.' };
    if (accounts[0].balance < amount) throw { statusCode: 400, message: 'Insufficient funds in the selected account.' };

    const isHighValue = amount > 50000;
    
    if (isHighValue) {
      // Create pending transaction, DO NOT deduct, DO NOT create deposit yet.
      // We store termMonths in related_account_id so adminService can read it.
      await connection.query(
        'INSERT INTO transactions (account_id, type, amount, related_account_id, description, status) VALUES (?, "deposit_opening", ?, ?, "High value deposit pending approval", "pending")',
        [accountId, -amount, termMonths]
      );
      await connection.commit();
      return res.status(202).json({ message: 'High value deposit requires manager approval.' });
    }

    // Normal flow: <= 50,000
    // Deduct balance
    await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, accountId]);
    
    // Create transaction history
    const [transResult] = await connection.query(
      'INSERT INTO transactions (account_id, type, amount, description, status) VALUES (?, "deposit_opening", ?, "Savings deposit opened", "completed")',
      [accountId, -amount]
    );

    // Create the actual deposit
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(termMonths, 10));
    const formattedMaturityDate = maturityDate.toISOString().split('T')[0];
    
    const [depResult] = await connection.query(
      'INSERT INTO deposits (user_id, amount, interest_rate, maturity_date) VALUES (?, ?, ?, ?)',
      [req.user.id, amount, interestRate, formattedMaturityDate]
    );
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'DEPOSIT_OPENED', `Opened savings deposit of ${amount} for ${termMonths} months`, ipAddress);

    await connection.commit();
    res.status(201).json({ message: 'Savings deposit opened successfully', depositId: depResult.insertId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const breakDeposit = async (req, res, next) => {
  try {
    const { id } = req.params;
    await depositModel.breakDeposit(id);
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'DEPOSIT_BROKEN', `Broke savings deposit ID ${id}`, ipAddress);

    res.json({ message: 'Deposit broken successfully. Funds have been returned to checking.' });
  } catch (error) {
    next(error);
  }
};
