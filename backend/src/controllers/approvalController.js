const { approvalService } = require('../services/approvalService');

class ApprovalController {
  async getPendingManager(req, res, next) {
    try {
      const requests = await approvalService.getPendingManager();
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async managerApprove(req, res, next) {
    try {
      const { comment } = req.body;
      const updated = await approvalService.managerApprove(req.params.id, req.user, comment);
      res.status(200).json({
        success: true,
        message: 'Request approved by manager',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async managerReject(req, res, next) {
    try {
      const { comment } = req.body;
      const updated = await approvalService.managerReject(req.params.id, req.user, comment);
      res.status(200).json({
        success: true,
        message: 'Request rejected by manager',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingFinance(req, res, next) {
    try {
      const requests = await approvalService.getPendingFinance();
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async financeApprove(req, res, next) {
    try {
      const { comment } = req.body;
      const updated = await approvalService.financeApprove(req.params.id, req.user, comment);
      res.status(200).json({
        success: true,
        message: 'Request budget approved by finance',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  async financeReject(req, res, next) {
    try {
      const { comment } = req.body;
      const updated = await approvalService.financeReject(req.params.id, req.user, comment);
      res.status(200).json({
        success: true,
        message: 'Request rejected by finance',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

const approvalController = new ApprovalController();

module.exports = {
  approvalController,
  ApprovalController
};

