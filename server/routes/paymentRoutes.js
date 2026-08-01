import express from 'express';
import { body } from 'express-validator';
import * as paymentController from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/payments', [
  body('account_id').isInt().withMessage('Account ID is required'),
  body('payee_name').notEmpty().withMessage('Payee is required'),
  body('amount').isNumeric().withMessage('Amount is required')
], validateRequest, paymentController.doPayment);

router.get('/standing-orders', paymentController.getStandingOrders);

router.post('/standing-orders', [
  body('source_account_id').isInt().withMessage('Source account is required'),
  body('target_account_number').notEmpty().withMessage('Target account number is required'),
  body('amount').isNumeric().withMessage('Amount is required'),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']),
  body('next_run_date').notEmpty(),
  body('end_date').optional({ nullable: true }).isDate()
], validateRequest, paymentController.createStandingOrder);

router.put('/standing-orders/:id', paymentController.updateStandingOrder);
router.delete('/standing-orders/:id', paymentController.deleteStandingOrder);

export default router;
