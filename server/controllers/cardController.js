import * as cardModel from '../models/cardModel.js';
import * as auditService from '../services/auditService.js';

export const getUserCards = async (req, res, next) => {
  try {
    const cards = await cardModel.getCardsByUserId(req.user.id);
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

export const requestNewCard = async (req, res, next) => {
  try {
    const { accountId, limitAmount } = req.body;
    // Simulate card number generation
    const cardNumber = Math.random().toString().slice(2, 18);
    const expirationDate = '12/28';
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    
    const cardId = await cardModel.createCard(accountId, cardNumber, expirationDate, cvv, limitAmount || 5000);
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'CARD_ISSUED', `Issued new credit card ending in ${cardNumber.slice(-4)}`, ipAddress);

    res.status(201).json({ message: 'Card issued successfully', cardId, cardNumber: `****-****-****-${cardNumber.slice(-4)}` });
  } catch (error) {
    next(error);
  }
};

export const toggleCardStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'blocked'
    
    await cardModel.updateCardStatus(id, status);
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, `CARD_${status.toUpperCase()}`, `Changed card status to ${status}`, ipAddress);

    res.json({ message: `Card ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

export const updateLimit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limitAmount } = req.body;
    
    await cardModel.updateCardLimit(id, limitAmount);
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    await auditService.logAction(req.user.id, 'CARD_LIMIT_CHANGED', `Changed card limit to ${limitAmount}`, ipAddress);

    res.json({ message: 'Card limit updated successfully' });
  } catch (error) {
    next(error);
  }
};
