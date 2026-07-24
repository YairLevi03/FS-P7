import * as depositModel from '../models/depositModel.js';
import * as auditService from '../services/auditService.js';

export const getUserDeposits = async (req, res, next) => {
  try {
    const deposits = await depositModel.getDepositsByUserId(req.user.id);
    res.json(deposits);
  } catch (error) {
    next(error);
  }
};

export const openDeposit = async (req, res, next) => {
  try {
    const { amount, termMonths } = req.body;
    const interestRate = termMonths >= 12 ? 4.0 : 2.5;
    
    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(termMonths, 10));
    const formattedMaturityDate = maturityDate.toISOString().split('T')[0];
    
    const depositId = await depositModel.createDeposit(req.user.id, amount, interestRate, formattedMaturityDate);
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'DEPOSIT_OPENED', `Opened savings deposit of ${amount} for ${termMonths} months`, ipAddress);

    res.status(201).json({ message: 'Savings deposit opened successfully', depositId });
  } catch (error) {
    next(error);
  }
};

export const breakDeposit = async (req, res, next) => {
  try {
    const { id } = req.params;
    await depositModel.breakDeposit(id);
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'DEPOSIT_BROKEN', `Broke savings deposit ID ${id}`, ipAddress);

    res.json({ message: 'Deposit broken successfully. Funds have been returned to checking.' });
  } catch (error) {
    next(error);
  }
};
