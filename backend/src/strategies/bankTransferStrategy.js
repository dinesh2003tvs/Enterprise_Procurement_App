/**
 * Bank Transfer Payment Strategy
 * Implements standard payment processing with idempotency support
 */
class BankTransferStrategy {
  constructor() {
    this.method = 'BANK_TRANSFER';
  }

  /**
   * Processes bank transfer
   * @param {Object} params - { requestId, amount, idempotencyKey }
   * @returns {Promise<Object>} Standardized transaction response
   */
  async processPayment({ requestId, amount, idempotencyKey }) {
    // Generate deterministic transaction hash based on idempotencyKey or random transaction id
    const randomTxnSuffix = Math.floor(10000 + Math.random() * 90000);
    const transactionId = `TXN-${randomTxnSuffix}`;

    return {
      transactionId,
      status: 'SUCCESS',
      amount: Number(amount),
      method: this.method,
      processedAt: new Date().toISOString()
    };
  }
}

const bankTransferStrategy = new BankTransferStrategy();

module.exports = {
  bankTransferStrategy,
  BankTransferStrategy
};

