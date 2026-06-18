const mongoose = require('mongoose');
require('dotenv').config();
const Account = require('./models/Account');
const Register = require('./models/register');
const initWebSocket = require('./models/ws');
mongoose
  .connect(process.env.MONGO_URL)
  // .connect('mongodb://127.0.0.1:27017/my_admin_db')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

const express = require('express');
const app = express(); // 解析 JSON 请求体 app.use(express.json());
const http = require('http');
const server = http.createServer(app);

const cors = require('cors');
app.use(cors());
app.use(express.json());
const crypto = require('crypto');

const KEY = Buffer.from(process.env.KEY_HEX, 'hex');
const IV = Buffer.from(process.env.IV_HEX, 'hex');
function decrypt(cipherText) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', KEY, IV);
  let decrypted = decipher.update(cipherText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
app.get('/', (req, res) => {
  // res.send('恭喜！后端服务器连接成功！');
});
// 邮箱注册
mongodb: app.post('/api/register', async (req, res) => {
  try {
    // 从 req.body 获取前端传来的数据
    const { company, base, email, password } = req.body;
    console.log(company, base, email, password);

    const newAccount = new Register({
      company,
      base,
      email,
      password: decrypt(password),
    });

    // // 保存到 MongoDB
    const savedData = await newAccount.save();
    // // 返回成功响应
    res.status(201).json({
      code: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '' });
  }
});
// 邮箱验证
mongodb: app.post('/api/verification', async (req, res) => {
  try {
    // 从 req.body 获取前端传来的数据
    const { email, date, password } = req.body;
    // // 创建一个新的文档实例

    const newAccount = new Account({
      email,
      password: decrypt(password),
    });

    // // 保存到 MongoDB
    const savedData = await newAccount.save();

    // // 返回成功响应
    res.status(201).json({
      code: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '' });
  }
});
initWebSocket(server);
// 启动服务器
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {});
