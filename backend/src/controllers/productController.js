const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
 

/*
----------------------------------
CREATE PRODUCT
----------------------------------
*/

const createProduct = async (
  req,
  res
) => {
  try {

    const supplier =
      await Supplier.findById(
        req.body.supplier
      );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier Not Found",
      });
    }

    const existingBarcode =
      await Product.findOne({
        barcode: req.body.barcode,
      });

    if (existingBarcode) {
      return res.status(400).json({
        success: false,
        message:
          "Barcode Already Exists",
      });
    }

    const product =
      await Product.create({
        ...req.body,
        createdBy: req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Product Created Successfully",
      data: product,
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
GET PRODUCTS
----------------------------------
*/

const getProducts = async (
  req,
  res
) => {

  try {

    const products =
      await Product.find()
      .populate(
        "supplier",
        "companyName supplierCode"
      );

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
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
GET PRODUCT BY ID
----------------------------------
*/

const getProductById =
async (req, res) => {

  try {

    const product =
      await Product.findById(
        req.params.id
      ).populate(
        "supplier",
        "companyName supplierCode"
      );

    if (!product) {

      return res.status(404).json({
        success: false,
        message:
          "Product Not Found",
      });

    }

    return res.status(200).json({
      success: true,
      data: product,
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
UPDATE PRODUCT
----------------------------------
*/

const updateProduct =
async (req, res) => {

  try {

    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {

      return res.status(404).json({
        success: false,
        message:
          "Product Not Found",
      });

    }

    Object.assign(
      product,
      req.body
    );

    product.updatedBy =
      req.user._id;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product Updated Successfully",
      data: product,
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
ACTIVATE / DEACTIVATE
----------------------------------
*/

const toggleProductStatus =
async (req, res) => {

  try {

    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {

      return res.status(404).json({
        success: false,
        message:
          "Product Not Found",
      });

    }

    product.isActive =
      !product.isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        product.isActive
          ? "Product Activated"
          : "Product Deactivated",
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
DELETE PRODUCT
----------------------------------
*/
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Database se product find karke permanently delete karega
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product SKU not found in inventory master database.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product completely removed from master catalog asset logs.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};