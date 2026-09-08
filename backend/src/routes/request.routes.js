const express = require('express');
const { requestController } = require('../controllers/requestController');
const { approvalController } = require('../controllers/approvalController');
const { vendorController } = require('../controllers/vendorController');
const { paymentController } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

const router = express.Router();

// Apply authentication to all request routes
router.use(authenticate);

// --- General Queries & Stats ---
router.get('/stats', (req, res, next) => requestController.getDashboardStats(req, res, next));
router.get('/all', (req, res, next) => requestController.getAllRequests(req, res, next));

// --- Employee Actions ---
router.post('/', authorize('EMPLOYEE'), (req, res, next) => requestController.createDraft(req, res, next));
router.get('/my', authorize('EMPLOYEE'), (req, res, next) => requestController.getMyRequests(req, res, next));
router.put('/:id', authorize('EMPLOYEE'), (req, res, next) => requestController.updateDraft(req, res, next));
router.post('/:id/submit', authorize('EMPLOYEE'), (req, res, next) => requestController.submitRequest(req, res, next));
router.post('/:id/cancel', authorize('EMPLOYEE'), (req, res, next) => requestController.cancelRequest(req, res, next));

// --- Manager Queue & Actions ---
router.get('/pending-manager', authorize('MANAGER', 'SENIOR_MANAGER'), (req, res, next) =>
  approvalController.getPendingManager(req, res, next)
);
router.post('/:id/manager-approve', authorize('MANAGER', 'SENIOR_MANAGER'), (req, res, next) =>
  approvalController.managerApprove(req, res, next)
);
router.post('/:id/manager-reject', authorize('MANAGER', 'SENIOR_MANAGER'), (req, res, next) =>
  approvalController.managerReject(req, res, next)
);

// --- Finance Queue & Actions ---
router.get('/pending-finance', authorize('FINANCE'), (req, res, next) =>
  approvalController.getPendingFinance(req, res, next)
);
router.post('/:id/finance-approve', authorize('FINANCE'), (req, res, next) =>
  approvalController.financeApprove(req, res, next)
);
router.post('/:id/finance-reject', authorize('FINANCE'), (req, res, next) =>
  approvalController.financeReject(req, res, next)
);

// --- Procurement Queue & Actions ---
router.get('/pending-procurement', authorize('PROCUREMENT_ADMIN'), (req, res, next) =>
  vendorController.getPendingProcurement(req, res, next)
);
router.post('/:id/vendor', authorize('PROCUREMENT_ADMIN'), (req, res, next) =>
  vendorController.selectVendor(req, res, next)
);
router.post('/:id/payment', authorize('PROCUREMENT_ADMIN'), (req, res, next) =>
  paymentController.processPayment(req, res, next)
);

// --- Single Request Details (Available to all authenticated roles) ---
router.get('/:id', (req, res, next) => requestController.getRequestDetails(req, res, next));

module.exports = router;
