// ws.js
const { Server } = require('socket.io');

// 导出一个初始化函数
function initWebSocket(server) {
  // 将 Socket.IO 绑定到传入的 http server 上
  const io = new Server(server, {
    cors: {
      origin: '*', // 允许你的 Vue 前端跨域连接
    },
  });

  // 这里写你之前的监听逻辑
  io.on('connection', (socket) => {
    console.log('有页面通过 WebSocket 连进来了:', socket.id);
    // 广播给接收页（排除发送者自己）
    socket.broadcast.emit('create_connection', socket.id);
    // 监听发送页
    socket.on('send_message', (data) => {
      // 广播给接收页（排除发送者自己）
      socket.broadcast.emit('broadcast_message', data);
    });

    socket.on('disconnect', () => {
      console.log('用户断开连接:', socket.id);
    });
  });
}

// 🔴 关键：把这个函数导出
module.exports = initWebSocket;
