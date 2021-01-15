const path = require('path')
const express = require('express')
//使用靜態資源存取,public為根目錄
var app = express()
app.use(express.static(path.join(__dirname, 'public')))
 
app.listen(8080, () => {
  console.log(`App listening at port 8080`)
})

// chat room
var server = require('http').createServer({})

server.listen(3000, function () {
  console.log('socketio API listening on *:3000');
});
var io = require('socket.io')(server);
//線上使用者
var onlineUsers = {};
var connectedUsers = {};
//目前線上人數
var onlineCount = 0;
io.on('connection', function (socket) {
  console.log('user connected');

  //監聽新使用者加入
  socket.on('login', function (obj) {
    //將新加入使用者的唯一標誌當作socket的名稱，後面離開的時候會用到
    socket.name = obj.userid;
    console.log(obj.username)
    //檢查線上清單，若果不在裡面就加入
    if (!onlineUsers.hasOwnProperty(obj.userid)) {
      onlineUsers[obj.userid] = obj.username;
      connectedUsers[obj.username] = socket
      //線上人數+1
      onlineCount++;
    }

    //向所有用戶端廣播使用者加入
    io.emit('login', {
      onlineUsers: onlineUsers,
      onlineCount: onlineCount,
      user: obj
    });
    console.log(obj.username + '加入了聊天室');
  });

  //監聽使用者離開
  socket.on('disconnect', function () {
    //將離開的使用者從線上清單中移除
    if (onlineUsers.hasOwnProperty(socket.name)) {
      //離開使用者的訊息
      var obj = {
        userid: socket.name,
        username: onlineUsers[socket.name]
      };

      //移除
      delete onlineUsers[socket.name];
      //線上人數-1
      onlineCount--;

      //向所有用戶端廣播使用者離開
      io.emit('logout', {
        onlineUsers: onlineUsers,
        onlineCount: onlineCount,
        user: obj
      });
      console.log(obj.username + '離開了聊天室');
    }
  });

  //監聽使用者發布聊天內容
  socket.on('message', function (obj) {
    //向所有用戶端廣播發布的訊息
    io.emit('message', obj);
    console.log(obj.username + '說：' + obj.content);
  });

    //監聽使用者發布聊天內容
    socket.on('pmsg', function (obj) {
      var to = obj.to;
      socket.emit('pmsg',obj)
      // console.log(connectedUsers[to])
      if(connectedUsers.hasOwnProperty(to)){
        connectedUsers[to].emit('pmsg',obj)
      }
    });
});


