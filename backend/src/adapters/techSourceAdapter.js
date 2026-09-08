/**
 * TechSource Vendor Adapter (implements VendorAdapter interface)
 * Converts internal procurement requests to TechSource-specific API format
 * TechSource format: { productCode: string, units: number }
 */
class TechSourceAdapter {
  constructor() {
    this.vendorCode = 'TECHSOURCE';
    this.vendorName = 'TechSource Inc.';
  }

  /**
   * Request a quotation from TechSource
   * @param {Object} request - Internal request object
   * @returns {Promise<Object>} Standardized quotation response
   */
  async getQuote(request) {
    // Translate domain request to external vendor payload
    const vendorPayload = {
      productCode: request.itemName.toUpperCase().replace(/\s+/g, '-'),
      units: Number(request.quantity)
    };

    // Simulate TechSource pricing calculation (e.g. slight discount or standard unit price)
    const unitPrice = Number(request.unitPrice);
    const totalPrice = unitPrice * Number(request.quantity);

    return {
      vendor: this.vendorName,
      vendorCode: this.vendorCode,
      quoteId: `TS-QUOTE-${Math.floor(1000 + Math.random() * 9000)}`,
      productCode: vendorPayload.productCode,
      units: vendorPayload.units,
      totalPrice: totalPrice,
      deliveryDays: 5,
      status: 'AVAILABLE'
    };
  }

  /**
   * Dispatches purchase order to TechSource
   */
  async placeOrder(request, quoteId) {
    return {
      orderId: `TS-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      quoteId: quoteId || `TS-QUOTE-DEFAULT`,
      vendor: this.vendorName,
      status: 'DISPATCHED',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

const techSourceAdapter = new TechSourceAdapter();

module.exports = {
  techSourceAdapter,
  TechSourceAdapter
};
