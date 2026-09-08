const { prisma } = require('../config/prisma');
const { dbStore } = require('../config/db');

class ApprovalRepository {
  async create(data) {
    const id = data.id || `appr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      const approval = await prisma.approval.create({
        data: {
          id,
          requestId: data.requestId,
          approverId: data.approverId,
          role: data.role,
          action: data.action,
          comment: data.comment || ''
        },
        include: {
          approver: true
        }
      });
      return {
        ...approval,
        approverName: approval.approver ? approval.approver.name : data.approverName || 'Approver',
        approverEmail: approval.approver ? approval.approver.email : data.approverEmail || ''
      };
    } catch (err) {
      console.warn('[ApprovalRepository.create] DB fallback:', err.message);
      const fallback = {
        id,
        requestId: data.requestId,
        approverId: data.approverId,
        approverName: data.approverName || 'Approver',
        approverEmail: data.approverEmail || '',
        role: data.role,
        action: data.action,
        comment: data.comment || '',
        createdAt: new Date()
      };
      dbStore.approvals.push(fallback);
      return fallback;
    }
  }

  async findByRequestId(requestId) {
    try {
      const approvals = await prisma.approval.findMany({
        where: { requestId },
        include: { approver: true },
        orderBy: { createdAt: 'desc' }
      });
      if (approvals && approvals.length > 0) {
        return approvals.map(a => ({
          ...a,
          approverName: a.approver ? a.approver.name : 'Approver',
          approverEmail: a.approver ? a.approver.email : ''
        }));
      }
    } catch (err) {
      console.warn('[ApprovalRepository.findByRequestId] DB fallback:', err.message);
    }
    return dbStore.approvals.filter(a => a.requestId === requestId);
  }
}

const approvalRepository = new ApprovalRepository();

module.exports = {
  approvalRepository,
  ApprovalRepository
};
