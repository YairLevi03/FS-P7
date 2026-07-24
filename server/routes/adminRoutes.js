import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(authenticateToken);
router.use(checkRole(['manager']));

router.get('/customers', adminController.getCustomers);
router.patch('/customers/:id/lock', adminController.lockUser);
router.patch('/customers/:id/unlock', adminController.unlockUser);
router.get('/accounts', adminController.getAccounts);
router.put('/accounts/:id/status', adminController.updateAccountStatus);
router.get('/transactions/pending', adminController.getPendingTransactions);
router.put('/transactions/:id/approve', adminController.approveTransaction);
router.get('/reports', adminController.getReports);
router.get('/security-alerts', adminController.getSecurityAlerts);

export default router;
