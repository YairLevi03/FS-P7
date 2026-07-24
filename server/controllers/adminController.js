import * as adminService from '../services/adminService.js';

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await adminService.getCustomersForManager(req.user.branch_id);
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const lockUser = async (req, res, next) => {
  try {
    await adminService.toggleUserLockStatus(req.params.id, 'locked', req.user.id, req.ip);
    res.json({ message: 'User locked successfully' });
  } catch (error) {
    next(error);
  }
};

export const unlockUser = async (req, res, next) => {
  try {
    await adminService.toggleUserLockStatus(req.params.id, 'active', req.user.id, req.ip);
    res.json({ message: 'User unlocked successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await adminService.getAccountsForManager();
    res.json(accounts);
  } catch (error) {
    next(error);
  }
};

export const updateAccountStatus = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await adminService.changeAccountStatus(req.params.id, req.body.status, req.user.id, ipAddress);
    res.json({ message: 'Account status updated' });
  } catch (error) {
    next(error);
  }
};

export const getPendingTransactions = async (req, res, next) => {
  try {
    const transactions = await adminService.getPendingActions();
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const approveTransaction = async (req, res, next) => {
  try {
    await adminService.resolveTransaction(req.params.id, req.body.decision);
    res.json({ message: `Transaction ${req.body.decision}` });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getSystemReports();
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

export const getSecurityAlerts = async (req, res, next) => {
  try {
    const alerts = await adminService.getRecentSecurityAlerts();
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};
