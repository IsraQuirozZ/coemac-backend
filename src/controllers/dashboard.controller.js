const dashBoardService = require("../services/dashboard.service");

const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const period = req.query.period || "30d";

    const dashboard = await dashBoardService.getDashboardData(userId, period);

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

const getAdminDashboardData = async (req, res, next) => {
  try {
    const period = req.query.period || "30d";

    const dashboard = await dashBoardService.getAdminDashboardData(period);

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getAdminDashboardData,
};
