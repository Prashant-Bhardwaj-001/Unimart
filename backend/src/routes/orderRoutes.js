const express = require("express");
const router = express.Router();

// Import authentication and authorization middlewares
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Import user roles constant
const ROLES = require("../constants/roles");

// Import the corresponding functions from orderController
const {
  createOrder,
  getOrders,
  getOrderById,
  getCustomerByPhone,
} = require("../controllers/orderController");

// ========================================================
// 1. Create a New Order
// ========================================================
router.post(
  "/",
  protect,
  authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER),
  createOrder
);

// ========================================================
// 2. Fetch All Orders History Logs
// ========================================================
router.get(
  "/",
  protect,
  authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER),
  getOrders
);

// ========================================================
// 3. CRITICAL: Verify Existing Customer Profile via Phone
// NOTE: This MUST sit above the "/:id" route so Express 
// doesn't mistake the word "customers" for an order ID.
// ========================================================
router.get("/customers/:phone", getCustomerByPhone);

// ========================================================
// 4. Fetch Single Order Details by Document ID
// ========================================================
router.get(
  "/:id",
  protect,
  authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER),
  getOrderById
);

module.exports = router;