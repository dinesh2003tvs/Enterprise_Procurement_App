const { dbStore } = require('../config/db');

class AuditRepository {
  async log({ requestId, action, performedBy, comment = '' }) {
    const auditRecord = {
      id: `adt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId,
      action,
      performedBy, // email of actor
      timestamp: new Date().toISOString(),
      comment
    };
    dbStore.auditLogs.push(auditRecord);
    return auditRecord;
  }

  async findByRequestId(requestId) {
    return dbStore.auditLogs.filter(a => a.requestId === requestId);
  }
}

const auditRepository = new AuditRepository();

module.exports = {
  auditRepository,
  AuditRepository
};
