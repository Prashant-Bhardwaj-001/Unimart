const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const ROLES =
require("../constants/roles");

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  toggleSupplierStatus,
  deleteSupplier,
} =
require("../controllers/supplierController");

router.delete("/:id", deleteSupplier);

router.post(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  createSupplier
);

router.get(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getSuppliers
);

router.get(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  getSupplierById
);

router.put(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  updateSupplier
);

router.patch(
  "/:id/status",
  protect,
  authorize(ROLES.ADMIN),
  toggleSupplierStatus
);

module.exports = router;