import * as paymentService from '../services/paymentService.js';
import * as standingOrderService from '../services/standingOrderService.js';

export const doPayment = async (req, res, next) => {
  try {
    const result = await paymentService.executePayment(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStandingOrders = async (req, res, next) => {
  try {
    const orders = await standingOrderService.getUserStandingOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const createStandingOrder = async (req, res, next) => {
  try {
    const resultId = await standingOrderService.createNewStandingOrder(req.user.id, req.body);
    res.status(201).json({ message: 'Standing order created', id: resultId });
  } catch (error) {
    next(error);
  }
};

export const updateStandingOrder = async (req, res, next) => {
  try {
    await standingOrderService.editStandingOrder(req.user.id, req.params.id, req.body);
    res.json({ message: 'Standing order updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteStandingOrder = async (req, res, next) => {
  try {
    await standingOrderService.removeStandingOrder(req.user.id, req.params.id);
    res.json({ message: 'Standing order deleted' });
  } catch (error) {
    next(error);
  }
};
