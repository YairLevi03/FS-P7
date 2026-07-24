import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';
import * as loanController from '../controllers/loanController.js';

const router = express.Router();

router.use(authenticateToken);

// Customer routes
router.get('/my-loans', loanController.getUserLoans);
router.post('/request', loanController.requestLoan);

// Manager routes
router.get('/pending', checkRole(['manager']), loanController.getPendingLoans);
router.patch('/:id/approve', checkRole(['manager']), loanController.approveLoan);
router.patch('/:id/reject', checkRole(['manager']), loanController.rejectLoan);

export default router;
