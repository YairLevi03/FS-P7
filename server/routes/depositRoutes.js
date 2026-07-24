import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as depositController from '../controllers/depositController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/my-deposits', depositController.getUserDeposits);
router.post('/open', depositController.openDeposit);
router.patch('/:id/break', depositController.breakDeposit);

export default router;
