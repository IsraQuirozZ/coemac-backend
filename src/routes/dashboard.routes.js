const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/authorizedRoles");

router.use(protect);

router.get("/", dashboardController.getDashboardData);

router.get(
  "/admin",
  authorizeRoles("ADMIN"),
  dashboardController.getAdminDashboardData,
);

module.exports = router;
