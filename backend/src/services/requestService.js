const AppError = require('../utils/AppError');
const { StateMachine, CATEGORIES, PRIORITIES, STATES } = require('../domain/stateMachine');
const { requestRepository } = require('../repositories/requestRepository');
const { auditRepository } = require('../repositories/auditRepository');

class RequestService {
  validateRequestPayload(data) {
    if (!data.itemName || typeof data.itemName !== 'string' || !data.itemName.trim()) {
      throw new AppError('VALIDATION_ERROR', 'Item Name is required');
    }
    if (!data.category || !CATEGORIES.includes(data.category)) {
      throw new AppError('VALIDATION_ERROR', `Invalid category. Must be one of: ${CATEGORIES.join(', ')}`);
    }
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new AppError('VALIDATION_ERROR', 'Quantity must be greater than 0');
    }
    const unitPrice = Number(data.unitPrice);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      throw new AppError('VALIDATION_ERROR', 'Estimated Unit Price must be greater than 0');
    }
    if (!data.priority || !PRIORITIES.includes(data.priority)) {
      throw new AppError('VALIDATION_ERROR', `Invalid priority. Must be one of: ${PRIORITIES.join(', ')}`);
    }
    if (!data.businessJustification || !data.businessJustification.trim()) {
      throw new AppError('VALIDATION_ERROR', 'Business Justification is required');
    }
  }

  async createDraft(employee, payload) {
    this.validateRequestPayload(payload);

    const request = await requestRepository.create({
      employeeId: employee.id,
      department: employee.department,
      itemName: payload.itemName.trim(),
      category: payload.category,
      quantity: Number(payload.quantity),
      unitPrice: Number(payload.unitPrice),
      businessJustification: payload.businessJustification.trim(),
      priority: payload.priority,
      status: STATES.DRAFT
    });

    await auditRepository.log({
      requestId: request.id,
      action: 'REQUEST_CREATED',
      performedBy: employee.email,
      comment: 'Created draft purchase request'
    });

    return request;
  }

  async submitRequest(requestId, employee) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    if (request.employeeId !== employee.id) {
      throw new AppError('FORBIDDEN', 'You can only submit your own purchase requests', 403);
    }

    const nextStatus = StateMachine.validateTransition(request.status, 'SUBMIT', request, employee.role);
    const updated = await requestRepository.update(requestId, { status: nextStatus });

    await auditRepository.log({
      requestId: request.id,
      action: 'REQUEST_SUBMITTED',
      performedBy: employee.email,
      comment: 'Submitted purchase request for approval'
    });

    return updated;
  }

  async updateDraft(requestId, employee, payload) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    if (request.employeeId !== employee.id) {
      throw new AppError('FORBIDDEN', 'You can only update your own purchase requests', 403);
    }

    if (request.status !== STATES.DRAFT && request.status !== STATES.REJECTED) {
      throw new AppError('INVALID_STATE_TRANSITION', `Cannot edit request in state ${request.status}`);
    }

    this.validateRequestPayload(payload);

    const updated = await requestRepository.update(requestId, {
      itemName: payload.itemName.trim(),
      category: payload.category,
      quantity: Number(payload.quantity),
      unitPrice: Number(payload.unitPrice),
      businessJustification: payload.businessJustification.trim(),
      priority: payload.priority,
      // If was rejected, editing resets to DRAFT
      status: STATES.DRAFT
    });

    await auditRepository.log({
      requestId: request.id,
      action: 'REQUEST_UPDATED',
      performedBy: employee.email,
      comment: 'Updated purchase request details'
    });

    return updated;
  }

  async cancelRequest(requestId, employee) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    if (request.employeeId !== employee.id) {
      throw new AppError('FORBIDDEN', 'You can only cancel your own purchase requests', 403);
    }

    const nextStatus = StateMachine.validateTransition(request.status, 'CANCEL', request, employee.role);
    const updated = await requestRepository.update(requestId, { status: nextStatus });

    await auditRepository.log({
      requestId: request.id,
      action: 'REQUEST_CANCELLED',
      performedBy: employee.email,
      comment: 'Employee cancelled purchase request'
    });

    return updated;
  }

  async getMyRequests(employeeId) {
    return requestRepository.findByEmployeeId(employeeId);
  }

  async getRequestDetails(requestId) {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }
    return request;
  }

  async getAllRequests() {
    return requestRepository.findAll();
  }
}

const requestService = new RequestService();

module.exports = {
  requestService,
  RequestService
};

