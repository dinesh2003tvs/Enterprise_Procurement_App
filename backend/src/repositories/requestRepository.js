const { prisma } = require('../config/prisma');
const { dbStore } = require('../config/db');

class RequestRepository {
  async generateId() {
    try {
      const count = await prisma.purchaseRequest.count();
      let candidate = `REQ-${101 + count}`;
      let exists = await prisma.purchaseRequest.findUnique({ where: { id: candidate } });
      let offset = 1;
      while (exists) {
        candidate = `REQ-${101 + count + offset}`;
        exists = await prisma.purchaseRequest.findUnique({ where: { id: candidate } });
        offset += 1;
      }
      return candidate;
    } catch (e) {
      return dbStore.generateRequestId();
    }
  }

  mapRequestWithRelations(r) {
    if (!r) return null;
    return {
      id: r.id,
      employeeId: r.employeeId,
      department: r.department,
      itemName: r.itemName,
      category: r.category,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      totalAmount: r.totalAmount,
      businessJustification: r.businessJustification,
      priority: r.priority,
      status: r.status,
      selectedVendorId: r.selectedVendorId,
      selectedVendorName: r.vendor ? r.vendor.name : (r.selectedVendorName || null),
      vendorQuote: r.vendorQuote || (r.selectedVendorId ? { vendor: r.vendor?.name || 'TechSource Inc.', quoteId: 'TS-QUOTE-ACTIVE', deliveryDays: 5 } : null),
      paymentId: r.paymentId,
      paymentStatus: r.paymentStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      employeeName: r.employee ? r.employee.name : 'Unknown',
      employeeEmail: r.employee ? r.employee.email : '',
      approvals: (r.approvals || []).map(a => ({
        ...a,
        approverName: a.approver ? a.approver.name : (a.approverName || 'Approver'),
        approverEmail: a.approver ? a.approver.email : (a.approverEmail || '')
      })),
      auditLogs: (r.auditLogs || []).map(l => ({
        ...l,
        timestamp: l.timestamp ? (l.timestamp.toISOString ? l.timestamp.toISOString() : l.timestamp) : new Date().toISOString()
      })),
      payment: r.payment || null
    };
  }

  async create(data) {
    const id = data.id || (await this.generateId());
    const qty = Number(data.quantity);
    const unitPrice = Number(data.unitPrice);
    const totalAmount = qty * unitPrice;

    // Ensure employee exists in DB if possible
    try {
      const userExists = await prisma.user.findUnique({ where: { id: data.employeeId } });
      if (!userExists) {
        const fallbackUser = dbStore.users.find(u => u.id === data.employeeId);
        if (fallbackUser) {
          await prisma.user.upsert({
            where: { email: fallbackUser.email },
            update: { name: fallbackUser.name, role: fallbackUser.role, department: fallbackUser.department },
            create: { id: fallbackUser.id, name: fallbackUser.name, email: fallbackUser.email, passwordHash: fallbackUser.passwordHash, role: fallbackUser.role, department: fallbackUser.department }
          });
        }
      }

      await prisma.purchaseRequest.create({
        data: {
          id,
          employeeId: data.employeeId,
          department: data.department,
          itemName: data.itemName,
          category: data.category,
          quantity: qty,
          unitPrice,
          totalAmount,
          businessJustification: data.businessJustification,
          priority: data.priority,
          status: data.status || 'DRAFT',
          selectedVendorId: data.selectedVendorId || null
        }
      });

      return await this.findById(id);
    } catch (err) {
      console.warn('[RequestRepository.create] DB fallback:', err.message);
      const newRequest = {
        id,
        employeeId: data.employeeId,
        department: data.department,
        itemName: data.itemName,
        category: data.category,
        quantity: qty,
        unitPrice,
        totalAmount,
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
  }

  async findById(id) {
    try {
      const request = await prisma.purchaseRequest.findUnique({
        where: { id },
        include: {
          employee: true,
          vendor: true,
          payment: true,
          approvals: {
            include: { approver: true },
            orderBy: { createdAt: 'desc' }
          },
          auditLogs: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (request) {
        return this.mapRequestWithRelations(request);
      }
    } catch (err) {
      console.warn('[RequestRepository.findById] DB fallback:', err.message);
    }

    // Fallback to in-memory store
    const req = dbStore.requests.find(r => r.id === id);
    if (!req) return null;

    const employee = dbStore.users.find(u => u.id === req.employeeId);
    const approvals = dbStore.approvals.filter(a => a.requestId === id);
    const auditLogs = dbStore.auditLogs.filter(a => a.requestId === id);
    const payment = dbStore.payments.find(p => p.requestId === id);

    return {
      ...req,
      employeeName: employee ? employee.name : 'Unknown',
      employeeEmail: employee ? employee.email : '',
      approvals,
      auditLogs,
      payment
    };
  }

  async findByEmployeeId(employeeId) {
    try {
      const requests = await prisma.purchaseRequest.findMany({
        where: { employeeId },
        include: {
          employee: true,
          vendor: true,
          payment: true,
          approvals: { include: { approver: true }, orderBy: { createdAt: 'desc' } },
          auditLogs: { orderBy: { timestamp: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (requests && requests.length > 0) {
        return requests.map(r => this.mapRequestWithRelations(r));
      }
    } catch (err) {
      console.warn('[RequestRepository.findByEmployeeId] DB fallback:', err.message);
    }

    const fallbackReqs = dbStore.requests.filter(r => r.employeeId === employeeId);
    return Promise.all(fallbackReqs.map(r => this.findById(r.id)));
  }

  async findByStatus(statusList) {
    const statuses = Array.isArray(statusList) ? statusList : [statusList];
    try {
      const requests = await prisma.purchaseRequest.findMany({
        where: { status: { in: statuses } },
        include: {
          employee: true,
          vendor: true,
          payment: true,
          approvals: { include: { approver: true }, orderBy: { createdAt: 'desc' } },
          auditLogs: { orderBy: { timestamp: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (requests && requests.length > 0) {
        return requests.map(r => this.mapRequestWithRelations(r));
      }
    } catch (err) {
      console.warn('[RequestRepository.findByStatus] DB fallback:', err.message);
    }

    const fallbackReqs = dbStore.requests.filter(r => statuses.includes(r.status));
    return Promise.all(fallbackReqs.map(r => this.findById(r.id)));
  }

  async findAll() {
    try {
      const requests = await prisma.purchaseRequest.findMany({
        include: {
          employee: true,
          vendor: true,
          payment: true,
          approvals: { include: { approver: true }, orderBy: { createdAt: 'desc' } },
          auditLogs: { orderBy: { timestamp: 'asc' } }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (requests && requests.length > 0) {
        return requests.map(r => this.mapRequestWithRelations(r));
      }
    } catch (err) {
      console.warn('[RequestRepository.findAll] DB fallback:', err.message);
    }

    return Promise.all(dbStore.requests.map(r => this.findById(r.id)));
  }

  async update(id, updates) {
    try {
      // If vendor selected, ensure vendor exists in DB
      if (updates.selectedVendorId) {
        const vendorExists = await prisma.vendor.findUnique({ where: { id: updates.selectedVendorId } });
        if (!vendorExists) {
          const fallbackVendor = dbStore.vendors.find(v => v.id === updates.selectedVendorId);
          if (fallbackVendor) {
            await prisma.vendor.upsert({
              where: { code: fallbackVendor.code },
              update: { name: fallbackVendor.name, apiConfig: fallbackVendor.apiConfig },
              create: { id: fallbackVendor.id, name: fallbackVendor.name, code: fallbackVendor.code, apiConfig: fallbackVendor.apiConfig, supportedCategories: fallbackVendor.supportedCategories }
            });
          }
        }
      }

      const dataToUpdate = {};
      if (updates.status !== undefined) dataToUpdate.status = updates.status;
      if (updates.quantity !== undefined) dataToUpdate.quantity = Number(updates.quantity);
      if (updates.unitPrice !== undefined) dataToUpdate.unitPrice = Number(updates.unitPrice);
      if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
        const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
        if (existing) {
          const q = updates.quantity !== undefined ? Number(updates.quantity) : existing.quantity;
          const p = updates.unitPrice !== undefined ? Number(updates.unitPrice) : existing.unitPrice;
          dataToUpdate.totalAmount = q * p;
        }
      }
      if (updates.selectedVendorId !== undefined) dataToUpdate.selectedVendorId = updates.selectedVendorId;
      if (updates.businessJustification !== undefined) dataToUpdate.businessJustification = updates.businessJustification;
      if (updates.priority !== undefined) dataToUpdate.priority = updates.priority;
      if (updates.paymentId !== undefined) dataToUpdate.paymentId = updates.paymentId;

      await prisma.purchaseRequest.update({
        where: { id },
        data: dataToUpdate
      });

      return await this.findById(id);
    } catch (err) {
      console.warn('[RequestRepository.update] DB fallback:', err.message);
      const index = dbStore.requests.findIndex(r => r.id === id);
      if (index === -1) return null;

      const existing = dbStore.requests[index];
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date()
      };

      if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
        updated.totalAmount = Number(updated.quantity) * Number(updated.unitPrice);
      }

      dbStore.requests[index] = updated;
      return this.findById(id);
    }
  }
}

const requestRepository = new RequestRepository();

module.exports = {
  requestRepository,
  RequestRepository
};
