import express from 'express';
import * as accountController from '../controllers/accountController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // Protect all account routes

router.get('/', accountController.getMyAccounts);
router.get('/:id', accountController.getAccountDetails);
router.get('/:id/transactions', accountController.getAccountTransactions);

export default router;
