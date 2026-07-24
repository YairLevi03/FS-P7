import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadCheck } from '../middleware/uploadMiddleware.js';
import * as transactionController from '../controllers/transactionController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', transactionController.getTransactions);
router.post('/deposit-check', uploadCheck.single('checkImage'), transactionController.depositCheck);

export default router;
