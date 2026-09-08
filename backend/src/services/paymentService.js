const AppError = require('../utils/AppError');
const { StateMachine, STATES } = require('../domain/stateMachine');
const { requestRepository } = require('../repositories/requestRepository');
const { paymentRepository } = require('../repositories/paymentRepository');
const { auditRepository } = require('../repositories/auditRepository');
const { bankTransferStrategy } = require('../strategies/bankTransferStrategy');

class PaymentService {
  async processPayment(requestId, user, { paymentMethod = 'BANK_TRANSFER', idempotencyKey }) {
    const key = idempotencyKey || `PROCUREMENT-${requestId}`;

    // 1. Idempotency Check: if already processed with this key, return existing transaction
    const existingPayment = await paymentRepository.findByIdempotencyKey(key);
    if (existingPayment) {
      return {
        success: true,
        idempotentReplay: true,
        message: 'Existing transaction returned. No duplicate payment processed.',
        transaction: existingPayment
      };
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    // Must be in PROCUREMENT_STARTED or PAYMENT_FAILED to initiate payment
    StateMachine.validateTransition(
      request.status,
      'INITIATE_PAYMENT',
      request,
      user.role
    );

    // Transition to PAYMENT_PENDING
    await requestRepository.update(requestId, { status: STATES.PAYMENT_PENDING });
    await auditRepository.log({
      requestId,
      action: 'PAYMENT_STARTED',
      performedBy: user.email,
      comment: `Initiated payment of ₹${request.totalAmount} via ${paymentMethod}`
    });

    // Execute Payment Strategy (Bank Transfer)
    const paymentResult = await bankTransferStrategy.processPayment({
      requestId,
      amount: request.totalAmount,
      idempotencyKey: key
    });

    if (paymentResult.status !== 'SUCCESS') {
      await requestRepository.update(requestId, {
        status: STATES.PAYMENT_FAILED,
        paymentStatus: 'FAILED'
      });
      await auditRepository.log({
        requestId,
        action: 'PAYMENT_FAILED',
        performedBy: user.email,
        comment: 'Payment gateway rejected transaction'
      });
      throw new AppError('PAYMENT_FAILED', 'Payment execution failed', 500);
    }

    // Save Payment Record
    const savedPayment = await paymentRepository.create({
      requestId,
      method: paymentMethod,
      transactionId: paymentResult.transactionId,
      idempotencyKey: key,
      status: 'SUCCESS',
      amount: request.totalAmount
    });

    // Complete Request
    const completedRequest = await requestRepository.update(requestId, {
      status: STATES.COMPLETED,
      paymentId: savedPayment.id,
      paymentStatus: 'PAID'
    });

    await auditRepository.log({
      requestId,
      action: 'PAYMENT_COMPLETED',
      performedBy: user.email,
      comment: `Payment successful. Txn ID: ${savedPayment.transactionId}`
    });

    await auditRepository.log({
      requestId,
      action: 'REQUEST_COMPLETED',
      performedBy: user.email,
      comment: 'Procurement and payment finalized. Request is COMPLETED.'
    });

    return {
      success: true,
      idempotentReplay: false,
      message: 'Payment processed successfully',
      transaction: savedPayment,
      request: completedRequest
    };
  }
}

const paymentService = new PaymentService();

module.exports = {
  paymentService,
  PaymentService
};
