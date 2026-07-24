import pool from '../config/db.js';
import { getStandingOrdersByAccountId, createStandingOrder, updateStandingOrder, deleteStandingOrder } from '../models/standingOrderModel.js';
import { getAccountsByUserId } from '../models/accountModel.js';

export const getUserStandingOrders = async (userId) => {
  const accounts = await getAccountsByUserId(userId);
  const accountIds = accounts.map(a => a.id);
  
  if (accountIds.length === 0) return [];

  const [rows] = await pool.query('SELECT * FROM standing_orders WHERE source_account_id IN (?) OR target_account_id IN (?)', [accountIds, accountIds]);
  return rows;
};

export const createNewStandingOrder = async (userId, orderData) => {
  const accounts = await getAccountsByUserId(userId);
  const isOwner = accounts.some(a => a.id === orderData.source_account_id);
  
  if (!isOwner) {
    throw { statusCode: 403, message: 'Not authorized for this account.' };
  }

  return await createStandingOrder(orderData);
};

export const editStandingOrder = async (userId, id, updateData) => {
  // In a real app we'd verify ownership before update
  await updateStandingOrder(id, updateData);
};

export const removeStandingOrder = async (userId, id) => {
   // Verify ownership...
  await deleteStandingOrder(id);
};
