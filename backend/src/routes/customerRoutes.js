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
  getCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
} = require(
  "../controllers/customerController"
);

router.post(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER
  ),
  createCustomer
);

router.get(
  "/",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER
  ),
  getCustomers
);

router.get(
  "/phone/:phone",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER
  ),
  getCustomerByPhone
);

router.put(
  "/:id",
  protect,
  authorize(
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER
  ),
  updateCustomer
);

module.exports = router;