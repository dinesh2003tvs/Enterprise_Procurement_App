const { prisma } = require('../config/prisma');
const { dbStore } = require('../config/db');

class PaymentRepository {
  async create(data) {
    const id = data.id || `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      const payment = await prisma.payment.create({
        data: {
          id,
          requestId: data.requestId,
          method: data.method,
          transactionId: data.transactionId,
          idempotencyKey: data.idempotencyKey,
          status: data.status || 'SUCCESS',
          amount: Number(data.amount)
        }
      });
      // Also link to purchase request
      try {
        await prisma.purchaseRequest.update({
          where: { id: data.requestId },
          data: {
            paymentId: payment.id
          }
        });
      } catch (e) {
        // ignore if already linked
      }
      return payment;
    } catch (err) {
      console.warn('[PaymentRepository.create] DB fallback:', err.message);
      const payment = {
        id,
        requestId: data.requestId,
        method: data.method,
        transactionId: data.transactionId,
        idempotencyKey: data.idempotencyKey,
        status: data.status || 'SUCCESS',
        amount: Number(data.amount),
        createdAt: new Date()
      };
      dbStore.payments.push(payment);
      return payment;
    }
  }

  async findByIdempotencyKey(key) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { idempotencyKey: key }
      });
      if (payment) return payment;
    } catch (err) {
      console.warn('[PaymentRepository.findByIdempotencyKey] DB fallback:', err.message);
    }
    return dbStore.payments.find(p => p.idempotencyKey === key) || null;
  }

  async findByRequestId(requestId) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { requestId }
      });
      if (payment) return payment;
    } catch (err) {
      console.warn('[PaymentRepository.findByRequestId] DB fallback:', err.message);
    }
    return dbStore.payments.find(p => p.requestId === requestId) || null;
  }
}

const paymentRepository = new PaymentRepository();

module.exports = {
  paymentRepository,
  PaymentRepository
};
