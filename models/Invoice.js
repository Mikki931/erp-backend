const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesOrder",
    },
    totalAmount: Number,
    GST: Number,
    dueDate: Date,
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
