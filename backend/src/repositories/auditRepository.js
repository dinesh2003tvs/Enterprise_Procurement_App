const { prisma } = require('../config/prisma');
const { dbStore } = require('../config/db');

class AuditRepository {
  async log({ requestId, action, performedBy, comment = '' }) {
    const id = `adt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      const record = await prisma.auditLog.create({
        data: {
          id,
          requestId,
          action,
          performedBy,
          comment
        }
      });
      return {
        ...record,
        timestamp: record.timestamp ? record.timestamp.toISOString() : new Date().toISOString()
      };
    } catch (err) {
      console.warn('[AuditRepository.log] DB fallback:', err.message);
      const auditRecord = {
        id,
        requestId,
        action,
        performedBy,
        timestamp: new Date().toISOString(),
        comment
      };
      dbStore.auditLogs.push(auditRecord);
      return auditRecord;
    }
  }

  async findByRequestId(requestId) {
    try {
      const records = await prisma.auditLog.findMany({
        where: { requestId },
        orderBy: { timestamp: 'asc' }
      });
      if (records && records.length > 0) {
        return records.map(r => ({
          ...r,
          timestamp: r.timestamp ? r.timestamp.toISOString() : new Date().toISOString()
        }));
      }
    } catch (err) {
      console.warn('[AuditRepository.findByRequestId] DB fallback:', err.message);
    }
    return dbStore.auditLogs.filter(a => a.requestId === requestId);
  }
}

const auditRepository = new AuditRepository();

module.exports = {
  auditRepository,
  AuditRepository
};
