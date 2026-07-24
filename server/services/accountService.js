import { getAccountsByUserId, getAccountById } from '../models/accountModel.js';
import { getTransactionsByAccountId } from '../models/transactionModel.js';

export const getUserAccounts = async (userId) => {
  return await getAccountsByUserId(userId);
};

export const getAccountDetails = async (accountId, userId, role) => {
  const account = await getAccountById(accountId);
  
  if (!account) {
    throw { statusCode: 404, message: 'Account not found.' };
  }

  // Security check: only owner or manager can access
  if (account.user_id !== userId && role !== 'manager') {
    throw { statusCode: 403, message: 'Access denied.' };
  }

  return account;
};

export const getAccountTransactions = async (accountId, userId, role, filters) => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw { statusCode: 404, message: 'Account not found.' };
  }

  if (account.user_id !== userId && role !== 'manager') {
    throw { statusCode: 403, message: 'Access denied.' };
  }

  return await getTransactionsByAccountId(accountId, filters);
};
