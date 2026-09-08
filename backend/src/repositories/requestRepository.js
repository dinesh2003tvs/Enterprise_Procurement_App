const { dbStore } = require('../config/db');

class RequestRepository {
  async create(data) {
    const id = data.id || dbStore.generateRequestId();
    const newRequest = {
      id,
      employeeId: data.employeeId,
      department: data.department,
      itemName: data.itemName,
      category: data.category,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unitPrice),
      totalAmount: Number(data.quantity) * Number(data.unitPrice),
      businessJustification: data.businessJustification,
      priority: data.priority,
      status: data.status || 'DRAFT',
      selectedVendorId: data.selectedVendorId || null,
      selectedVendorName: data.selectedVendorName || null,
      paymentId: data.paymentId || null,
      paymentStatus: data.paymentStatus || 'UNPAID',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dbStore.requests.push(newRequest);
    return this.findById(id);
  }

  async findById(id) {
    const request = dbStore.requests.find(r => r.id === id);
    if (!request) return null;

    const employee = dbStore.users.find(u => u.id === request.employeeId);
    const approvals = dbStore.approvals.filter(a => a.requestId === id);
    const auditLogs = dbStore.auditLogs.filter(a => a.requestId === id);
    const payment = dbStore.payments.find(p => p.requestId === id);

    return {
      ...request,
      employeeName: employee ? employee.name : 'Unknown',
      employeeEmail: employee ? employee.email : '',
      approvals,
      auditLogs,
      payment
    };
  }

  async findByEmployeeId(employeeId) {
    const requests = dbStore.requests.filter(r => r.employeeId === employeeId);
    return Promise.all(requests.map(r => this.findById(r.id)));
  }

  async findByStatus(statusList) {
    const statuses = Array.isArray(statusList) ? statusList : [statusList];
    const requests = dbStore.requests.filter(r => statuses.includes(r.status));
    return Promise.all(requests.map(r => this.findById(r.id)));
  }

  async findAll() {
    return Promise.all(dbStore.requests.map(r => this.findById(r.id)));
  }

  async update(id, updates) {
    const index = dbStore.requests.findIndex(r => r.id === id);
    if (index === -1) return null;

    const existing = dbStore.requests[index];
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate total if qty or unit price updated
    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
      updated.totalAmount = Number(updated.quantity) * Number(updated.unitPrice);
    }

    dbStore.requests[index] = updated;
    return this.findById(id);
  }
}

const requestRepository = new RequestRepository();

module.exports = {
  requestRepository,
  RequestRepository
};

