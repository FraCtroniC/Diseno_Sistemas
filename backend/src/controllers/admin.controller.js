const adminService = require('../services/admin.service');

class AdminController {
  async getStats(req, res) {
    const stats = await adminService.getStats();
    res.status(200).json({ success: true, data: stats });
  }
}

module.exports = new AdminController();
