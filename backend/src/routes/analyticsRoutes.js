const express = require("express");

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
  getSalesOverview,
  getProfitAnalytics,
  getTopProducts,
  getPaymentAnalytics,
  getMonthlySales,
  getDailySales,
} = require(
  "../controllers/analyticsController"
);

router.get(
  "/overview",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  getSalesOverview
);

router.get(
  "/profit",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  getProfitAnalytics
);

router.get(
  "/top-products",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  getTopProducts
);

router.get(
  "/payments",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  getPaymentAnalytics
);

router.get(
  "/monthly-sales",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  getMonthlySales
);

router.get(
  "/daily-sales",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  getDailySales
);

module.exports =
  router;