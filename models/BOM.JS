const mongoose = require("mongoose");

const bomSchema = new mongoose.Schema(
  {
    finishedProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    materials: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("BOM", bomSchema);
