const mongoose = require('mongoose');
require('dotenv').config();
const Account = require('./models/Account');
const Register = require('./models/register');
const Admin = require('./models/adminAccount');
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
// token校验
app.get('/api/authenticate', (req, res) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.status(200).json({
      code: 0,
    });
  } catch (err) {
    res.status(401).json({ error: 'Token 无效或已过期' });
  }
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
    res.status(200).json({
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
    res.status(200).json({
      code: 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '' });
  }
});
// 后台登录
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY; // 你的密钥
mongodb: app.post('/api/backLogin', async (req, res) => {
  try {
    const { account, password } = req.body;

    // findOne 如果找到会返回该文档对象，找不到则返回 null
    const user = await Admin.findOne({
      account,
      password,
    });

    // 3. 判断查询结果
    if (!user) {
      return res.status(400).json({ code: 1, message: '邮箱或密码错误' });
    }
    const token = jwt.sign({ account }, SECRET_KEY, { expiresIn: '2h' });

    // 4. 登录成功
    res.status(200).json({
      code: 0,
      message: '登录成功',
      token,
    });
  } catch (err) {
    res.status(500).json({ error: '服务器内部错误' });
  }
});
initWebSocket(server);
// 启动服务器
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {});
