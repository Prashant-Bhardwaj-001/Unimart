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
  getSupplierProfile,
  getMyPurchaseOrders,
  acceptPurchaseOrder,
  rejectPurchaseOrder,
  markOrderAsShipped,
} = require(
  "../controllers/supplierPortalController"
);

router.get(
  "/profile",
  protect,
  authorize(ROLES.SUPPLIER),
  getSupplierProfile
);

router.get(
  "/orders",
  protect,
  authorize(ROLES.SUPPLIER),
  getMyPurchaseOrders
);

router.patch(
  "/orders/:id/accept",
  protect,
  authorize(ROLES.SUPPLIER),
  acceptPurchaseOrder
);

router.patch(
  "/orders/:id/reject",
  protect,
  authorize(ROLES.SUPPLIER),
  rejectPurchaseOrder
);

router.patch(
  "/orders/:id/shipped",
  protect,
  authorize(ROLES.SUPPLIER),
  markOrderAsShipped
);

module.exports = router;