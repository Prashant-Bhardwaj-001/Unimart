const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    taxPercentage: {
      type: Number,
      default: 0,
    },

    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
    },

    reorderLevel: {
      type: Number,
      default: 15,
    },

    reorderQuantity: {
      type: Number,
      default: 50,
    },

    unit: {
      type: String,
      enum: [
        "PCS",
        "KG",
        "GRAM",
        "LITRE",
        "ML",
        "BOX",
        "PACK",
      ],
      default: "PCS",
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
----------------------------------
TEXT SEARCH INDEX
----------------------------------
*/

productSchema.index({
  name: "text",
});

module.exports = mongoose.model(
  "Product",
  productSchema
);