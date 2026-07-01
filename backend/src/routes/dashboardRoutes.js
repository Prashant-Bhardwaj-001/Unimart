const express = require(
  "express"
);

const router =
  express.Router();

const protect =
require(
  "../middleware/authMiddleware"
);

const authorize =
require(
  "../middleware/roleMiddleware"
);

const ROLES =
require(
  "../constants/roles"
);

const {
  getAdminDashboard,
} = require(
  "../controllers/dashboardController"
);

router.get(
  "/admin",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getAdminDashboard
);

module.exports =
  router;