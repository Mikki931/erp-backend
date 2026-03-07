const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    SKU: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ["raw", "finished"],
      default: "raw",
    },
    price: Number,
    currentStock: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
