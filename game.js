/*
ソースを見てくれてありがとうございますっ
とはいっても、あんまり特殊なこともやってないし、綺麗なコードでもないですけど・・・
こんなのでも参考になるなら参考にしてってください。
せっかくここを見てくれたので、ポイントの入り方について教えます。
緑（最初っから書いてある文字）を塗りつぶすと、1ピクセル300ポイント
何も書いていないとこを塗りつぶすと、1ピクセル15ポイント。
相手の色を塗りつぶすと、1ピクセル8ポイント。
になっております！
アンチエイリアスの部分は多分点数入らないです。
これが陣取りゲームのすべてでした。

Thank you for looking this source code.
But sorry, this code is not beautiful.
However, I'm glad if this code helps you.
I'll tell you that how to get point.
green(character) → my color is 300 point per 1pixel.
Not written → my color is 15 point per 1pixel.
An opponent color → my color is 8 point per 1pixel.
That's all!
You don't get point anti-aliasing place.
Thank you for playing game!! and reading this!!

Good bye!

斉藤洸紀(@dangiruba)
*/

//enchant.nineleap.memory.LocalStorage.GAME_ID = 1283;
//enchant.nineleap.memory.LocalStorage.DEBUG_MODE = true;

var ctx;
enchant();

var Socket = function(msg){
  //msg.twitterID,msg.screen_name
  var addr = "http://182.163.60.121:8124";
  var userData = {twitterID:msg.twitterID,
                  screen_name:msg.screen_name};
  this.socket = io.connect(addr);
  this.socket.emit("join",userData);

  this.socket.on("rate",function(msg){
    canvas.addRate(msg.rate);
  });

  var that = this;
  this.socket.on("ready",function(msg){
    //2人揃った時に実行される
    canvas.newChallenger();
    canvas.addEnemyData({screen_name:msg.other[0].screen_name,
                         rank:msg.other[0].rank});
    that.server = io.connect(addr+"/"+msg.serverName);
    that.server.emit("entry",{entry:"entry"});
    that.server.on("line",function(msg){
      canvas.enemyLine(msg.prev,msg.next);
    });
    that.server.on("score",function(msg){
      //スコアを計算。
      var myScore = Math.floor((canvas.myScore + msg.enemyScore)/2);
      var enemyScore = Math.floor((canvas.enemyScore + msg.myScore)/2);
      canvas.myScore = myScore;
      canvas.enemyScore = enemyScore;
      canvas.scoreReceived = true;
      //trueにすることで、endの32フレーム以降に行くことができる。JUMP!
    });
    that.server.on("time",function(msg){
      if(msg.time == 23){
        game.popScene();
        canvas.gameStart();
      }
      if(msg.time == 28){
        canvas.isPear = true;
      }
      canvas.syncSecond(msg.time);
    });
    that.server.on("end",function(msg){
      canvas.syncSecond(0);
    });
  });
}
Socket.prototype.emit = function(type,msg){
  if(this.server == undefined){
    return;
  }
  this.server.emit(type,msg);
}
Socket.prototype.exit = function(){
  this.socket.emit("exit",{});
}

var Canvas = enchant.Class.create(enchant.Sprite,{
  initialize:function(){
    enchant.Sprite.call(this,320,320);
    this.surface = new Surface(320,320);
    this.image = this.surface;
    this.isConnectNetwork = false;
    this.endFlag = false;
    this.scoreReceived = false;
    this.isPear = false;

//scrarch!!　と書きこむ
    this.data = "";
    var ctx = this.surface.context;
    ctx.font = "52px 'ＭＳ Ｐゴシック'";
    ctx.fillStyle = "RGB(0,255,0)";
    var txt = "SCRATCH!!!";
    var metrics = ctx.measureText(txt);
    ctx.fillText(txt,160-metrics.width/2,110);
    txt = "擦れ！！！";
    metrics = ctx.measureText(txt);
    ctx.fillText(txt,160-metrics.width/2,210);

//pointの重み設定
    this.p1 = 8;//相手を上書き
    this.p2 = 300; //最初から書いてあった文字
    this.p3 = 15; //何も書いてない場所
    
//pointのラベル
//myPoint
    this.myPointLabel = new Label("My point:0");
    this.myPointLabel.point = 0;
    this.myPointLabel.x = 5;
    this.myPointLabel.y = 20;
    this.myPointLabel.color = "RGB(0,0,0)";
    this.myPointLabel._style.zIndex = 2;
    this.myPointLabel.update = function(point){
      if(this.endFlag)
        return;
      this.point += point;
      this.text = "My point:"+this.point;
    };
    game.rootScene.addChild(this.myPointLabel);
//enemyPoint
    this.enemyPointLabel = new Label("Enemy point:0");
    this.enemyPointLabel.point = 0;
    this.enemyPointLabel.x = 5;
    this.enemyPointLabel.y = 290;
    this.enemyPointLabel.color = "RGB(0,0,0)";
    this.enemyPointLabel._style.zIndex = 2;
    this.enemyPointLabel.update = function(point){
      if(this.endFlag)
        return;
      this.point += point;
      this.text = "Enemy point:"+this.point;
    };
    game.rootScene.addChild(this.enemyPointLabel);

//残り時間のラベル
    this.restTimeLabel = new Label("20:00");
    this.restTimeLabel.time = 20.0;
    this.restTimeLabel.x = 280;
    this.restTimeLabel.y = 12;
    this.restTimeLabel.color = "RGB(255,0,0)";
    this.restTimeLabel._style.zIndex = 2;
    this.restTimeLabel.sync = function(second){
      this.time = second;
    }
    game.rootScene.addChild(this.restTimeLabel);

    this.restTimeLabelEnterFrame = function(){
      this.time-= 1/16;
      var txt = "";
      if(this.time < 10){
        txt += "0";
      }
      txt += this.time.toFixed(2);
      this.text = txt;
      if(this.time < 0){
        this.text = "00.00";
        clearInterval(that.timerID);
/*******************************
 *
        //ゲーム終了****************
                                      *
  ************************************/
 //       game.memory.player.data = {}
        if(that.login){
          game.memory.player.data.data = that.data;
          game.memory.player.data.test = "test";
          game.memory.update();
        }
        this.removeEventListener("enterframe",arguments.callee);
        that.endFlag = true; 
        that.end();
//スコアを送信
        if(that.isConnectNetwork){
          socket.emit("score",{myScore:that.myScore,
                            enemyScore:that.enemyScore});
        }
      }
    }
 
    var that = this;
    this.restTimeLabel.addEventListener("enterframe",this.restTimeLabelEnterFrame );
    
    this.myColor = "rgb(255,242,0)";
    this.enemyColor = "rgb(255,174,201)";

    this.myColorRGB = [255,242,0,255];
    this.enemyColorRGB = [255,174,201,255];

    this.addEventListener("touchstart",function(e){
      this.prevX = e.x;
      this.prevY = e.y;
      this.penDown = true;
    });
    this.addEventListener("touchmove",function(e){
      if(!this.penDown)
        return ;
      var nextX = e.x;
      var nextY = e.y;   

      var prev = {x:this.prevX,y:this.prevY}; 
      var next = {x:nextX,y:nextY};
      this.myLine(prev,next);
      
      this.prevX = nextX;
      this.prevY = nextY;
    });
    this.addEventListener("touchend",function(e){
      this.penDown = false;
    });
  },
  myLine:function(prev,next){
    this.data+=encode(prev.x);
    this.data+=encode(prev.y);

//ポイント集計ーlineを書く前
    var colorSet = [this.enemyColorRGB,[0,255,0,255],[0,0,0,0]];
    var sx = Math.min(prev.x,next.x)-7;
    var sy = Math.min(prev.y,next.y)-7;
    var ax = Math.max(prev.x,next.x)-sx+7;
    var ay = Math.max(prev.y,next.y)-sy+7;
    var prevColor = this.getCanvasData(sx,sy,ax,ay,colorSet);

    this.line(prev,next,this.myColor);

//lineを書いた後のポイント集計
    var nowColor = this.getCanvasData(sx,sy,ax,ay,colorSet);
    var point = (prevColor[0]-nowColor[0])*this.p1 + 
                (prevColor[1]-nowColor[1])*this.p2 +
                (prevColor[2]-nowColor[2])*this.p3;
    this.myPointLabel.update(point);

//座標を送信
    if(this.isConnectNetwork && this.isPear)
      socket.emit("line",{prev:prev,next:next});

  },
  enemyLine:function(prev,next){
    var colorSet = [this.myColorRGB,[0,255,0,255],[0,0,0,0]];
    var sx = Math.min(prev.x,next.x)-7;
    var sy = Math.min(prev.y,next.y)-7;
    var ax = Math.max(prev.x,next.x)-sx+7;
    var ay = Math.max(prev.y,next.y)-sy+7;
    var prevColor = this.getCanvasData(sx,sy,ax,ay,colorSet);

    this.line(prev,next,this.enemyColor);

    var nowColor = this.getCanvasData(sx,sy,ax,ay,colorSet);
    var point = (prevColor[0]-nowColor[0])*this.p1 + 
                (prevColor[1]-nowColor[1])*this.p2 +
                (prevColor[2]-nowColor[2])*this.p3;
    this.enemyPointLabel.update(point);

  },
  setEnemyData:function(data,name){
    this.enemyData = data;
  },
  startEnemy:function(){
    this.dataNum = this.enemyData.length/2;
    var time = 20.0/this.dataNum * 1000;
    var i = 0;
    var that = this;
    var prevX = decode(this.enemyData[i++]);
    var prevY = decode(this.enemyData[i++]);

    var timerID = setInterval(function(){
      var x = decode(that.enemyData[i++]);
      var y = decode(that.enemyData[i++]);
      that.enemyLine({x:prevX,y:prevY},
                {x:x,y:y});
      prevX = x;
      prevY = y;

    },time);
    this.timerID = timerID;

  },
  line:function(prev,next,color){
    var ctx = this.surface.context;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = "13";
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(prev.x,prev.y);
    ctx.lineTo(next.x,next.y);
    ctx.stroke();
    
  },
  getCanvasData:function(x,y,ax,ay,colorSet){
    var ctx = this.surface.context;
    var imagedata = ctx.getImageData(x,y,ax,ay);
    var data = imagedata.data;
    var colors = colorSet;
    var counts = [];
    for(var i = 0; i < colorSet.length; i++){
      counts[i] = 0;
    }
// 改良前   
    for(var i = 0; i < data.length/4; i++){
      for(var k = 0; k < colors.length; k++){
        var j;
        for(j = 0; j < 4; j++){
          if(data[i*4+j] != colors[k][j]){
            break;
          }
        }
        if(j == 4){
          counts[k]++;          
        }
      }
    }

/*//改良後 ~作成中。むずかしい
    var x2 = x+ax;
    var y2 = y+ay;
    var a = 1.0*(-1*y2 - -1*y) / (x2 - x);
    if(a == 0){
      var b = 0;
    }
    else if(x == 0){
      x++;
    }
    else{
      var b = y/(a*x);
    }
    

    var distance = 

    for(var i = 0; i < imagedata.width;i++){
      var firstY = a * i + b - 7;
      var endY = a * i + b + 7;
    }
    */ 
    return counts;
  },
  addMyData:function(data){
    //自分用のラベル
    this.myName = data.screen_name;
    if(this.myLabel == undefined){
      this.myLabel = new Label("~MyData~ name:"+data.screen_name + 
                             ",rate:"+data.rank);
      this.myLabel.addEventListener("enterframe",function(){
        this.x -= 2;
        if(this.x <= -320){
          this.x = 320;
        }
      });
      game.rootScene.addChild(this.myLabel);
    }
    else{
      this.myLabel.text = "~MyData~ name:"+data.screen_name + 
                          ",rate:"+data.rank;
    }
    this.myLabel.y = 0;
    this.myLabel.x = 30;
    this.myLabel.font = "12px monospace";
    this.myLabel.color = "RGB(0,0,255)";
  },
  addEnemyData:function(data){
    //相手用のラベル
    this.enemyName = data.screen_name;
    if(this.enemyLabel == undefined){
      this.enemyLabel = new Label("~enemyData~ name:"+data.screen_name + 
                             ",rate:"+data.rank);
      this.enemyLabel.addEventListener("enterframe",function(){
        this.x -= 2;
        if(this.x <= -320){
          this.x = 320;
        }
      });
      game.rootScene.addChild(this.enemyLabel);
    }
    else{
      this.enemyLabel.text = "~enemyData~ name:"+data.screen_name+
                             ",rate:"+data.rank;
    }
    this.enemyLabel.y = 305;
    this.enemyLabel.x = 30;
    this.enemyLabel.font = "12px monospace";
    this.enemyLabel.color = "RGB(0,0,255)";
  },
  gameStart:function(){
    var scene = new Scene();
    game.pushScene(scene);
    var count = new Sprite(320,320);
    var overlay = new Sprite(320,320);

    var surface = new Surface(320,320);
    overlay.image = surface;

    scene.addChild(count);
    scene.addChild(overlay);

    var ctx = surface.context;
    ctx.fillStyle = "RGB(0,0,0)";
    var r;
    var theta = Math.PI*2/12;
    var that = this;
    count.addEventListener("enterframe",function(){
      if(this.frame == 0){
        that.countdownFlag = true;       
        r = -3;
        this.image = game.assets["three.png"];
      }
      else if(this.frame == 4){
        that.startPicture = false;
      }
      else if(this.frame == 16){
        r = -3;
        ctx.clearRect(0,0,320,320);
        this.image = game.assets["two.png"];
      }
      else if(this.frame == 32){
        r = -3;
        ctx.clearRect(0,0,320,320);
        this.image = game.assets["one.png"];
      }
      else if(this.frame == 48){
        game.popScene();
        that.countdownFlag = false;
        this.removeEventListener("enterframe",arguments.callee);
        if(that.isConnectNetwork == false){
          that.startEnemy();
        }
      }

      if(that.countdownFlag == false){
        game.popScene();
        this.removeEventListener("enterframe",arguments.callee);
        this.frame = 0;
      }

      if(4 <= this.frame && this.frame < 16){
        ctx.beginPath();
        ctx.moveTo(160,160);
        ctx.arc(160,160,227,theta*r,theta*(r+1),false)
        ctx.closePath();
        ctx.fill();
        r++;
      }
      else if(20 <= this.frame && this.frame < 32){
        ctx.beginPath();
        ctx.moveTo(160,160);
        ctx.arc(160,160,227,theta*r,theta*(r+1),false);
        ctx.closePath();
        ctx.fill();
        r++;
      }
      else if(36 <= this.frame && this.frame < 48){
        ctx.beginPath();
        ctx.moveTo(160,160);
        ctx.arc(160,160,227,theta*r,theta*(r+1),false)
        ctx.closePath();
        ctx.fill();
        r++;
      }

      this.frame++;
    });
  },
  end:function(){
    var scene = new Scene();
    var surface = new Surface(320,320);
    var sprite = new Sprite(320,320);
    sprite.image = surface;
    sprite.a = 0.05;

    this.myScore = this.myPointLabel.point;
    this.dMyScore = Math.floor(this.myScore / 36);
    this.enemyScore = this.enemyPointLabel.point;
    this.dEnemyScore = Math.floor(this.enemyScore / 36);

    sprite.timeOutCount = 0;
    var that = this;
    sprite.addEventListener("enterframe",function(){
      if(this.frame <= 20){
        var ctx = this.image.context;
        ctx.fillStyle = "RGBA(255,255,255,"+this.a+")";
        ctx.clearRect(0,0,320,320);
        ctx.fillRect(0,0,320,320);
        sprite.a += 0.05;
      }
      else if(this.frame <= 31){
        //ネットワークにつながってる場合、スコアが届くのを待つ
        if(that.isConnectNetwork){
          this.timeOutCount++;
          if(this.timeOutCount >= 16*5){
            //Timeout
            alert("Sorry, Timeout...");
            this.timeOutCount = -100;
          }
          else if(that.scoreReceived == false){
            return ;
          }
        }
      }
      else if(this.frame <= 32){
        this.myName = new Label(that.myName);
        this.myName.width = 160;
        this.myName.y = 70;
        this.myName.x = 0;
        this.myName._style.textAlign = "center";
        this.enemyName = new Label(that.enemyName);
        this.enemyName.width = 160;
        this.enemyName.y = 70;
        this.enemyName.x = 160;
        this.enemyName._style.textAlign = "center";

        this.myScore = new Label("00000000");
        this.myScore.width = 160;
        this.myScore.y = 180;
        this.myScore.x = 0;
        this.myScore.score = 0;
        this.myScore._style.textAlign = "center";
        this.myScore._style.fontWeight = "bold";
        this.myScore._style.fontSize = "26px";
        this.myScore.update = function(d){
          this.score += d;
          var l = (this.score+"").length;
          this.text = new Array(8-l).join("0");
          this.text += this.score;
        }
        this.enemyScore = new Label("00000000");
        this.enemyScore.width = 160;
        this.enemyScore.y = 180;
        this.enemyScore.x = 160;
        this.enemyScore.score = 0;
        this.enemyScore._style.textAlign = "center";
        this.enemyScore._style.fontWeight = "bold";
        this.enemyScore._style.fontSize = "26px";
        this.enemyScore.update = function(d){
          this.score += d;
          var l = (this.score+"").length;
          this.text = new Array(8-l).join("0");
          this.text += this.score;
        }

        scene.addChild(this.myName);
        scene.addChild(this.enemyName);
        scene.addChild(this.myScore);
        scene.addChild(this.enemyScore);
      }
      else if(/*32<*/ this.frame <= 64){
        this.myScore.update(that.dMyScore);
        this.enemyScore.update(that.dEnemyScore);
      }
      else if(this.frame <= 65){
        this.myScore.text = that.myScore;
        this.enemyScore.text = that.enemyScore;
      }
      else if(this.frame <= 66){
        var win = new Sprite(160,100);
        var lose = new Sprite(160,100);
        win.image = game.assets["win.png"];
        lose.image = game.assets["lose.png"];
        win.y = lose.y = 90;
        if(that.myScore >= that.enemyScore){
          win.x = 0; 
          lose.x = 160;
        }
        else{
          win.x = 160;
          lose.x = 0;
        }
        scene.addChild(win);
        scene.addChild(lose);
      }
      else if(this.frame <= 82){
      }
      else if(this.frame <= 83){
        if(that.myScore >= that.enemyScore){
          var message = "@"+this.enemyName.text+
                  "さんに勝利！！ WIN!! score:"+that.myScore;
        }
        else{
          var message = "@"+this.enemyName.text+
                  "さんに敗北(´・ω・`)  LOSE... score:"+that.myScore;
        }
        game.end(that.myScore,message)
      }
      this.frame++;
    });
    scene.addChild(sprite);
    game.pushScene(scene);
  },
  _init:function(){
    var ctx = this.surface.context;
    ctx.clearRect(0,0,320,320);
    ctx.font = "52px 'ＭＳ Ｐゴシック'";
    ctx.fillStyle = "RGB(0,255,0)";
    var txt = "SCRATCH!!!";
    var metrics = ctx.measureText(txt);
    ctx.fillText(txt,160-metrics.width/2,110);
    txt = "擦れ！！！";
    metrics = ctx.measureText(txt);
    ctx.fillText(txt,160-metrics.width/2,210);

//point label
//my
    this.myPointLabel.point = 0;
    this.myPointLabel.update(0);
//enemy
    this.enemyPointLabel.point = 0;
    this.enemyPointLabel.update(0);

//残り時間
//    this.restTimeLabel.removeEventListener("enterframe",this.restTimeLabelEnterFrame);
    this.restTimeLabel.time = 20.0;
    this.restTimeLabel.text = "20.00";
//    this.restTimeLabel.addEventListener("enterframe",this.restTimeLabelEnterFrame );   
    this.endFlag = false;
    this.data = "";
//動いてるenemyを止める
    clearInterval(this.timerID);
  },
  newChallenger:function(user){
    this.isConnectNetwork = true;
    this._init();

    if(this.startPicture){
      game.popScene();
    }

    this.countdownFlag == false;

    var overlay = new Scene();
    var sprite = new Sprite(320,320);
    sprite.image = game.assets["start2.png"];
    overlay.addChild(sprite);
    game.pushScene(overlay);
    
//connecting...
    var connect = new Label("接続中...<br />connecting...");
    connect.x = 30;
    connect.y = 240;
    connect._style.textAlign = "center";
    connect.font = '24px "ＭＳ ゴシック"';
    connect.color  = "#fff";
    var move = function(){
      this.x += -3;
      if(this.x <= -260){
        this.x = 300;
      }
    };
    connect.addEventListener("enterframe",move);
    overlay.addChild(connect);
//New challenger!!!
    var challenger = new Label("New challenger!!!<br />挑戦者が現れました。");
    challenger.width = 320;
    challenger._style.textAlign = "center";
    challenger.y = 100;
    challenger.x = 0;
    challenger.font = '24px "ＭＳ ゴシック"';
    challenger.color  = "#fff";
    overlay.addChild(challenger);
  },
  syncSecond:function(second){
    this.restTimeLabel.sync(second);
  },
  addRate:function(rate){
    this.myLabel.text = "~MyData~ name:"+this.myName
                            + ",rate:" + rate ;
  }
}
);

var socket;
var canvas;

window.unonload = function(){
  socket.exit();
}
window.onload = function() {
    game = new Game(320, 320);
    
    game.fps = 16;
    game.preload("three.png","two.png","one.png",
                "win.png","lose.png","start2.png");
    game.memory.player.preload();
    game.memories.recent.preload();
    game.onload = function() {
      document.body.removeChild(document.getElementById("loading"));
      
      canvas = new Canvas();
      canvas.startPicture = true;
      game.rootScene.addChild(canvas);
      game.rootScene.backgroundColor ="#eee";

      var userData = game.memory.player;
      var myrank ;
      if(game.memory.player.data == undefined){
        canvas.login = false;
        myrank = 0;
        userData = {twitterID:"",
                    screen_name:"You(not login)"};
      }
      else{
        canvas.login = true;
        if(game.memory.player.data.rank == null){
          game.memory.player.data.rank = 1500;
        }
        myrank = game.memory.player.data.rank;
        userData = {twitterID:userData.twitterID+"",
                  screen_name:userData.screen_name};
      }
      console.log(userData);

      socket = new Socket(userData); //Socket.io
    
      var len = game.memories.recent.length;
      var c = 0,n;
      while(true){
        if(c >= 100){
          n = 0;
          break
        }
        n = Math.floor(Math.random() * len);
        if(game.memories.recent[n].data.data == undefined){
          continue;
        }
        break;
      }
      var enemyData = game.memories.recent[n].data.data;
//ghostボーナス。（という名のバグ抑止
      enemyData+=encode(160);
      enemyData+=encode(140);
      enemyData+=encode(180);
      enemyData+=encode(200);
      
      canvas.setEnemyData(enemyData);


      var enemy_name = game.memories.recent[n].screen_name;
      var enemy_rank = game.memories.recent[n].data.rank;

      var my_name = userData.screen_name;
      var my_rank = myrank;

      canvas.addMyData({screen_name:my_name,
                        rank:my_rank});
      canvas.addEnemyData({screen_name:enemy_name+"'s ghost",
                           rank:enemy_rank});

      canvas.gameStart();

    };
    game.start();
};

function encode(num){
  return String.fromCharCode.apply(null,[num+40]);
}
function decode(c){
  return c.charCodeAt(0)-40;
}


