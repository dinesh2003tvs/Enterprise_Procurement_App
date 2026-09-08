const AppError = require('../utils/AppError');

const STATES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  MANAGER_APPROVED: 'MANAGER_APPROVED',
  SENIOR_MANAGER_APPROVED: 'SENIOR_MANAGER_APPROVED',
  FINANCE_APPROVED: 'FINANCE_APPROVED',
  PROCUREMENT_STARTED: 'PROCUREMENT_STARTED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED'
};

const CATEGORIES = [
  'IT_EQUIPMENT',
  'SOFTWARE',
  'OFFICE_SUPPLIES',
  'TRAVEL',
  'TRAINING',
  'OTHER'
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

class StateMachine {
  /**
   * Evaluates if a state transition is valid based on current state, target action, request attributes, and user role.
   */
  static validateTransition(currentStatus, action, request, userRole) {
    switch (action) {
      case 'SUBMIT':
        if (currentStatus !== STATES.DRAFT && currentStatus !== STATES.REJECTED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Request in state ${currentStatus} cannot be submitted`);
        }
        return STATES.SUBMITTED;

      case 'CANCEL':
        if (currentStatus !== STATES.DRAFT && currentStatus !== STATES.SUBMITTED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cancellation is not allowed for request in state ${currentStatus}`);
        }
        return STATES.CANCELLED;

      case 'MANAGER_APPROVE':
        if (currentStatus !== STATES.SUBMITTED && currentStatus !== STATES.SENIOR_MANAGER_APPROVED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot manager-approve request in state ${currentStatus}`);
        }
        // Emergency Flow Rule: CRITICAL priority and <= 50,000 INR skips finance approval directly to procurement
        if (request.priority === 'CRITICAL' && request.totalAmount <= 50000) {
          return STATES.PROCUREMENT_STARTED;
        }
        // All manager-approved requests move directly to Finance queue
        return STATES.MANAGER_APPROVED;

      case 'SENIOR_MANAGER_APPROVE':
        if (currentStatus !== STATES.SENIOR_MANAGER_APPROVED && currentStatus !== STATES.SUBMITTED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot senior-manager approve request in state ${currentStatus}`);
        }
        return STATES.MANAGER_APPROVED;

      case 'MANAGER_REJECT':
      case 'SENIOR_MANAGER_REJECT':
      case 'FINANCE_REJECT':
        if (
          currentStatus !== STATES.SUBMITTED &&
          currentStatus !== STATES.SENIOR_MANAGER_APPROVED &&
          currentStatus !== STATES.MANAGER_APPROVED
        ) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot reject request in state ${currentStatus}`);
        }
        return STATES.REJECTED;

      case 'FINANCE_APPROVE':
        if (currentStatus !== STATES.MANAGER_APPROVED && currentStatus !== STATES.SENIOR_MANAGER_APPROVED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot finance-approve request in state ${currentStatus}`);
        }
        return STATES.FINANCE_APPROVED;

      case 'START_PROCUREMENT':
      case 'SELECT_VENDOR':
        if (currentStatus !== STATES.FINANCE_APPROVED && currentStatus !== STATES.PROCUREMENT_STARTED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot start procurement for request in state ${currentStatus}`);
        }
        return STATES.PROCUREMENT_STARTED;

      case 'INITIATE_PAYMENT':
        if (currentStatus !== STATES.PROCUREMENT_STARTED && currentStatus !== STATES.PAYMENT_FAILED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot initiate payment for request in state ${currentStatus}`);
        }
        return STATES.PAYMENT_PENDING;

      case 'PAYMENT_SUCCESS':
        if (currentStatus !== STATES.PAYMENT_PENDING) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot complete payment from state ${currentStatus}`);
        }
        return STATES.COMPLETED;

      case 'PAYMENT_FAIL':
        if (currentStatus !== STATES.PAYMENT_PENDING) {
          throw new AppError('INVALID_STATE_TRANSITION', `Cannot set payment failed from state ${currentStatus}`);
        }
        return STATES.PAYMENT_FAILED;

      case 'MODIFY_RESUBMIT':
        if (currentStatus !== STATES.REJECTED) {
          throw new AppError('INVALID_STATE_TRANSITION', `Only REJECTED requests can be modified and resubmitted`);
        }
        return STATES.DRAFT;

      default:
        throw new AppError('INVALID_ACTION', `Unrecognized action: ${action}`);
    }
  }
}

module.exports = {
  STATES,
  CATEGORIES,
  PRIORITIES,
  StateMachine
};

