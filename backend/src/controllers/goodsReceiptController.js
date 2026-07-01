// const mongoose = require("mongoose");

// const Product = require(
//   "../models/Product"
// );

// const PurchaseOrder = require(
//   "../models/PurchaseOrder"
// );

// const GoodsReceipt = require(
//   "../models/GoodsReceipt"
// );

// const StockTransaction = require(
//   "../models/StockTransaction"
// );

// const receiveGoods = async (
//   req,
//   res
// ) => {
//   const session =
//     await mongoose.startSession();

//   session.startTransaction();

//   try {
//     const {
//       purchaseOrderId,
//       items,
//       notes,
//     } = req.body;

//     const purchaseOrder =
//       await PurchaseOrder.findById(
//         purchaseOrderId
//       ).session(session);

//     if (!purchaseOrder) {
//       await session.abortTransaction();

//       return res.status(404).json({
//         success: false,
//         message:
//           "Purchase Order Not Found",
//       });
//     }

//     if (
//       purchaseOrder.status !==
//       "SHIPPED"
//     ) {
//       await session.abortTransaction();

//       return res.status(400).json({
//         success: false,
//         message:
//           "Purchase Order must be SHIPPED first",
//       });
//     }

//     const grnNumber =
//       `GRN-${Date.now()}`;

//     const receiptItems = [];

//     for (const item of items) {
//       const product =
//         await Product.findById(
//           item.product
//         ).session(session);

//       if (!product) {
//         await session.abortTransaction();

//         return res.status(404).json({
//           success: false,
//           message:
//             "Product Not Found",
//         });
//       }

//       const previousStock =
//         product.stockQuantity;

//       product.stockQuantity +=
//         Number(
//           item.receivedQuantity
//         );

//       await product.save({
//         session,
//       });

//       await StockTransaction.create(
//         [
//           {
//             product: product._id,

//             transactionType:
//               "STOCK_IN",

//             quantity:
//               item.receivedQuantity,

//             previousStock,

//             newStock:
//               product.stockQuantity,

//             remarks:
//               "Goods Receipt",

//             performedBy:
//               req.user._id,
//           },
//         ],
//         { session }
//       );

//       receiptItems.push({
//         product: item.product,

//         orderedQuantity:
//           item.orderedQuantity,

//         receivedQuantity:
//           item.receivedQuantity,
//       });
//     }

//     const goodsReceipt =
//       await GoodsReceipt.create(
//         [
//           {
//             grnNumber,

//             purchaseOrder:
//               purchaseOrder._id,

//             supplier:
//               purchaseOrder.supplier,

//             items: receiptItems,

//             notes,

//             receivedBy:
//               req.user._id,
//           },
//         ],
//         { session }
//       );

//     purchaseOrder.status =
//       "DELIVERED";

//     await purchaseOrder.save({
//       session,
//     });

//     await session.commitTransaction();

//     return res.status(201).json({
//       success: true,
//       message:
//         "Goods Received Successfully",
//       data: goodsReceipt[0],
//     });
//   } catch (error) {
//     await session.abortTransaction();

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     session.endSession();
//   }
// };

// const getGoodsReceipts =
//   async (req, res) => {
//     try {
//       const receipts =
//         await GoodsReceipt.find()
//           .populate(
//             "supplier",
//             "companyName supplierCode"
//           )
//           .populate(
//             "receivedBy",
//             "name role"
//           )
//           .sort({
//             createdAt: -1,
//           });

//       return res.status(200).json({
//         success: true,
//         count: receipts.length,
//         data: receipts,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message:
//           error.message,
//       });
//     }
//   };

// const getGoodsReceiptById =
//   async (req, res) => {
//     try {
//       const receipt =
//         await GoodsReceipt.findById(
//           req.params.id
//         )
//           .populate(
//             "purchaseOrder"
//           )
//           .populate(
//             "supplier"
//           )
//           .populate(
//             "items.product"
//           );

//       if (!receipt) {
//         return res.status(404).json({
//           success: false,
//           message:
//             "Goods Receipt Not Found",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: receipt,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message:
//           error.message,
//       });
//     }
//   };

// module.exports = {
//   receiveGoods,
//   getGoodsReceipts,
//   getGoodsReceiptById,
// };

const Product = require("../models/Product");
const PurchaseOrder = require("../models/PurchaseOrder");
const GoodsReceipt = require("../models/GoodsReceipt");
const StockTransaction = require("../models/StockTransaction");

// ========================================================
// FIXED: Removed sessions to support standalone local MongoDB
// ========================================================
const receiveGoods = async (req, res) => {
  try {
    const { purchaseOrderId, items, notes } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order Not Found",
      });
    }

    if (purchaseOrder.status !== "SHIPPED") {
      return res.status(400).json({
        success: false,
        message: "Purchase Order must be SHIPPED first",
      });
    }

    const grnNumber = `GRN-${Date.now()}`;
    const receiptItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product Not Found",
        });
      }

      const previousStock = product.stockQuantity;

      // Ensure strict number parsing
      product.stockQuantity += Number(item.receivedQuantity);
      await product.save();

      // Log transaction ledger entry
      await StockTransaction.create([
        {
          product: product._id,
          transactionType: "STOCK_IN",
          quantity: Number(item.receivedQuantity),
          previousStock,
          newStock: product.stockQuantity,
          remarks: "Goods Receipt",
          performedBy: req.user._id,
        },
      ]);

      receiptItems.push({
        product: item.product,
        orderedQuantity: Number(item.orderedQuantity),
        receivedQuantity: Number(item.receivedQuantity),
      });
    }

    const goodsReceipt = await GoodsReceipt.create([
      {
        grnNumber,
        purchaseOrder: purchaseOrder._id,
        supplier: purchaseOrder.supplier,
        items: receiptItems,
        notes,
        receivedBy: req.user._id,
      },
    ]);

    purchaseOrder.status = "DELIVERED";
    await purchaseOrder.save();

    return res.status(201).json({
      success: true,
      message: "Goods Received Successfully",
      data: goodsReceipt[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getGoodsReceipts = async (req, res) => {
  try {
    const receipts = await GoodsReceipt.find()
      .populate("supplier", "companyName supplierCode")
      .populate("receivedBy", "name role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getGoodsReceiptById = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id)
      .populate("purchaseOrder")
      .populate("supplier")
      .populate("items.product");

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Goods Receipt Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  receiveGoods,
  getGoodsReceipts,
  getGoodsReceiptById,
};