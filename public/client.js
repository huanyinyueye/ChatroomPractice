(function () {
  var d = document,
    w = window,
    p = parseInt,
    dd = d.documentElement,
    db = d.body,
    dc = d.compatMode == 'CSS1Compat',
    dx = dc ? dd : db,
    ec = encodeURIComponent;


  w.CHAT = {
    msgObj: d.getElementById("message"),
    pmsgObj: d.getElementById("pmessage"),
    screenheight: w.innerHeight ? w.innerHeight : dx.clientHeight,
    username: null,
    userid: null,
    socket: null,
    //讓瀏覽器卷動條保持在最低部
    scrollToBottom: function () {
      w.scrollTo(0, this.msgObj.clientHeight);
      w.scrollTo(0, this.pmsgObj.clientHeight);
    },
    
    //離開，本例只是一個簡單的更新
    logout: function () {
      //this.socket.disconnect();
      location.reload();
    },
    //傳送聊天訊息內容
    submit: function () {
      var content = d.getElementById("content").value;
      if (content != '') {
        
        var obj = {
          userid: this.userid,
          username: this.username,
          content: content
        };console.log(obj)
        this.socket.emit('message', obj);
        d.getElementById("content").value = '';
      }
      return false;
    },
    //傳送聊天訊息內容
    psubmit: function () {
      console.log('ya')
      var content = d.getElementById("contents").value;
      var to = d.getElementById("to").value;
        var obj = {
          userid: this.userid,
          username: this.username,
          to: to,
          content: content
        }
        console.log(obj)
        this.socket.emit('pmsg', obj);
        d.getElementById("contents").value = '';
        d.getElementById("to").value = '';
      
      return false;
    },
    genUid: function () {
      return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
    },
    //更新系統訊息，本例中在使用者加入、離開的時候呼叫
    updateSysMsg: function (o, action) {
      //目前線上使用者清單
      var onlineUsers = o.onlineUsers;
      //目前線上人數
      var onlineCount = o.onlineCount;
      //新加入使用者的訊息
      var user = o.user;

      //更新線上人數
      var userhtml = '';
      var separator = '';
      for (key in onlineUsers) {
        if (onlineUsers.hasOwnProperty(key)) {
          userhtml += separator + onlineUsers[key];
          separator = '、';
        }
      }
      d.getElementById("onlinecount").innerHTML = '目前共有 ' + onlineCount + ' 人線上，線上清單：' + userhtml;

      //加入系統訊息
      var html = '';
      html += '<div class="msg-system">';
      html += user.username;
      html += (action == 'login') ? ' 加入了聊天室' : ' 離開了聊天室';
      html += '</div>';
      var section = d.createElement('section');
      section.className = 'system J-mjrlinkWrap J-cutMsg';
      section.innerHTML = html;
      this.msgObj.appendChild(section);
      this.pmsgObj.appendChild(section);
      this.scrollToBottom();
    },
    //第一個界面使用者傳送使用者名稱
    usernameSubmit: function () {
      var username = d.getElementById("username").value;
      
      console.log(username)
      if (username != "") {
        d.getElementById("username").value = '';
        d.getElementById("loginbox").style.display = 'none';
        d.getElementById("chatbox").style.display = 'block';
        this.init(username);
      }
      return false;
    },
    goprivate: function () {
      this.scrollToBottom();
        d.getElementById("doc").style.display = 'none';
        d.getElementById("pdoc").style.display = 'block';  
      return false;
    },
    init: function (username) {
      /*
      用戶端根據時間和隨機數產生uid,這樣使得聊天室使用者名稱稱可以重復。
      實際專案中，若果是需要使用者登入，那麼直接采用使用者的uid來做標誌就可以
      */
      this.userid = this.genUid();
      this.username = username;

      d.getElementById("showusername").innerHTML = this.username;
      this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
      this.pmsgObj.style.minHeight = (this.screenheight - db.clientHeight + this.pmsgObj.clientHeight) + "px";
      
      this.scrollToBottom();

      //連線websocket後端伺服器
      this.socket = io.connect('http://127.0.0.1:3000/');

      //告訴伺服器端有使用者登入
      this.socket.emit('login', {
        userid: this.userid,
        username: this.username
      });

      //監聽新使用者登入
      this.socket.on('login', function (o) {
        CHAT.updateSysMsg(o, 'login');
      });

      //監聽使用者離開
      this.socket.on('logout', function (o) {
        CHAT.updateSysMsg(o, 'logout');
      });

      //監聽訊息傳送
      this.socket.on('message', function (obj) {
        var isme = (obj.userid == CHAT.userid) ? true : false;
        var contentDiv = '<div>' + obj.username + '說:'+obj.content + '</div>';

        var section = d.createElement('section');
        if (isme) {
          section.className = 'user';
          section.innerHTML = contentDiv ;
          section.style.float = 'right';
        } else {
          section.className = 'service';
          section.innerHTML = contentDiv;
        }
        CHAT.msgObj.appendChild(section);
        CHAT.scrollToBottom();
      });

      this.socket.on('pmsg', function (obj) {
        console.log(obj)
        var isme = (obj.userid == CHAT.userid) ? true : false;
        var contentDiv = '<div><font color="#FF0000" size="1">私訊 </font>' + obj.username + '說:'+obj.content + '</div>';

        var section = d.createElement('section');
        if (isme) {
          section.className = 'user';
          section.innerHTML = contentDiv ;
          section.style.float = 'right';
        } else {
          section.className = 'service';
          section.innerHTML = contentDiv;
        }
        CHAT.pmsgObj.appendChild(section);
        CHAT.scrollToBottom();
      });
    }
  };
  //透過“換行”傳送使用者名稱
  d.getElementById("username").onkeydown = function (e) {
    e = e || event;
    if (e.keyCode === 13) {
      CHAT.usernameSubmit();
    }
  };
  //透過“換行”傳送訊息
  d.getElementById("content").onkeydown = function (e) {
    e = e || event;
    if (e.keyCode === 13) {
      CHAT.submit();
    }
  };
})();