const PurchaseOrder =
require("../models/PurchaseOrder");

const Supplier =
require("../models/Supplier");

const Product =
require("../models/Product");

/*
----------------------------------
CREATE PURCHASE ORDER
----------------------------------
*/

const createPurchaseOrder =
async (req, res) => {

  try {

    const {
      supplier,
      items,
      expectedDeliveryDate,
      notes,
    } = req.body;

    const supplierExists =
      await Supplier.findById(
        supplier
      );

    if (!supplierExists) {

      return res.status(404).json({
        success: false,
        message:
          "Supplier Not Found",
      });

    }

    let totalAmount = 0;

    for (const item of items) {

      const product =
        await Product.findById(
          item.product
        );

      if (!product) {

        return res.status(404).json({
          success: false,
          message:
            "Product Not Found",
        });

      }

      totalAmount +=
        item.quantity *
        item.costPrice;
    }

    const poNumber =
      `PO-${Date.now()}`;

    const purchaseOrder =
      await PurchaseOrder.create({
        poNumber,

        supplier,

        items,

        totalAmount,

        expectedDeliveryDate,

        notes,

        createdBy:
          req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Purchase Order Created",
      data: purchaseOrder,
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
GET ALL PURCHASE ORDERS
----------------------------------
*/

const getPurchaseOrders =
async (req, res) => {

  try {

    const orders =
      await PurchaseOrder.find()
      .populate(
        "supplier",
        "companyName supplierCode"
      )
      .populate(
        "createdBy",
        "name role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
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
GET PURCHASE ORDER BY ID
----------------------------------
*/

const getPurchaseOrderById =
async (req, res) => {

  try {

    const order =
      await PurchaseOrder.findById(
        req.params.id
      )
      .populate(
        "supplier"
      )
      .populate(
        "items.product"
      );

    if (!order) {

      return res.status(404).json({
        success: false,
        message:
          "Purchase Order Not Found",
      });

    }

    return res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        error.message,
    });

  }

};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
};