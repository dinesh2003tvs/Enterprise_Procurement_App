const AppError = require('../utils/AppError');
const { StateMachine, STATES } = require('../domain/stateMachine');
const { requestRepository } = require('../repositories/requestRepository');
const { approvalRepository } = require('../repositories/approvalRepository');
const { auditRepository } = require('../repositories/auditRepository');

class ApprovalService {
  async getPendingManager() {
    return requestRepository.findByStatus(STATES.SUBMITTED);
  }

  async managerApprove(requestId, manager, comment = 'Approved by manager') {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    const nextStatus = StateMachine.validateTransition(
      request.status,
      'MANAGER_APPROVE',
      request,
      manager.role
    );

    await approvalRepository.create({
      requestId,
      approverId: manager.id,
      approverName: manager.name,
      approverEmail: manager.email,
      role: manager.role,
      action: 'APPROVED',
      comment
    });

    const updated = await requestRepository.update(requestId, { status: nextStatus });

    await auditRepository.log({
      requestId,
      action: 'MANAGER_APPROVED',
      performedBy: manager.email,
      comment
    });

    return updated;
  }

  async managerReject(requestId, manager, comment) {
    if (!comment || !comment.trim()) {
      throw new AppError('VALIDATION_ERROR', 'Rejection reason/comment is required');
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    const nextStatus = StateMachine.validateTransition(
      request.status,
      'MANAGER_REJECT',
      request,
      manager.role
    );

    await approvalRepository.create({
      requestId,
      approverId: manager.id,
      approverName: manager.name,
      approverEmail: manager.email,
      role: manager.role,
      action: 'REJECTED',
      comment
    });

    const updated = await requestRepository.update(requestId, { status: nextStatus });

    await auditRepository.log({
      requestId,
      action: 'MANAGER_REJECTED',
      performedBy: manager.email,
      comment
    });

    return updated;
  }

  async getPendingFinance() {
    return requestRepository.findByStatus(STATES.MANAGER_APPROVED);
  }

  async financeApprove(requestId, financeUser, comment = 'Budget verified and approved') {
    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    const nextStatus = StateMachine.validateTransition(
      request.status,
      'FINANCE_APPROVE',
      request,
      financeUser.role
    );

    await approvalRepository.create({
      requestId,
      approverId: financeUser.id,
      approverName: financeUser.name,
      approverEmail: financeUser.email,
      role: financeUser.role,
      action: 'APPROVED',
      comment
    });

    const updated = await requestRepository.update(requestId, { status: nextStatus });

    await auditRepository.log({
      requestId,
      action: 'FINANCE_APPROVED',
      performedBy: financeUser.email,
      comment
    });

    return updated;
  }

  async financeReject(requestId, financeUser, comment) {
    if (!comment || !comment.trim()) {
      throw new AppError('VALIDATION_ERROR', 'Rejection reason/comment is required');
    }

    const request = await requestRepository.findById(requestId);
    if (!request) {
      throw new AppError('NOT_FOUND', 'Purchase request not found', 404);
    }

    const nextStatus = StateMachine.validateTransition(
      request.status,
      'FINANCE_REJECT',
      request,
      financeUser.role
    );

    await approvalRepository.create({
      requestId,
      approverId: financeUser.id,
      approverName: financeUser.name,
      approverEmail: financeUser.email,
      role: financeUser.role,
      action: 'REJECTED',
      comment
    });

    const updated = await requestRepository.update(requestId, { status: nextStatus });

    await auditRepository.log({
      requestId,
      action: 'FINANCE_REJECTED',
      performedBy: financeUser.email,
      comment
    });

    return updated;
  }
}

const approvalService = new ApprovalService();

module.exports = {
  approvalService,
  ApprovalService
};
