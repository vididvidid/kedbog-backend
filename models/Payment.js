const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentId:   { type: String, required: true, unique: true },
  merchantId:  { type: String, required: true },
  amount:      { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  issuedAt:    { type: Date, default: Date.now },
  expiredAt:   { type: Date },
  payeeName:   { type: String, required: true },
  payeeUpiId:  { type: String, required: true },
  // Optional URI fields for redirection
  redirectUri: { type: String },
  successUri:  { type: String },
  failureUri:  { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);