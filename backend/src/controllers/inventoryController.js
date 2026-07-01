const Product =
require("../models/Product");

const StockTransaction =
require("../models/StockTransaction");

/*
----------------------------------
ADD STOCK
----------------------------------
*/

const addStock = async (
  req,
  res
) => {

  try {

    const {
      productId,
      quantity,
      remarks
    } = req.body;

    const product =
      await Product.findById(
        productId
      );

    if (!product) {

      return res.status(404).json({
        success: false,
        message:
          "Product Not Found"
      });

    }

    const previousStock =
      product.stockQuantity;

    product.stockQuantity +=
      Number(quantity);

    await product.save();

    await StockTransaction.create({
      product: product._id,

      transactionType:
        "STOCK_IN",

      quantity,

      previousStock,

      newStock:
        product.stockQuantity,

      remarks,

      performedBy:
        req.user._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Stock Added Successfully"
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
REMOVE STOCK
----------------------------------
*/

const removeStock = async (
  req,
  res
) => {

  try {

    const {
      productId,
      quantity,
      remarks
    } = req.body;

    const product =
      await Product.findById(
        productId
      );

    if (!product) {

      return res.status(404).json({
        success: false,
        message:
          "Product Not Found"
      });

    }

    if (
      product.stockQuantity <
      quantity
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Insufficient Stock"
      });

    }

    const previousStock =
      product.stockQuantity;

    product.stockQuantity -=
      Number(quantity);

    await product.save();

    await StockTransaction.create({
      product: product._id,

      transactionType:
        "STOCK_OUT",

      quantity,

      previousStock,

      newStock:
        product.stockQuantity,

      remarks,

      performedBy:
        req.user._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Stock Removed Successfully"
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
ADJUST STOCK
----------------------------------
*/

const adjustStock = async (
  req,
  res
) => {

  try {

    const {
      productId,
      newStock,
      remarks
    } = req.body;

    const product =
      await Product.findById(
        productId
      );

    if (!product) {

      return res.status(404).json({
        success: false,
        message:
          "Product Not Found"
      });

    }

    const previousStock =
      product.stockQuantity;

    product.stockQuantity =
      newStock;

    await product.save();

    await StockTransaction.create({
      product: product._id,

      transactionType:
        "ADJUSTMENT",

      quantity:
        Math.abs(
          newStock -
          previousStock
        ),

      previousStock,

      newStock,

      remarks,

      performedBy:
        req.user._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Stock Adjusted"
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
GET HISTORY
----------------------------------
*/

const getInventoryHistory =
async (req, res) => {

  try {

    const history =
      await StockTransaction
      .find()
      .populate(
        "product",
        "name barcode"
      )
      .populate(
        "performedBy",
        "name role"
      )
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {
  addStock,
  removeStock,
  adjustStock,
  getInventoryHistory,
};