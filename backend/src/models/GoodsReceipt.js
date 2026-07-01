const mongoose = require("mongoose");

const goodsReceiptItemSchema =
  new mongoose.Schema(
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      orderedQuantity: {
        type: Number,
        required: true,
      },

      receivedQuantity: {
        type: Number,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

const goodsReceiptSchema =
  new mongoose.Schema(
    {
      grnNumber: {
        type: String,
        required: true,
        unique: true,
      },

      purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PurchaseOrder",
        required: true,
      },

      supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
      },

      items: [goodsReceiptItemSchema],

      notes: {
        type: String,
        default: null,
      },

      receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "GoodsReceipt",
  goodsReceiptSchema
);