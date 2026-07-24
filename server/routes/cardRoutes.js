import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as cardController from '../controllers/cardController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', cardController.getUserCards);
router.post('/request', cardController.requestNewCard);
router.patch('/:id/status', cardController.toggleCardStatus);
router.patch('/:id/limit', cardController.updateLimit);

export default router;
