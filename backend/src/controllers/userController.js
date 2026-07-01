// const User = require("../models/User");
// const ROLES = require("../constants/roles");

// /*
// ----------------------------------
// CREATE USER
// ----------------------------------
// */

// const createUser = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       role,
//       phone
//     } = req.body;

//     const existingUser =
//       await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already exists"
//       });
//     }

//     if (
//       !Object.values(ROLES).includes(role)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid Role"
//       });
//     }

//     const employeeCode =
//       `EMP${Date.now()}`;

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role,
//       phone,
//       employeeCode,
//       createdBy: req.user._id
//     });

//     return res.status(201).json({
//       success: true,
//       message: "User Created Successfully",
//       data: user
//     });

//   } catch (error) {

//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }
// };

// /*
// ----------------------------------
// GET ALL USERS
// ----------------------------------
// */

// const getUsers = async (
//   req,
//   res
// ) => {

//   try {

//     const users =
//       await User.find()
//       .select("-password");

//     return res.status(200).json({
//       success: true,
//       count: users.length,
//       data: users
//     });

//   } catch (error) {

//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }

// };

// /*
// ----------------------------------
// GET SINGLE USER
// ----------------------------------
// */

// const getUserById = async (
//   req,
//   res
// ) => {

//   try {

//     const user =
//       await User.findById(
//         req.params.id
//       ).select("-password");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: user
//     });

//   } catch (error) {

//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }

// };

// /*
// ----------------------------------
// UPDATE USER
// ----------------------------------
// */

// const updateUser = async (
//   req,
//   res
// ) => {

//   try {

//     const user =
//       await User.findById(
//         req.params.id
//       );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     user.name =
//       req.body.name || user.name;

//     user.phone =
//       req.body.phone || user.phone;

//     user.updatedBy =
//       req.user._id;

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "User Updated Successfully"
//     });

//   } catch (error) {

//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }

// };

// /*
// ----------------------------------
// ACTIVATE / DEACTIVATE USER
// ----------------------------------
// */

// const toggleUserStatus =
// async (req, res) => {

//   try {

//     const user =
//       await User.findById(
//         req.params.id
//       );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     user.isActive =
//       !user.isActive;

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message:
//         user.isActive
//           ? "User Activated"
//           : "User Disabled"
//     });

//   } catch (error) {

//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });

//   }

// };

// module.exports = {
//   createUser,
//   getUsers,
//   getUserById,
//   updateUser,
//   toggleUserStatus
// };

const User = require("../models/User");
const ROLES = require("../constants/roles");

/*
----------------------------------
CREATE USER
----------------------------------
*/
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Role"
      });
    }

    const employeeCode = `EMP${Date.now()}`;

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      employeeCode,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
----------------------------------
GET ALL USERS
----------------------------------
*/
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
----------------------------------
GET SINGLE USER
----------------------------------
*/
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
----------------------------------
UPDATE USER
----------------------------------
*/
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.updatedBy = req.user._id;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User Updated Successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
----------------------------------
ACTIVATE / DEACTIVATE USER
----------------------------------
*/
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isActive ? "User Activated" : "User Disabled"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/*
----------------------------------
DELETE USER (ADDED THIS CRITICAL BLOCK)
----------------------------------
*/
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User terminal not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User completely removed from system database"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Module exports me deleteUser ko attach kar diya hai
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
};