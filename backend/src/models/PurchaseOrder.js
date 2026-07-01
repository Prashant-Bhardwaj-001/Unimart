const mongoose = require("mongoose");

const purchaseOrderItemSchema =
new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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
  },
  {
    _id: false,
  }
);

const purchaseOrderSchema =
new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    items: [purchaseOrderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "SHIPPED",
        "DELIVERED",
        "CLOSED"
      ],
      default: "PENDING",
    },

    expectedDeliveryDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PurchaseOrder",
  purchaseOrderSchema
);