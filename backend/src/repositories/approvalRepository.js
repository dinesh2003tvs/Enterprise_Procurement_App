const { dbStore } = require('../config/db');

class ApprovalRepository {
  async create(data) {
    const approval = {
      id: `appr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId: data.requestId,
      approverId: data.approverId,
      approverName: data.approverName || 'Approver',
      approverEmail: data.approverEmail || '',
      role: data.role,
      action: data.action, // APPROVED or REJECTED
      comment: data.comment || '',
      createdAt: new Date()
    };
    dbStore.approvals.push(approval);
    return approval;
  }

  async findByRequestId(requestId) {
    return dbStore.approvals.filter(a => a.requestId === requestId);
  }
}

const approvalRepository = new ApprovalRepository();

module.exports = {
  approvalRepository,
  ApprovalRepository
};

