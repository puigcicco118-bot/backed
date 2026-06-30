// ws.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
function validateUser(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
  } catch (err) {}
}
// 导出一个初始化函数
function initWebSocket(server) {
  // 将 Socket.IO 绑定到传入的 http server 上
  const io = new Server(server, {
    cors: {
      origin: '*', // 允许你的 Vue 前端跨域连接
    },
  });
  io.use((socket, next) => {
    //从前端传过来的 auth 对象中提取参数
    // const token = socket.handshake.auth.token;
    // 1. 从前端传过来的 auth 对象中提取 token 和免密标志
    const { token, anonymous } = socket.handshake.auth;
    // 2. 🟢 条件放行：如果是特定的免验证页面（比如你设置了 anonymous: true）
    if (anonymous) {
      // 可以在 socket 上挂载一个标识，方便后续在 connection 里区分
      socket.isAnonymous = true;
      return next();
    }

    // 执行身份校验
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      next();
    } catch (err) {
      // const err = new Error('Authentication error: 身份校验失败');
      err.data = { code: 401, message: 'Token 无效或已过期' }; // 可选：向前端传递额外的错误对象
      next(err);
    }
  });

  // 这里写你之前的监听逻辑
  io.on('connection', (socket) => {
    console.log('有页面通过 WebSocket 连进来了:', socket.handshake.auth.roomId);
    // 广播给接收页（排除发送者自己）
    if (socket.handshake.auth.needOpen) {
      socket.broadcast.emit('create_connection', socket.handshake.auth.roomId);
    }
    const roomId = socket.handshake.auth.roomId;
    if (roomId) {
      socket.join(roomId);
    }
    socket.on('return2step1', () => {
      // 广播给接收页（排除发送者自己）
      io.to(roomId).emit('return2step1');
    });
    // 监听发送页
    socket.on('send_message', (data) => {
      console.log(data);
      // 广播给接收页（排除发送者自己）
      io.to(roomId).emit('input_info', data);
    });
    socket.on('step2_vaild_info', (data) => {
      console.log(data, '=-=-=');
      io.to(roomId).emit('step2_vaild_info', data);
    });
    socket.on('error_message', (data) => {
      console.log(data, '++++++++++++');
      io.to(roomId).emit('error_message', data);
    });
    socket.on('disconnect', () => {
      console.log('用户断开连接:', socket.id);
    });
  });
}

// 🔴 关键：把这个函数导出
module.exports = initWebSocket;
