import * as accountService from '../services/accountService.js';

export const getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getUserAccounts(req.user.id);
    res.json(accounts);
  } catch (error) {
    next(error);
  }
};

export const getAccountDetails = async (req, res, next) => {
  try {
    const account = await accountService.getAccountDetails(req.params.id, req.user.id, req.user.role);
    res.json(account);
  } catch (error) {
    next(error);
  }
};

export const getAccountTransactions = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      from: req.query.from,
      to: req.query.to,
      minAmount: req.query.minAmount,
      maxAmount: req.query.maxAmount
    };
    const transactions = await accountService.getAccountTransactions(req.params.id, req.user.id, req.user.role, filters);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};
