const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "sales", "store", "production"],
      default: "sales",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Member", memberSchema);
