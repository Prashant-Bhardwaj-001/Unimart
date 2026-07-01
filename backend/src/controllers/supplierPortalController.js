const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");

const getSupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      linkedUser: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
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

const getMyPurchaseOrders = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      linkedUser: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
    }

    const orders = await PurchaseOrder.find({
      supplier: supplier._id,
    })
      .populate("supplier", "companyName supplierCode")
      .populate("items.product", "name barcode sku")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptPurchaseOrder = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      linkedUser: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
    }

    const order = await PurchaseOrder.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (
      order.supplier.toString() !==
      supplier._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending orders can be accepted",
      });
    }

    order.status = "ACCEPTED";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Purchase order accepted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectPurchaseOrder = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      linkedUser: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
    }

    const order = await PurchaseOrder.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (
      order.supplier.toString() !==
      supplier._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending orders can be rejected",
      });
    }

    order.status = "REJECTED";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Purchase order rejected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markOrderAsShipped = async (
  req,
  res
) => {
  try {
    const supplier = await Supplier.findOne({
      linkedUser: req.user._id,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
    }

    const order = await PurchaseOrder.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    if (
      order.supplier.toString() !==
      supplier._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (order.status !== "ACCEPTED") {
      return res.status(400).json({
        success: false,
        message:
          "Order must be accepted first",
      });
    }

    order.status = "SHIPPED";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as shipped",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSupplierProfile,
  getMyPurchaseOrders,
  acceptPurchaseOrder,
  rejectPurchaseOrder,
  markOrderAsShipped,
};