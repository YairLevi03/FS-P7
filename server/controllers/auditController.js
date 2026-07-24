import * as auditModel from '../models/auditModel.js';

export const getSystemAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditModel.getAuditLogs(100);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
