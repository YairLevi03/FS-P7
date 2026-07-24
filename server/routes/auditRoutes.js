import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';
import * as auditController from '../controllers/auditController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkRole(['manager']), auditController.getSystemAuditLogs);

export default router;
