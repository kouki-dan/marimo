//for debug
db = console.log
//end debug

var io = require("socket.io").listen(8124);

/***********
mysql> desc rank
    -> ;
+-------------+-------------+------+-----+---------+-------+
| Field       | Type        | Null | Key | Default | Extra |
+-------------+-------------+------+-----+---------+-------+
| twitterID   | varchar(10) | NO   | PRI | NULL    |       | 
| rank        | int(11)     | YES  |     | NULL    |       | 
| screen_name | varchar(15) | YES  |     | NULL    |       | 
+-------------+-------------+------+-----+---------+-------+
*************/

var mysql = require("mysql");
var client = mysql.createClient({
  user:"rank_twitter",
  password:"input rank_twitter's password",//悪用しないでね★
  database:"rank"
});

var Lobby = function(){
  this.server = {};
  this.serverPre = "server";
  this.count = 0;
  this.nanasisan = 0
  this.waiting = [];
}
Lobby.prototype.join = function(socket,msg){
  console.log(msg);
  if(msg.twitterID == "" || 
     msg.twitterID.search("nanasisan") != -1 ||
     msg.screen_name == ""){
    var userData = new Object();
    userData.twitterID = msg.twitterID;
    userData.rate = "no rate";
    userData.screen_name = " not login to twitter";
    this.push([socket,userData]);
  }
  else{
    client.query("SELECT * FROM rank WHERE twitterID = ?;",
      [msg.twitterID],
      function(err,results){
        var userData = new Object()
        if(results.length == 0){
          //user resisterd
          client.query("INSERT INTO rank(twitterID,screen_name,rank) " +
            "VALUES( ?, ?,1500);",
            [msg.twitterID,msg.screen_name],
            function(err,results){
              userData.twitterID = msg.twitterID;
              userData.screen_name = msg.screen_name;
              userData.rank = 1500;
              lobby.push([socket,userData]);
            }
          );
        }
        else{
          userData.twitterID = results[0].twitterID;
          userData.rank = results[0].rank;
          userData.screen_name = results[0].screen_name;
          lobby.push([socket,userData]);
          socket.emit("rate",{rate:userData.rank});
        }
      }
   );
  }
}
Lobby.prototype.push = function(obj){
  this.waiting.push(obj);
  this.match();
}
Lobby.prototype.match = function(){
  //人数がn人以下になるまでマッチし続ける
  var n = 2;
  while(this.waiting.length >= n){
//サーバーのネームスペース作成
    var serverName = this.serverPre + this.count++;
    this.makeServer(serverName);
    var p = [];
    for(var i = 0; i < n; i++){
       p[i] = this.waiting.shift();
    }
    var msgForP = [];
    for(var i = 0; i < p.length; i++){
      msgForP[i] = new Object();
      msgForP[i].me = p[i][1];
      msgForP[i].other = [];
      msgForP[i].serverName = serverName;
      for(var j = 0; j < p.length; j++){
        if(j != i){
          msgForP[i].other.push(p[j][1]);
        }
      }
    }
    for(var i = 0; i < p.length; i++){
      p[i][0].emit("ready",msgForP[i]);
    }
  }
}
Lobby.prototype.makeServer = function(serverName){
  this.server[serverName] = new Server(serverName);
}
Lobby.prototype.getName = function(){
  return "nanasisan" + (this.nanasisan++);
}
Lobby.prototype.exit = function(twitterID){
  for(var i = 0; i < this.waiting.length; i++){
    console.log(twitterID + "==" + this.waiting[i][1].twitterID);
    if(this.waiting[i][1].twitterID == twitterID){
      this.waiting.pop(i);
    }
  }
}

var Server = function(serverName){
  this.count = 0;
  this.results = [];
  var that = this;
  console.log("add namespace ~/" + serverName);
  var server = io.of("/"+serverName).on("connection",function(socket){
    db("connectioned");
    socket.on("line",function(msg){
      socket.broadcast.emit("line",msg);
    });
    socket.on("score",function(msg){
      //2人のスコアを相手に送る
      socket.broadcast.emit("score",msg);
      socket.get("twitterID",function(err,name){
        that.results.push([name,msg]);
        that.count++;
        if(that.count >= 2){
          //2人ともTwitterにログインしていたら
          var score = {}
          if(isFinite(that.results[0][0]) &&
             isFinite(that.results[1][0]) ){
            //rateを計算して反映
            score[that.results[0][0]] = (that.results[0][1].myScore +
                                        that.results[1][1].enemyScore)/2;
            score[that.results[1][0]] = (that.results[0][1].enemyScore+
                                        that.results[1][1].myScore)/2;
            updateRating(score);

          }
        }
      });
    });
    var time = 30;
    var timerID = setInterval(function(){
      socket.broadcast.emit("time",{time:time});
      time--;
      if(time < 0){
        socket.broadcast.emit("end",{end:"end"});
        clearInterval(timerID);
      }
    },1000);

  });
}

function updateRating(score){
  var count = 0;
  var rows = []
  for(x in score){
    client.query("SELECT * FROM rank WHERE twitterID = ?;",
      [x],
      function(err,results){
        count++;
        rows.push(results);
        if(count >= 2){
          //ここで結果登録
          p1 = {};
          p2 = {};

          p1.twitterID = rows[0][0].twitterID;
          p1.rank = rows[0][0].rank;
          p2.twitterID = rows[1][0].twitterID;
          p2.rank = rows[1][0].rank;
//ES=1/(10^(DR/400)+1)
//ES:期待勝率
  //DR:相手のレート-自分のレート
//新しいレート=古いレート+32({1 or 0.5 or 0} - ES)
          var dr = p2.rank - p1.rank;
          var es = 1/(Math.pow(10,(dr/400))+1);
          p1.es = es;
          p2.es = 1-es;
          
          if( score[p1.twitterID] < score[p2.twitterID]){
            //p2が勝った時
            p2.rank += 32*(1 - p2.es);
            p1.rank += 32*(0 - p1.es);
          }
          else{
            //p1が勝った時
            p1.rank += Math.floor(32*(1 - p1.es));
            p2.rank += Math.floor(32*(0 - p2.es));
          }
          //TODO:バグがなかったからここに書く
          //update処理
          client.query(
              "UPDATE rank SET rank=? WHERE twitterID=?;",
              [p1.rank,p1.twitterID] );
          client.query(
              "UPDATE rank SET rank=? WHERE twitterID=?;",
              [p2.rank,p2.twitterID] );

        }
      }
    );
  }
}

var lobby = new Lobby();
/*
lobby.join("socket",{
  twitterID:"102122",
})
lobby.join("socket",{
  twitterID:"102128",
  screen_name:"atyatya"
})
*/
io.sockets.on("connection",function(socket){
  //ユーザが接続してきたら実行される
  socket.on("join",function(msg){
    //msg.twitterID
    //msg.screen_name
    if(msg.twitterID == "undefined" || 
       msg.twitterID == "" ||
       msg.twitterID == undefined ||
       msg.twitterID == null){
      msg.twitterID = lobby.getName();
    }
    lobby.join(socket,{
      twitterID:msg.twitterID,
      screen_name:msg.screen_name
    });
    socket.set("twitterID",msg.twitterID);
    console.log("joined");
  });
  
  socket.on("exit",function(){
    socket.get("twitterID",function(err,name){
      lobby.exit(name);
      console.log("でてった");
    });
  });
  socket.on("disconnect",function(){
    //クライアントが切断された時実行
    socket.get("twitterID",function(err,name){
      console.log(name + " is exited");
      lobby.exit(name);
    });
  });

});

