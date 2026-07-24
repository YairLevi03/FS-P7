import * as auditModel from '../models/auditModel.js';

export const logAction = async (user_id, action_type, description, ip_address) => {
  try {
    await auditModel.createAuditLog({ user_id, action_type, description, ip_address });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
