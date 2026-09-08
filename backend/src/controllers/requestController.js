const { requestService } = require('../services/requestService');

class RequestController {
  async createDraft(req, res, next) {
    try {
      const request = await requestService.createDraft(req.user, req.body);
      res.status(201).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  async submitRequest(req, res, next) {
    try {
      const request = await requestService.submitRequest(req.params.id, req.user);
      res.status(200).json({
        success: true,
        message: 'Purchase request submitted for approval',
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDraft(req, res, next) {
    try {
      const request = await requestService.updateDraft(req.params.id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: 'Purchase request updated',
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelRequest(req, res, next) {
    try {
      const request = await requestService.cancelRequest(req.params.id, req.user);
      res.status(200).json({
        success: true,
        message: 'Purchase request cancelled',
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req, res, next) {
    try {
      const requests = await requestService.getMyRequests(req.user.id);
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async getRequestDetails(req, res, next) {
    try {
      const request = await requestService.getRequestDetails(req.params.id);
      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRequests(req, res, next) {
    try {
      const requests = await requestService.getAllRequests();
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const requests = await requestService.getAllRequests();
      const stats = {
        total: requests.length,
        draft: requests.filter(r => r.status === 'DRAFT').length,
        pending: requests.filter(r => [
          'SUBMITTED',
          'MANAGER_APPROVED',
          'SENIOR_MANAGER_APPROVED',
          'FINANCE_APPROVED',
          'PROCUREMENT_STARTED',
          'PAYMENT_PENDING'
        ].includes(r.status)).length,
        approved: requests.filter(r => ['MANAGER_APPROVED', 'FINANCE_APPROVED'].includes(r.status)).length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
        completed: requests.filter(r => r.status === 'COMPLETED').length,
        cancelled: requests.filter(r => r.status === 'CANCELLED').length,
        paymentFailed: requests.filter(r => r.status === 'PAYMENT_FAILED').length
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

const requestController = new RequestController();

module.exports = {
  requestController,
  RequestController
};

