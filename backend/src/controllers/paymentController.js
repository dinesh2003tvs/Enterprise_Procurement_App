const { paymentService } = require('../services/paymentService');

class PaymentController {
  async processPayment(req, res, next) {
    try {
      const { paymentMethod, idempotencyKey } = req.body;
      const result = await paymentService.processPayment(req.params.id, req.user, {
        paymentMethod: paymentMethod || 'BANK_TRANSFER',
        idempotencyKey
      });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

const paymentController = new PaymentController();

module.exports = {
  paymentController,
  PaymentController
};

