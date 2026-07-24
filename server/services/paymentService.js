import pool from '../config/db.js';
import { updateAccountBalance } from '../models/accountModel.js';
import { createTransaction } from '../models/transactionModel.js';
import { createPayment } from '../models/paymentModel.js';

export const executePayment = async (userId, paymentData) => {
  const { account_id, payee_name, category, amount } = paymentData;

  if (amount <= 0) {
    throw { statusCode: 400, message: 'Payment amount must be greater than zero.' };
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [accounts] = await connection.query('SELECT * FROM accounts WHERE id = ? FOR UPDATE', [account_id]);
    const account = accounts[0];

    if (!account) throw { statusCode: 404, message: 'Account not found.' };
    if (account.user_id !== userId) throw { statusCode: 403, message: 'Not authorized for this account.' };
    if (account.status !== 'active') throw { statusCode: 400, message: 'Account is blocked.' };
    if (Number(account.balance) < Number(amount)) throw { statusCode: 400, message: 'Insufficient funds.' };

    const status = amount > 50000 ? 'pending' : 'completed';

    // Deduct from account
    await updateAccountBalance(connection, account_id, -amount);

    // Record Payment
    await createPayment(connection, {
      account_id,
      payee_name,
      category,
      amount,
      status
    });

    // Create transaction log
    await createTransaction(connection, {
      account_id,
      type: 'payment',
      amount: -amount,
      related_account_id: null,
      description: `Payment to ${payee_name}`,
      status
    });

    await connection.commit();
    return { status, message: 'Payment executed successfully.' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
