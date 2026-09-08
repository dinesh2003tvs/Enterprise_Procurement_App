const { dbStore } = require('../config/db');

class PaymentRepository {
  async create(data) {
    const payment = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId: data.requestId,
      method: data.method,
      transactionId: data.transactionId,
      idempotencyKey: data.idempotencyKey,
      status: data.status || 'SUCCESS',
      amount: data.amount,
      createdAt: new Date()
    };
    dbStore.payments.push(payment);
    return payment;
  }

  async findByIdempotencyKey(key) {
    return dbStore.payments.find(p => p.idempotencyKey === key) || null;
  }

  async findByRequestId(requestId) {
    return dbStore.payments.find(p => p.requestId === requestId) || null;
  }
}

const paymentRepository = new PaymentRepository();

module.exports = {
  paymentRepository,
  PaymentRepository
};
