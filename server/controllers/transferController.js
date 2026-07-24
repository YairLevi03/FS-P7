import * as transferService from '../services/transferService.js';

export const doTransfer = async (req, res, next) => {
  try {
    const result = await transferService.executeTransfer(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
