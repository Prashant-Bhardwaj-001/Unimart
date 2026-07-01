

/*
----------------------------------
CREATE SUPPLIER
----------------------------------
*/

const Supplier = require("../models/Supplier");
const User = require("../models/User");

/*
----------------------------------
CREATE SUPPLIER
----------------------------------
*/

const createSupplier = async (
  req,
  res
) => {
  try {

    const {
      email,
      password,
      contactPerson,
    } = req.body;

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email Already Exists",
      });
    }

    const supplierCode =
      `SUP${Date.now()}`;

    const user =
      await User.create({
        name: contactPerson,
        email,
        password,
        role: "SUPPLIER",
      });

    const supplier =
      await Supplier.create({
        ...req.body,

        supplierCode,

        linkedUser:
          user._id,

        createdBy:
          req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Supplier Created Successfully",
      data: supplier,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }
};

/*
----------------------------------
GET ALL SUPPLIERS
----------------------------------
*/

const getSuppliers = async (
  req,
  res
) => {
  try {

    const suppliers =
      await Supplier.find();

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
----------------------------------
GET SUPPLIER BY ID
----------------------------------
*/

const getSupplierById =
async (req, res) => {
  try {

    const supplier =
      await Supplier.findById(
        req.params.id
      );

    if (!supplier) {

      return res.status(404).json({
        success: false,
        message:
          "Supplier Not Found",
      });

    }

    return res.status(200).json({
      success: true,
      data: supplier,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
----------------------------------
UPDATE SUPPLIER
----------------------------------
*/

const updateSupplier =
async (req, res) => {

  try {

    const supplier =
      await Supplier.findById(
        req.params.id
      );

    if (!supplier) {

      return res.status(404).json({
        success: false,
        message:
          "Supplier Not Found",
      });

    }

    Object.assign(
      supplier,
      req.body
    );

    supplier.updatedBy =
      req.user._id;

    await supplier.save();

    return res.status(200).json({
      success: true,
      message:
        "Supplier Updated Successfully",
      data: supplier,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

/*
----------------------------------
TOGGLE STATUS
----------------------------------
*/

const toggleSupplierStatus =
async (req, res) => {

  try {

    const supplier =
      await Supplier.findById(
        req.params.id
      );

    if (!supplier) {

      return res.status(404).json({
        success: false,
        message:
          "Supplier Not Found",
      });

    }

    supplier.isActive =
      !supplier.isActive;

    await supplier.save();

    return res.status(200).json({
      success: true,
      message:
        supplier.isActive
          ? "Supplier Activated"
          : "Supplier Deactivated",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


/*
----------------------------------
DELETE SUPPLIER VENDOR
----------------------------------
*/
const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    const supplier = await Supplier.findByIdAndDelete(supplierId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier contract node not found in database registry."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier vendor contract permanently deleted from core networks."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  toggleSupplierStatus,
  deleteSupplier,
};