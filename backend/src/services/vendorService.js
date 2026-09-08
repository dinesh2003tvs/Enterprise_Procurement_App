const AppError = require('../utils/AppError');
const { StateMachine, STATES } = require('../domain/stateMachine');
const { requestRepository } = require('../repositories/requestRepository');
const { auditRepository } = require('../repositories/auditRepository');
const { techSourceAdapter } = require('../adapters/techSourceAdapter');

class VendorService {
  async getPendingProcurement() {
    return requestRepository.findByStatus([STATES.FINANCE_APPROVED, STATES.PROCUREMENT_STARTED]);
  }

  async selectVendor(requestId, user, vendorCode = 'TECHSOURCE') {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    const nextStatus = StateMachine.validateTransition(
      request.status,
      'SELECT_VENDOR',
      request,
      user.role
    );

    // Call TechSource Adapter to retrieve quotation
    const quote = await techSourceAdapter.getQuote(request);

    const updated = await requestRepository.update(requestId, {
      status: nextStatus,
      selectedVendorId: 'ven-techsource-1',
      selectedVendorName: quote.vendor,
      vendorQuote: quote
    });

    await auditRepository.log({
      requestId,
      action: 'VENDOR_SELECTED',
      performedBy: user.email,
      comment: `Selected vendor: ${quote.vendor} (Quote: ${quote.quoteId})`
    });

    await auditRepository.log({
      requestId,
      action: 'PROCUREMENT_STARTED',
      performedBy: user.email,
      comment: 'Procurement officially initiated'
    });

    return {
      request: updated,
      quote
    };
  }
}

const vendorService = new VendorService();

module.exports = {
  vendorService,
  VendorService
};

