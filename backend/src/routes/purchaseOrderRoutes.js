const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const ROLES =
require("../constants/roles");

const {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
} =
require("../controllers/purchaseOrderController");

router.post(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  createPurchaseOrder
);

router.get(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getPurchaseOrders
);

router.get(
  "/:id",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getPurchaseOrderById
);

module.exports = router;