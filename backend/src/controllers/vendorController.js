const { vendorService } = require('../services/vendorService');

class VendorController {
  async getPendingProcurement(req, res, next) {
    try {
      const requests = await vendorService.getPendingProcurement();
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  async selectVendor(req, res, next) {
    try {
      const { vendor } = req.body;
      const result = await vendorService.selectVendor(req.params.id, req.user, vendor || 'TECHSOURCE');
      res.status(200).json({
        success: true,
        message: 'Vendor selected and procurement initiated',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

const vendorController = new VendorController();

module.exports = {
  vendorController,
  VendorController
};
