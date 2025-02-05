const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  // merchantId is automatically generated with a prefix
  merchantId:{ type: String, unique: true, default: () => 'MER-' + uuidv4() },
  fcmToken:  { type: String, default: null },
  upiId:     { type: String },
  upiName:   { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);