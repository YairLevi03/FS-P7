import express from 'express';
import { body } from 'express-validator';
import * as transferController from '../controllers/transferController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', [
  body('source_account_id').isInt().withMessage('Source account is required'),
  body('target_account_id').isInt().withMessage('Target account is required'),
  body('amount').isNumeric().withMessage('Valid amount is required')
], validateRequest, transferController.doTransfer);

export default router;
