const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const ROLES =
require("../constants/roles");

const {
  addStock,
  removeStock,
  adjustStock,
  getInventoryHistory,
} =
require("../controllers/inventoryController");

/*
----------------------------------
INVENTORY ROUTES
----------------------------------
*/

router.post(
  "/add-stock",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  addStock
);

router.post(
  "/remove-stock",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  removeStock
);

router.post(
  "/adjust-stock",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  adjustStock
);

router.get(
  "/history",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getInventoryHistory
);

module.exports = router;