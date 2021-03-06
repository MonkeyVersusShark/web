(function() {
  var Pane = function() {
    this.createTiles();
    this.listenButtonClicks();
    this.listenTileClicks();
  };

  var p = Pane.prototype;
  var isPlay = false;
  var flag = true;
  var isShuffle = false;

  p.createTiles = function() {
    that = this;
    this.tiles = [];
    $('#puzzlearea div').each(function(i) {
      that.tiles.push(new Tile(this, i));
    });
    this.tiles[15] = this.blank = new Tile(null, 15);
    this.step = new Tile(null, 16);
    this.step.canmove=false;
  };

  p.recreate = function(blank) {
    for (var i = 0; i < this.tiles.length - 1; i++) {
      this.tiles[i].dom._tile.row = Math.floor(i / 4);
      this.tiles[i].dom._tile.column  = i % 4;
      this.tiles[i].dom._tile.getPosition();
    }
    blank.row = 3;
    blank.column = 3;
  };

  p.calculateTime = function() {
    var original_time = moment();
    this.flag = setInterval(function() {
      var now_time = moment();
      var time = now_time.diff(original_time);
      var hour = Math.floor(time / 1000 / 60 / 60 % 24);
      var minute = Math.floor(time / 1000 / 60 % 60);
      var second = Math.floor(time / 1000 % 60);
      if (hour < 10) hour = "0" + hour;
      if (minute < 10)  minute = "0" + minute;
      if (second < 10) second = "0" + second;
      $('#times')[0].innerHTML = hour + ":" + minute + ":" + second;
    }, 1000);
  };

  p.stopTime = function() {
      clearInterval(this.flag);
  };

  p.listenButtonClicks = function() {
    $('button').click(function() {
      this.step.num = 0;
      this.step.canmove = true;
      if (this.isPlay === true)
        this.stopTime();
      this.calculateTime();
      this.isPlay = true;
      this.recreate(this.blank);
      $("#win").css("opacity", 0);
      for (var i = 0; i < this.tiles.length - 1; i++) {
        this.tiles[i].getPosition();
        this.tiles[i].updatePosition();
      }
      this.shuffle();
      this.isShuffle = false;
    }.bind(this));
  };

  p.listenTileClicks = function() {
    $('#puzzlearea').click(function(event) {
      tile = event.target._tile;
      if (tile && tile.canMove(this.blank, this.step)) {
        tile.move(this.blank, this.step);
        tile.getPosition();
        tile.updatePosition();
        this.win();
      }
    }.bind(this));
  };

  p.isWin = function() {
    for (var i = 0; i < this.tiles.length - 1; i++) {
      if (!this.tiles[i].isInRightPosition()) return false;
    }
    return true;
  };

  p.win = function() {
    if (this.isPlay === true && this.isShuffle === false && this.isWin() && this.step.num !== 0) {
      $("#win").css("opacity", 1);
      $("#win").html("You Win!");
      this.step.canmove = false;
      this.isPlay = false;
      this.stopTime();
    }
  };

  p.shuffle = function() {
    this.isShuffle = true;
    var valueOfDifficultyLevel = $("select")[0].options[$("select")[0].selectedIndex].value;
    for (var i = 0; i < valueOfDifficultyLevel; i++) {
      this.step.canmove = true;
      $(this.tiles[Math.floor(Math.random() * 16)].dom).click();
    }
    this.step.num = 0;
    $("#steps")[0].innerHTML = "0";
    $("#win").css("opacity", 0);
  };

  var Tile = function(dom, seq) {
   this.dom = dom;
   this.seq = seq;
   this.setPosition();
   if (dom) {
     this.dom._tile = this;
     this.setBackgroundPosition();
     this.updatePosition();
   }
 };

  p = Tile.prototype;

  p.isInRightPosition = function() {
    return (this.row == Math.floor(this.seq / 4) && (this.column == this.seq % 4));
  };

  p.setPosition = function() {
    this.row = Math.floor(this.seq / 4);
    this.column  = this.seq % 4;
  };

  p.getPosition = function() {
    this.left= this.column * 88;
    this.top=this.row * 88;
  };

  p.setBackgroundPosition = function() {
    this.getPosition();
    $(this.dom).css('backgroundPosition', -this.left + 'px ' + -this.top + 'px');
  };

  p.updatePosition = function() {
    this.getPosition();
    $(this.dom).css('left', this.left);
    $(this.dom).css('top', this.top);
  };

  p.canMove = function(blank, step) {
    return ((step.canmove === true) && ((this.row == blank.row && Math.abs(this.column - blank.column) == 1) ||
    (this.column == blank.column && Math.abs(this.row - blank.row) == 1)));
  };

  p.move = function(blank, step) {
    var temp = this.row;
    this.row = blank.row;
    blank.row = temp;
    temp = this.column;
    this.column = blank.column;
    blank.column = temp;
    step.num = step.num + 1;
    $("#steps")[0].innerHTML = step.num;
  };

  $(function() {new Pane();});

})();
