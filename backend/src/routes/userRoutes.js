const express = require("express");

const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const authorize =
require("../middleware/roleMiddleware");

const ROLES =
require("../constants/roles");


const { deleteUser } = require("../controllers/userController");




const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus
} =
require("../controllers/userController");

/*
----------------------------------
ADMIN ONLY ROUTES
----------------------------------
*/

router.post(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  createUser
);

router.get(
  "/",
  protect,
  authorize(ROLES.ADMIN),
  getUsers
);

router.get(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  getUserById
);

router.put(
  "/:id",
  protect,
  authorize(ROLES.ADMIN),
  updateUser
);

router.patch(
  "/:id/status",
  protect,
  authorize(ROLES.ADMIN),
  toggleUserStatus
);

router.delete("/:id", deleteUser); 

module.exports = router;