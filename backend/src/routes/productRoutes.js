const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const ROLES =
require("../constants/roles");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
} =
require("../controllers/productController");



router.post(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  createProduct
);

router.get(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER
  ),
  getProducts
);

router.get(
  "/:id",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  getProductById
);

router.put(
  "/:id",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER
  ),
  updateProduct
);

router.patch(
  "/:id/status",
  protect,
  authorize(
    ROLES.ADMIN
  ),
  toggleProductStatus
);
router.delete("/:id", deleteProduct);

module.exports = router;