const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema(
  {
    customerName: {
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
        price: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SalesOrder", salesOrderSchema);
