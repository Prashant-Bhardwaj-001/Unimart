const mongoose = require("mongoose");

const orderItemSchema =
  new mongoose.Schema(
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      productName: {
        type: String,
        required: true,
      },

      barcode: {
        type: String,
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      costPrice: {
        type: Number,
        required: true,
      },

      sellingPrice: {
        type: Number,
        required: true,
      },

      taxPercentage: {
        type: Number,
        default: 0,
      },

      total: {
        type: Number,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

const orderSchema =
  new mongoose.Schema(
    {
      orderNumber: {
        type: String,
        unique: true,
        required: true,
      },

      items: [orderItemSchema],

      customerPhone: {
        type: String,
        default: null,
      },

      subTotal: {
        type: Number,
        required: true,
      },

      discount: {
        type: Number,
        default: 0,
      },

      taxAmount: {
        type: Number,
        default: 0,
      },

      grandTotal: {
        type: Number,
        required: true,
      },

      paymentMethod: {
        type: String,
        enum: [
          "CASH",
          "UPI",
          "CARD"
        ],
        required: true,
      },

      cashier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      status: {
        type: String,
        enum: [
          "COMPLETED",
          "CANCELLED",
          "REFUNDED"
        ],
        default: "COMPLETED",
      },
      customer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Customer",
  default: null,
},

loyaltyPointsEarned: {
  type: Number,
  default: 0,
},
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Order",
  orderSchema
);