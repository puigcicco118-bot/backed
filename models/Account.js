// models/History.js
const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now }, // 自动记录创建时间
});

module.exports = mongoose.model('Account', AccountSchema, 'account');
