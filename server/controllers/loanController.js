import * as loanModel from '../models/loanModel.js';
import * as auditService from '../services/auditService.js';

export const getUserLoans = async (req, res, next) => {
  try {
    const loans = await loanModel.getLoansByUserId(req.user.id);
    res.json(loans);
  } catch (error) {
    next(error);
  }
};

export const getPendingLoans = async (req, res, next) => {
  try {
    const loans = await loanModel.getAllPendingLoans();
    res.json(loans);
  } catch (error) {
    next(error);
  }
};

export const requestLoan = async (req, res, next) => {
  try {
    const { amount, termMonths, purpose } = req.body;
    // Simple interest rate calculation based on term
    const interestRate = termMonths > 36 ? 5.5 : 3.5;
    
    const loanId = await loanModel.createLoan(req.user.id, amount, interestRate, termMonths, purpose);
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'LOAN_REQUESTED', `Requested loan of ${amount} for ${termMonths} months`, ipAddress);

    res.status(201).json({ message: 'Loan request submitted successfully', loanId });
  } catch (error) {
    next(error);
  }
};

export const approveLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    await loanModel.updateLoanStatus(id, 'approved');
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'LOAN_APPROVED', `Manager approved loan ID ${id}`, ipAddress);

    res.json({ message: 'Loan approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const rejectLoan = async (req, res, next) => {
  try {
    const { id } = req.params;
    await loanModel.updateLoanStatus(id, 'rejected');
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'LOAN_REJECTED', `Manager rejected loan ID ${id}`, ipAddress);

    res.json({ message: 'Loan rejected successfully' });
  } catch (error) {
    next(error);
  }
};
