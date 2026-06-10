// models/History.js
const mongoose = require('mongoose');

const RegisterSchema = new mongoose.Schema({
  company: { type: String },
  base: { type: String },
  email: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now }, // 自动记录创建时间
});

module.exports = mongoose.model('Register', RegisterSchema, 'register');
