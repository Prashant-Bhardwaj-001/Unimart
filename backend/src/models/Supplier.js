
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    supplierCode: {
      type: String,
      unique: true,
      required: true,
    },

    contactPerson: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    alternatePhone: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      default: "India",
    },

    pincode: {
      type: String,
      required: true,
    },

    gstNumber: {
      type: String,
      default: null,
    },

    website: {
      type: String,
      default: null,
    },

    notes: {
      type: String,
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
    linkedUser: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     default: null
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Supplier",
  supplierSchema
);