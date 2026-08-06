import pool from '../config/db.js';
import { getAccountById, updateAccountBalance } from '../models/accountModel.js';
import { createTransaction } from '../models/transactionModel.js';

export const executeTransfer = async (userId, transferData) => {
  const { source_account_id, target_account_number, amount, description } = transferData;

  if (amount <= 0) {
    throw { statusCode: 400, message: 'Transfer amount must be greater than zero.' };
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [sourceAccounts] = await connection.query('SELECT * FROM accounts WHERE id = ? FOR UPDATE', [source_account_id]);
    const sourceAccount = sourceAccounts[0];

    if (!sourceAccount) throw { statusCode: 404, message: 'Source account not found.' };
    if (sourceAccount.user_id !== userId) throw { statusCode: 403, message: 'Not authorized for this account.' };
    if (sourceAccount.status !== 'active') throw { statusCode: 400, message: 'Source account is blocked.' };
    if (Number(sourceAccount.balance) < Number(amount)) throw { statusCode: 400, message: 'Insufficient funds.' };

    const [targetAccounts] = await connection.query('SELECT * FROM accounts WHERE account_number = ? FOR UPDATE', [target_account_number]);
    const targetAccount = targetAccounts[0];

    if (!targetAccount) throw { statusCode: 404, message: 'Recipient account not found. Please check the account number.' };
    if (targetAccount.status !== 'active') throw { statusCode: 400, message: 'Target account is blocked.' };
    
    // Ensure they are not the same account
    if (sourceAccount.id === targetAccount.id) {
      throw { statusCode: 400, message: 'Source and target accounts must be different.' };
    }

    if (sourceAccount.currency !== targetAccount.currency) {
      throw { statusCode: 400, message: 'Cross-currency transfers are not supported yet.' };
    }

    // Determine status - if amount is very large, could be pending for manager approval, but we'll assume completed for simplicity, or we can set > 50000 as pending
    const status = amount > 50000 ? 'pending' : 'completed';
    const target_account_id = targetAccount.id;

    // If completed, update balances now. If pending, wait for manager.
    if (status === 'completed') {
      // Deduct from source
      await updateAccountBalance(connection, source_account_id, -amount);
      // Add to target
      await updateAccountBalance(connection, target_account_id, amount);
    }

    // Create transactions
    await createTransaction(connection, {
      account_id: source_account_id,
      type: 'transfer',
      amount: -amount,
      related_account_id: target_account_id,
      description: description || 'Outgoing Transfer',
      status
    });

    await createTransaction(connection, {
      account_id: target_account_id,
      type: 'transfer',
      amount: amount,
      related_account_id: source_account_id,
      description: description || 'Incoming Transfer',
      status
    });

    await connection.commit();
    return { status, message: 'Transfer executed successfully.' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
