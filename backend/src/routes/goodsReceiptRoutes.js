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
  receiveGoods,
  getGoodsReceipts,
  getGoodsReceiptById,
} = require(
  "../controllers/goodsReceiptController"
);

router.post(
  "/receive",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  receiveGoods
);

router.get(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getGoodsReceipts
);

router.get(
  "/:id",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getGoodsReceiptById
);

module.exports = router;