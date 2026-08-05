import { getAllCustomers, updateUserProfile } from '../models/userModel.js';
import { getAllAccounts, updateAccountStatus, getAccountById } from '../models/accountModel.js';
import { getPendingTransactions, updateTransactionStatus } from '../models/transactionModel.js';
import pool from '../config/db.js';
import * as userModel from '../models/userModel.js';
import * as auditService from './auditService.js';

export const getCustomersForManager = async (managerBranchId) => {
  return await getAllCustomers(managerBranchId);
};

export const toggleUserLockStatus = async (userId, newStatus, managerId, ipAddress) => {
  if (newStatus === 'locked') {
    await userModel.lockUser(userId);
    await auditService.logAction(managerId, 'MANAGER_LOCKED_USER', `Locked user ID ${userId}`, ipAddress);
  } else {
    await userModel.unlockUser(userId);
    await auditService.logAction(managerId, 'MANAGER_UNLOCKED_USER', `Unlocked user ID ${userId}`, ipAddress);
  }
};

export const getAccountsForManager = async () => {
  return await getAllAccounts();
};

export const changeAccountStatus = async (accountId, status, adminUserId, ipAddress) => {
  if (!['active', 'frozen', 'closed'].includes(status)) {
    throw { statusCode: 400, message: 'Invalid status.' };
  }
  await updateAccountStatus(accountId, status);

  const account = await getAccountById(accountId);
  const accountNum = account ? account.account_number : accountId;

  await auditService.logAction(
    adminUserId,
    `ACCOUNT_${status.toUpperCase()}`,
    `Manager changed account #${accountNum} status to ${status}`,
    ipAddress
  );
};

export const getPendingActions = async () => {
  return await getPendingTransactions();
};

export const resolveTransaction = async (transactionId, decision) => {
  if (!['completed', 'rejected'].includes(decision)) {
    throw { statusCode: 400, message: 'Invalid decision.' };
  }
  
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [transactions] = await connection.query('SELECT * FROM transactions WHERE id = ? FOR UPDATE', [transactionId]);
    const transaction = transactions[0];

    if (!transaction || transaction.status !== 'pending') {
      throw { statusCode: 400, message: 'Transaction not found or not pending.' };
    }

    // If approved, it was already deducted? In our simplified logic, pending transactions deduct money initially, 
    // but if rejected, we should refund.
    if (decision === 'rejected') {
      // Refund the source account
      if (transaction.type === 'transfer' && transaction.amount < 0) {
        await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [Math.abs(transaction.amount), transaction.account_id]);
        
        // Also update the related incoming transaction to rejected
        await connection.query('UPDATE transactions SET status = "rejected" WHERE related_account_id = ? AND account_id = ? AND status = "pending"', [transaction.account_id, transaction.related_account_id]);
        // Also deduct from target since it wasn't supposed to get it
        if(transaction.related_account_id) {
           await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [Math.abs(transaction.amount), transaction.related_account_id]);
        }
      }
      // similar logic for payments...
    }

    // If decision is completed, also mark the related transaction as completed
    if (decision === 'completed') {
      if (transaction.type === 'transfer' && transaction.amount < 0) {
        await connection.query('UPDATE transactions SET status = "completed" WHERE related_account_id = ? AND account_id = ? AND status = "pending"', [transaction.account_id, transaction.related_account_id]);
      }
    }

    await connection.query('UPDATE transactions SET status = ? WHERE id = ?', [decision, transactionId]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getSystemReports = async () => {
  const [stats] = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
      (SELECT COUNT(*) FROM accounts) as total_accounts,
      (SELECT SUM(balance) FROM accounts) as total_balance,
      (SELECT COUNT(*) FROM transactions) as total_transactions
  `);
  return stats[0];
};

export const getRecentSecurityAlerts = async () => {
  const [rows] = await pool.query(`
    SELECT a.*, u.username 
    FROM audit_logs a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.action_type = 'USER_LOCKED'
    ORDER BY a.created_at DESC 
    LIMIT 20
  `);
  return rows;
};
