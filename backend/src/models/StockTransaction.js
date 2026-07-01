const mongoose = require("mongoose");

const stockTransactionSchema =
new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    transactionType: {
      type: String,
      enum: [
        "STOCK_IN",
        "STOCK_OUT",
        "ADJUSTMENT"
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    previousStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    remarks: {
      type: String,
      default: null,
    },

    performedBy: {
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
  "StockTransaction",
  stockTransactionSchema
); 