const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/authMiddleware"
);

const authorize = require(
  "../middleware/roleMiddleware"
);

const ROLES = require(
  "../constants/roles"
);

const {
  getLowStockProducts,
  getExpiringProducts,
  getOutOfStockProducts,
  getReorderSuggestions,
  getAlertSummary,
} = require(
  "../controllers/alertController"
);

router.get(
  "/summary",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getAlertSummary
);

router.get(
  "/low-stock",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getLowStockProducts
);

router.get(
  "/expiring",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getExpiringProducts
);

router.get(
  "/out-of-stock",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getOutOfStockProducts
);

router.get(
  "/reorder",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getReorderSuggestions
);

module.exports = router;