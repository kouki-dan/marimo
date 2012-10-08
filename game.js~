/*
   MITらいせんす（略)
*/

enchant();

//enchant.nineleap.memory.LocalStorage.DEBUG_MODE = true;

var game;
var bg;
var marimo;
var _data;


var EXPRESSIONS = function(){
  this.NORMAL_EYE = 1;
  this.NORMAL_MOUSE = 2;
  this.SAD_EYE = 3;
  this.ABSENCE_MOUSE = 4;

  this.eye = this.NORMAL_EYE;
  this.mouse = this.NORMAL_MOUSE;

  this.style = "RGB(0,70,30)";
}
EXPRESSIONS.prototype.set_eye = function(eye){
  this.eye = eye;
}
EXPRESSIONS.prototype.set_mouse = function(mouse){
  this.mouse = mouse;
}
EXPRESSIONS.prototype.draw = function(ctx,r){
  switch(this.eye){
    case this.NORMAL_EYE:
      this._render_normal_eye(ctx,r);
      break;
    case this.SAD_EYE:
      this._render_sad_eye(ctx,r);
      break;
  }
  switch(this.mouse){
    case this.NORMAL_MOUSE:
      this._render_normal_mouse(ctx,r);
      break;
    case this.ABSENCE_MOUSE:
      this._render_absence_mouse(ctx,r);
      break;
  }
}
EXPRESSIONS.prototype._render_normal_eye = function(ctx,r){
  //普通の目を表示
  ctx.fillStyle = this.style;
  ctx.beginPath();
  ctx.arc(r-r/2,r+r/4,r/15,0,2*Math.PI,true);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(r+r/2,r+r/4,r/15,0,2*Math.PI,true);
  ctx.fill();
}
EXPRESSIONS.prototype._render_sad_eye = function(ctx,r){
  //><の目
  ctx.strokeStyle = this.style;
  ctx.beginPath();
  ctx.moveTo(r-r/1.7,r+r/3.2);
  ctx.lineTo(r-r/2.3,r+r/4.2);
  ctx.lineTo(r-r/1.65,r+r/5.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(r+r/1.7,r+r/3.2);
  ctx.lineTo(r+r/2.3,r+r/4.2);
  ctx.lineTo(r+r/1.65,r+r/5.2);
  ctx.stroke();
}
EXPRESSIONS.prototype._render_normal_mouse = function(ctx,r){
  //にこっとした普通の口
  ctx.strokeStyle = this.style;
  ctx.beginPath();
  ctx.moveTo(r-r/2.5,r+r/2.2);
  ctx.quadraticCurveTo(r,r+r/1.4,r+r/2.5,r+r/2.2);
  ctx.stroke();
}
EXPRESSIONS.prototype._render_absence_mouse = function(ctx,r){
  ctx.beginPath();
  ctx.moveTo(r-r/5.5,r+r/2);
  ctx.lineTo(r+r/5.5,r+r/2);
  ctx.stroke();
}

var Marimo  = Class.create(Sprite, {
  initialize:function(r){
    Sprite.call(this,2*r,2*r);
    this.surface = new Surface(2*r,2*r);
    this.ctx = this.surface.context;
    this.dragging = false;
    this.r = r;
    this.prevX = this.prevY = this.offsetX = this.offsetY = 0;
    this._style.zIndex = 13;
    this.x = 160-r;
    this.gx = 0;
    this.gy = 1;
    this.prevTouchTime = new Date();

    this.m = r/150;

    this.vx = 0;
    this.vy = 0;

    this.addEventListener(Event.ENTER_FRAME,this.tick);
    this.addEventListener(Event.TOUCH_START,this.touch_start);
    this.addEventListener(Event.TOUCH_MOVE ,this.touch_move);
    this.addEventListener(Event.TOUCH_END  ,this.touch_end);
    var that = this;
    document.getElementById("enchant-stage").addEventListener("mouseout",
       function(e){
        if(e.pageX < 0 || 320 < e.pageX ||
          e.pageY < 0 || 320 < e.pageY){
          that.touch_end()
        }
      }
    ,true);

    this.draw_marimo(r);

//表情
    this.expressions = new EXPRESSIONS();
    this.expressions.set_eye(this.expressions.SAD_EYE);
    this.expressions.set_mouse(this.expressions.ABSENCE_MOUSE);
    this.expressions.draw(this.ctx,r);
       
    this.image = this.surface;

    //加速度センサーイベント
    var that = this;
    window.addEventListener("devicemotion",function(e){
      var gv = e.accelerationIncludingGravity;

      that.gx = gv.x/10;
      that.gy = gv.y/10*-1;
    },true);
  },
  tick:function(){
    if(this.dragging){
      return ;
    }

    this.vy += 0.98*this.m*this.gy;
    this.vx += 0.98*this.gx;

    this.y += this.vy;
    this.x += this.vx;

    this.vx *= 0.995;
    this.vy *= 0.995;

    this._colision();
  },
  touch_start:function(e){
    //ダブルタッチ判断
    var now = new Date();
    if( now - this.prevTouchTime <= 300){
      take_picture();
      return ;
    }
    this.prevTouchTime = new Date();

    if((this.x-e.x+this.r)*(this.x-e.x+this.r) + 
    (this.y-e.y+this.r)*(this.y-e.y+this.r) <= this.r*this.r){
      this.dragging = true;
      this.vx = 0;
      this.vy = 0;
      this.offsetX = e.x-this.x;
      this.offsetY = e.y-this.y;
      this.prevX = e.x-this.offsetX;
      this.prevY = e.y-this.offsetY;
    }
  },
  touch_move:function(e){
    if(this.dragging == false){
      return;
    }
    this.prevX = this.x;
    this.prevY = this.y;

    this.x = e.x-this.offsetX;
    this.y = e.y-this.offsetY;
  },
  touch_end:function(e){
    if(this.dragging == false){
      return;
    }
    this.dragging = false;
    this.vx = this.x - this.prevX;
    this.vy = this.y - this.prevY;
  },
  getImageData:function(){
    return this.surface.context.getImageData(0,0,this.width,this.height);
  },
  _colision:function(){
    if(this.x <= 0){
      this.vx *= -1;
      this.x = 0;
    }
    if(320-this.r*2 <= this.x){
      this.vx *= -1;
      this.x = 320-this.r*2;
    }
    if(this.y <= 0){
      this.vy *= -1;
      this.y = 0;
    }
    if(320-this.r*2 <= this.y){
      this.vy *= -1;
      this.y = 320-this.r*2;
    }
  },
  draw_marimo:function(r){
    var grad = this.ctx.createRadialGradient(r,r,r-r/10,r,r,r);
    grad.addColorStop(0,"RGB(93,185,125)");
    grad.addColorStop(1,"RGBA(130,185,230,0)");

    this.ctx.fillStyle = grad

    this.ctx.arc(r,r,r,0,2*Math.PI,true);
    this.ctx.fill();
  },
  update:function(){
    this.strokeRect();
    this.fillText();
  }
});


var Bubble = Class.create({
  initialize:function(){
    this.init();
  },
  init:function(){
    this.r = rand(5)+10; 
    this.x = this.baseX = rand(380)-30;
    this.y = 320+this.r;
    this.explosion = false;
    this.angle = Math.random() * Math.PI;
    this.difAngle = Math.random()*0.1;
    this.sinWidth = rand(6)+8;
    this.f = 0;

    this.speedY = Math.random()+0.2;
    this.difY = (0.2+Math.random())/5;
    this.color = getRGBfromH(rand(360));
    
  },
  render:function(ctx){
    this.f++;
    if(this.y <= 0 - this.r ){
      this.init();
    }
    this.speedY += this.difY;
    this.y -= this.speedY;
    this.x = this.baseX + Math.sin(this.angle+this.f*this.difAngle)*this.sinWidth;

    this._put_bubble(ctx);
  },
  _put_bubble:function(ctx){
    ctx.beginPath();
    
    var x = this.x+this.r;
    var y = this.y+this.r;
    

    var grad = ctx.createRadialGradient(x,y,0,x,y,this.r);
    grad.addColorStop(0,"RGBA(250,250,250,0.05)");
    grad.addColorStop(0.8,"RGBA(200,200,230,0.05)");
    grad.addColorStop(1,"RGBA("+this.color.r+","+this.color.g+","+this.color.b+",0.2)");
    
    ctx.fillStyle = grad;
//    ctx.fillStyle = "RGBA(250,250,250,0.3)";
    ctx.arc(x,y,this.r,0,Math.PI*2,true);
    ctx.fill();
  }
  
});

function getRGBfromH(h){
  var r,g,b;
  
  if(h < 0){
    h *= -1;
  }
  h = h % 360;
  var i = Math.floor(h / 60) % 6,
      f = (h / 60) - i,
      q = 255 * (1 - f),
      t = 255 * (1 - (1 - f));
      
  switch (i) {
    case 0 :
      r = 255;  g = t;  b = 0;  
      break;
    case 1 :
      r = q;  g = 255;  b = 0; 
      break;
    case 2 :
      r = 0;  g = 255;  b = t;  
      break;
    case 3 :
      r = 0;  g = q;  b = 255;  
      break;
    case 4 :
      r = t;  g = 0;  b = 255;  
      break;
    case 5 :
      r = 255;  g = 0;  b = q;
      break;
  }
  return {'r': Math.round(r),
          'g': Math.round(g),
          'b': Math.round(b)};
}
  

var Star = Class.create({
  initialize:function(r){
    this.x = 0;
    this.y = 0;
    this.r = r;
  },
  render:function(ctx){
    //this.x--;
    this.x -= (320-this.y)/100;
    320-this.y
    if(this.x <= 0 - this.r*2){
      this.x = 320;
    }

    ctx.beginPath();
    ctx.fillStyle = "RGB(215,215,215)";
    ctx.arc(this.x+this.r,this.y+this.r,this.r,0,Math.PI*2,true);
    ctx.fill();
  }
});

var ShootingStar = Class.create({
  initialize:function(firstX,firstY,endX,endY,frame,r){
    /* (firstX,firstY)から(endX,endY)にframeフレームかけて移動する
       流れ星。
    */
    this.first = {x:firstX,y:firstY};
    this.end = {x:endX, y:endY};
    this.frame = frame;
    this.r = r;

  },
  render:function(ctx){
    //流れ星を次のフレームにすすめる。
    //戻り値：残りフレーム数、０になったら終了
    if(this.frame <= 0)
      return 0;

    ctx.beginPath();
    var dx = (this.end.x - this.first.x)/this.frame;
    var dy = (this.end.y - this.first.y)/this.frame;

    ctx.fillStyle = "RGB(180,180,120)";
    ctx.arc(this.first.x + dx,
            this.first.y + dy,
            this.r,
            0,Math.PI*2,true);
    ctx.fill();

    //軌跡
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = this.r;
    ctx.beginPath();
    ctx.moveTo(this.first.x + (this.end.x-this.first.x)/(this.frame+3),
               this.first.y + (this.end.y-this.first.y)/(this.frame+3));
    ctx.lineTo(this.first.x + dx,
               this.first.y + dy);
    ctx.stroke();



    this.frame--;

    return this.frame;

  }
});

var Background  = Class.create(Sprite, {
  initialize:function(w,h,n){
    Sprite.call(this,320,320);
    this.surface = new Surface(320,320);

    this.NOON = "noon";
    this.NIGHT = "night";

    if(n == undefined){
      n = 0;
    }
    this.n = n;

    this.blue = 250 - 10*this.n
//今の時間を調べて、１９時〜６時まで夜モード
//　　　　　　　　　　６時〜１９時まで昼モード
    var hour = getDate().hour;
    if(hour <= 6 || 19 <= hour){
      this.night();
    }
    else{
      this.noon();
    }

    this.image = this.surface;
    this.addEventListener(Event.ENTER_FRAME,this.tick);
  },
  noon:function(){
    this.type = this.NOON;
    
    this._noon();
    var bubble_count = 40;
    this.bubbles = [];
    for(var i = 0; i < bubble_count;i++){
      this.bubbles.push(new Bubble());
    }
  },
  _noon:function(){
    var ctx = this.surface.context;

    var grad = ctx.createLinearGradient(0,0,0,320);
    grad.addColorStop(0,"RGB(44,143,"+this.blue+")");
    grad.addColorStop(1,"RGB(96,193,"+(this.blue-30)+")");
    
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,320,320);  
  },
  _draw_bubbles:function(){
    for(var i = 0; i < this.bubbles.length; i++){
      this.bubbles[i].render(this.surface.context);
    }
  },
  night:function(){
    this.type = this.NIGHT;

    this._night();

    this.stars = [];
    this.shooting_stars = [];
    for(var i = 0; i < 30; i++){
      for(var j = 0; j < 25; j++){
        var star = new Star(rand(2));
        star.x = rand(320);
        star.y = rand(300-i*8);

        this.stars.push(star)
      }
    }
    this._draw_stars();
  },
  render:function(){
    switch(this.type){
      case this.NIGHT:
        this._night();
        this._draw_stars();
        this._shooting_stars();
        break;
      case this.NOON:
        this._noon();
        this._draw_bubbles();
        break;
    }
  },
  getImageData:function(){
    return this.surface.context.getImageData(0,0,this.width,this.height);
  },
  tick:function(){
    this.render();
  },
  _night:function(){
    var ctx = this.surface.context;
    
    var grad = ctx.createLinearGradient(0,0,320,320);
    grad.addColorStop(0,"RGB(0,0,30)");
    grad.addColorStop(1,"RGB(40,80,170)");

    ctx.fillStyle = grad;
    ctx.fillRect(0,0,320,320);
  },
  _draw_stars:function(){   
    for(var i = 0; i < this.stars.length; i++){
      this.stars[i].render(this.surface.context);
    }
  },
  _shooting_stars:function(){
    if(rand(100) == 2){
      var firstY = rand(200);
      var endY = 320-rand(320-firstY);
      var firstX = rand(320);
      var endX = rand(320)
      var s_star = new ShootingStar(
          firstX,
          firstY,
          endX,
          endY,
          16,2
        );
      this.shooting_stars.push(s_star);
    }
    for(var i = 0; i < this.shooting_stars.length;i++){
      var i = this.shooting_stars[i].render(this.surface.context);
      if(i == 0){
        this.shooting_stars.shift(i);
      }
    }
  }
});

var Button  = Class.create(Sprite, {
  initialize:function(){
    Sprite.call(this,60,30);
    this.x = 255;
    this.y = 5;
    this._style_zIndex = 12;
    this.surface = new Surface(60,30);
    var ctx = this.surface.context;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,60,30);
    ctx.fillStyle = "#000";
    ctx.font = "18px 'ヒラギノ角ゴ Pro W3','Hiragino Kaku Gothic Pro','メイリオ',Meiryo,'ＭＳ Ｐゴシック'";  
    var x = ctx.measureText("水換え").width;
    ctx.fillText("水換え",(60-x)/2,23);

    this.image = this.surface;

    this.addEventListener(Event.TOUCH_START,this.click);

  },
  click:function(){
    game.memory.player.data.changed_water_count++;
    game.memory.player.data.changed_water = getDate();
    game.memory.update();

    /*フェードアウトする*/
    var fade = new Sprite(320,320);
    var surface = new Surface(320,320);
    fade.image = surface;
    fade.ctx = surface.context;
    fade.a = 0.05;
    fade.dif = 0.05;
    fade.ctx.fillStyle = "RGBA(255,255,255,"+fade.a+")";
    fade.ctx.fillRect(0,0,320,320);
    fade.addEventListener(Event.ENTER_FRAME,function(){
      
      this.a += this.dif;
      this.ctx.fillStyle = "RGBA(255,255,255,"+this.a+")";
      this.ctx.clearRect(0,0,320,320);
      this.ctx.fillRect(0,0,320,320);
      if(this.a >= 1.3){
        this.dif = -0.1;
        bg.blue = 250;
        bg.render()        
      }
      if(this.a <= -0.1){
        this.removeEventListener(Event.ENTER_FRAME,arguments.callee);
        game.rootScene.removeChild(this);
      }
    });
    game.rootScene.addChild(fade);
    
  }
});

function rand(n){
  return Math.floor(Math.random()*n)+1;
}

/*必要なデータ
名前、作った日、前回の水換え時間。
name = "namae"
created = date
changed_wator = date
*/

function getDate(){
  var a = new Date();
  return {
    day:a.getDate(),
    month:a.getMonth()+1,
    year:a.getFullYear(),
    hour:a.getHours(),
    minute:a.getMinutes(),
    second:a.getSeconds()
  }
}
function betweenDate(date1,date2){
  var d1 = new Date(date1.year,date1.month,date1.day);
  var d2 = new Date(date2.year,date2.month,date2.day);
  return Math.abs((d1 - d2) / 86400000);
}

function take_picture(){
  if(confirm("写真を撮りますよ？\n(ゲームも一旦終了します)")){
    save()
  }
}

function save(){
  var imgData = getPictureUrl(marimo,bg,post_image);
  function post_image(imgData){
    var req = new XMLHttpRequest();
    req.open("POST","http://182.163.60.7/marimo",true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    if(req){
      req.onreadystatechange = function(){
        if(req.readyState == 4){
          //保存後処理
          var res = JSON.parse(req.responseText);
          game_end(res.display_url);
        }
      };
    }
    query = "";
    for(var q in _data){
      query += encodeURI(q)+"="+encodeURI(_data[q])+"&"
    }

    req.send(query + "picture="+imgData);
  }
}
function game_end(url){
      _data.name = game.memory.player.data.name;
      _data.day  = betweenDate(game.memory.player.data.created,getDate());
      _data.id   = game.memory.player.screen_name;

  status_text = _data.name+ "(生後"+_data.day+"日) "+ url;
  score = 1001;
  game.end(score,status_text);
}

function getPictureUrl(marimo,bg,func){
  var canvas = document.createElement("canvas");
  canvas.width = canvas.height = 320;
  var ctx = canvas.getContext("2d");

  ctx.putImageData(bg.getImageData(),bg.x,bg.y);

  var marimo_img = new Image();
  endFlag = false;
  marimo_img.src = marimo.surface._element.toDataURL();
  marimo_img.onload = function(){
    ctx.drawImage(marimo_img,marimo.x,marimo.y);
    var imgData = canvas.toDataURL();
    imgData = imgData.replace("data:image/png;base64,","");
    func(imgData)
  }
}

window.onload = function() {
    game = new Game(320, 320);
    game.fps = 16;

    game.memory.player.preload();
    game.twitterRequest('account/verify_credentials');
    

    game.onload = function() {
      var name;      
      if(game.memory.player.data.name == null){
        //名前入力
        while(true){
          name = prompt("あなたのまりもの名前を入力してください\n※変更不可、8文字まで、前後の空白無視")
          name = name.replace(/^[ 　]+/,"").replace(/[ 　]+$/,"");
          if(name.length > 8){
            alert("8文字以下で入力してください");
            continue;
          }
          if(!name){
            continue;
          }
          break;
        }
        game.memory.player.data.name = name;
        game.memory.player.data.created = getDate();
        game.memory.player.data.changed_water = getDate();
        game.memory.player.data.changed_water_count = 0;
        game.memory.update();
      }
      name = game.memory.player.data.name;      

      var nameLabel = new Label(name+"<br />(生後"+
          betweenDate(game.memory.player.data.created,getDate())
          +"日)");
      nameLabel.width = 255;
      nameLabel._style.zIndex = 12;
      nameLabel.color = "#fff";
      nameLabel.font = "bold 2em/1.5em 'ヒラギノ角ゴ Pro W3','Hiragino Kaku Gothic Pro','メイリオ',Meiryo,'ＭＳ Ｐゴシック',fantasy";
      game.rootScene.addChild(nameLabel);
      

      bg = new Background(320,320,
          betweenDate(getDate(),game.memory.player.data.changed_water)
        );
      game.rootScene.addChild(bg);

      var size = betweenDate(game.memory.player.data.created,getDate())
      marimo = new Marimo(20+size/3);
      game.rootScene.addChild(marimo);

      var button = new Button();
      game.rootScene.addChild(button);

/* スコア登録　（iframeで裏で登録しておく) */
      var url1 = "http://9leap.net/games/1895/result?score="
      var url2 = "&result=";
      var score = 1000;
      var text = name+"(生後"+betweenDate(game.memory.player.data.created,getDate())+"日)"
      var url = url1+encodeURIComponent(score)+
                url2+encodeURIComponent(text);
      var el = document.createElement("iframe");
      el.src = url;
      el.width=0;
      el.height=0;
      el.style.display = "none";
      document.body.appendChild(el);

      _data = {};
      _data.name = game.memory.player.data.name;
      _data.day  = betweenDate(game.memory.player.data.created,getDate());
//      _data.id   = game.memory.player.screen_name;
      _data.id = game.twitterAssets["account/verify_credentials"][0].screen_name

    };
    game.start();
};



