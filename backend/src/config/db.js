const { initialUsers, initialVendors } = require('./seedData');

// In-Memory Database Store (Used for rapid testing / development & fallback)
class DatabaseStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.vendors = JSON.parse(JSON.stringify(initialVendors));
    this.requests = [];
    this.approvals = [];
    this.payments = [];
    this.notifications = [];
    this.auditLogs = [];
    this.idCounter = 100;
  }

  generateRequestId() {
    this.idCounter += 1;
    return `REQ-${this.idCounter}`;
  }
}

const dbStore = new DatabaseStore();

module.exports = {
  dbStore
};

