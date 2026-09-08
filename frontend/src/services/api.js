const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://enterprise-procurement-backend.onrender.com/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAuthToken() {
    return localStorage.getItem('procurement_jwt_token');
  }

  setAuthToken(token) {
    if (token) {
      localStorage.setItem('procurement_jwt_token', token);
    } else {
      localStorage.removeItem('procurement_jwt_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.code = data.code || 'API_ERROR';
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Requests
  getDashboardStats() {
    return this.request('/requests/stats');
  }

  getMyRequests() {
    return this.request('/requests/my');
  }

  getAllRequests() {
    return this.request('/requests/all');
  }

  getRequestById(id) {
    return this.request(`/requests/${id}`);
  }

  createDraft(payload) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  updateDraft(id, payload) {
    return this.request(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  submitRequest(id) {
    return this.request(`/requests/${id}/submit`, {
      method: 'POST'
    });
  }

  cancelRequest(id) {
    return this.request(`/requests/${id}/cancel`, {
      method: 'POST'
    });
  }

  // Manager
  getPendingManager() {
    return this.request('/requests/pending-manager');
  }

  managerApprove(id, comment) {
    return this.request(`/requests/${id}/manager-approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  managerReject(id, comment) {
    return this.request(`/requests/${id}/manager-reject`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  // Finance
  getPendingFinance() {
    return this.request('/requests/pending-finance');
  }

  financeApprove(id, comment) {
    return this.request(`/requests/${id}/finance-approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  financeReject(id, comment) {
    return this.request(`/requests/${id}/finance-reject`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  }

  // Procurement
  getPendingProcurement() {
    return this.request('/requests/pending-procurement');
  }

  selectVendor(id, vendor = 'TECHSOURCE') {
    return this.request(`/requests/${id}/vendor`, {
      method: 'POST',
      body: JSON.stringify({ vendor })
    });
  }

  processPayment(id, paymentMethod = 'BANK_TRANSFER', idempotencyKey) {
    return this.request(`/requests/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, idempotencyKey })
    });
  }
}

export const api = new ApiClient();

