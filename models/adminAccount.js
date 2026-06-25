// models/History.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  account: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now }, // 自动记录创建时间
});

module.exports = mongoose.model('Admin', adminSchema, 'admin');
