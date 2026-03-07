const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    amount: Number,
    paymentDate: Date,
    method: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Bank"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
