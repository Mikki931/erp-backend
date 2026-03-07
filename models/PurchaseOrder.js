const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    vendorName: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        rate: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Received"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
