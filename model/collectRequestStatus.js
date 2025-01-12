const mongoose = require("mongoose");

const collectRequestStatusSchema = new mongoose.Schema(
  {
    collect_id: { type: String, required: true },
    status: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED"],
      default: "PENDING",
    },
    payment_method: { type: String },
    gateway: { type: String, required: true },
    transaction_amount: { type: Number },
    bank_refrence: { type: String },
  },
  {    timestamps: true,
    collection: "collect_request_status",
  }
);

module.exports = mongoose.model("CollectRequestStatus", collectRequestStatusSchema);

