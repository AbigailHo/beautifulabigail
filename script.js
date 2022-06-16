var ww, wh, canvas, frame, rate;
frame = 0;
rate = 15;

var particles = [];
var shapes = [];
var frames = [];
var maxShapes = 200; // 200
var maxFrames = 1;
var maxParticles = 300; // 300

$(document).ready(function() {
  winDim();
  setBodyMinHeight();
  refreshEvents();
  setCanvasSize();

  // Get canvas context
  canvas = document.getElementById("cv").getContext("2d");

  // Populate particles
  setInterval(function() {
    if (particles.length < maxParticles) {
    populate(1);
  }
  }, 150);
  
  // populate shapes
  setInterval(function() {
    if (shapes.length < maxShapes) {
      populateShapes(1);
    }
  }, 150);
  
  // Add frame
  populateFrames(1);
  
  setInterval(animate, rate);
  
  setFlickers();
});

/********************************************/
// FLOATER OBJECTS
var floaters = $('.floater');
$(floaters).each(function(e) {
});

function setFlickers() {
var flickers = $('.flicker');
  $(flickers).each(function(e) {
    var delay = 500;
    $(this).css('blend-mode', 'screen');
    flicker(this);
    function flicker(obj) {
      var dur = Math.random() * 200;
      $(obj).animate({
        'opacity': (Math.random() * 0.25) + 0.75,
      }, dur, function() {
        $(obj).animate({
          'opacity': 1.0
        }, dur, flicker(obj));
      });
    }
  });
};


/********************************************/
/// BACKGROUND

function Particle(canvas) {
  var random = Math.random() - 0.5;
  this.canvas = canvas;
  randPos = random * (wh * 1);
  this.x = 0 * 0.5 + 0;
  this.y = wh * 0.5 + randPos;
  this.a = -45;
  this.s = 0;
  this.v = Math.random() * 2;
  var randCol = Math.round(Math.random() * 4);
  this.color = "red";

  // BASE COLOR: 3de9dd
  this.wiggle = false;
  switch (randCol) {
    case 0:
      this.color = "#3de9dd";
      break;
    case 1:
      this.color = "#3de9cf";
      break;
    case 2:
      this.color = "#3de7e9";
      break;
    case 3:
      this.color = "#3dcae9";
      break;
    default:
      this.color = Math.random() < 0.5 ? "#e93d49" : "#e93d49";
      this.wiggle = true;
      break;
  }

  //this.color = 'red';
  this.radius = Math.random() * 5;
  this.move = function() {
    this.x += Math.cos(this.a) * this.v * 4;
    this.y += Math.sin(this.a) * this.v;
    if (this.wiggle) {
      this.a = Math.sin(6 * (Math.random() - 0.5) * -1); // +=  Math.random() * 0.8 - 0.4; // Probably angle or angular velocity
    } else {
      this.a = 0;
    }
  };
  this.render = function() {
    // Draw base
    this.canvas.beginPath();
    this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.canvas.fillStyle = this.color;

    this.canvas.fill();

    this.canvas.closePath();
  }.bind(this);
}
function Shape(canvas) {
  var random = Math.random() - 0.5;
  this.newRandom = Math.random();
  this.canvas = canvas;
  var randPos = random * (wh * 1);
  this.x = ww + 256;
  this.y = wh * Math.random();
  this.coordsX = [];
  this.coordsY = [];
  var minA = 0.25;
  this.lAlpha = random < minA ? random : minA;
  this.fAlpha = 0.0;
  this.size = Math.random() * 200;
  var pCount = Math.round(Math.random() * 4);
  pCount = pCount > 2 ? pCount : 3;
  // Make coords
  for (var i = 0; i < pCount; i++) {
    var c = Math.round(Math.random() * this.size);
    this.coordsX.push(c);
    c = Math.round(Math.random() * this.size);
    this.coordsY.push(c);
  }
  
  // Set coord deltas
  this.xD = [];
  this.yD = [];
  var cCount = this.coordsX.length;
  console.log("CCount -> " + cCount);
  var maxM = 0.5;
  for (var i = 0; i < cCount; i++) {
    this.xD[i] = ((Math.random() - 0.5) * maxM);
    this.yD[i] = ((Math.random() - 0.5) * maxM);
  }

  this.v = Math.random() * 4.5;

  this.render = function() {
    this.canvas.beginPath();
    var pointCount = this.coordsX.length;
    for (var i = 0; i < pointCount; i++) {
      if (i == 0) {
        this.canvas.moveTo(this.x + this.coordsX[i], this.y + this.coordsY[i]);
      }
      this.canvas.lineTo(
        this.x + this.coordsX[i + 1],
        this.y + this.coordsY[i + 1]
      );
    }
    this.canvas.closePath();
    this.canvas.strokeStyle = "rgba(233,61,73," + this.lAlpha + ")";
    this.canvas.stroke();
    this.canvas.fillStyle = "rgba(233,61,73," + this.fAlpha + ")";
    this.canvas.fill();
  }.bind(this);
  this.move = function() {
    this.x -= this.v;
    this.y += (this.newRandom - 0.5) * 0.5;
    
  }.bind(this);
}
function Frame(canvas) {
  this.canvas = canvas;
  this.x = ww * 0.5;
  this.y = wh * 0.5;
  this.radius = 500;
  
  this.render = function() {
    this.canvas.globalCompositeOperation = "destination-over";
    this.canvas.beginPath();
    
    //this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.canvas.rect(0,0,ww,wh);
    this.canvas.closePath();
    this.canvas.fillStyle = 'white';
    this.canvas.fill();
    this.canvas.globalCompositeOperation = "source-over";
  }
  
  this.move = function() {
    
  };
}

function animate() {

  // Animate particles
  particles.forEach(function(p, i, arr) {
    p.move();
    if (p.x > ww) {
      arr.splice(i, 1);
    } else {
      p.render();
    }
  });
  
  clear();

  // Animate shapes
  shapes.forEach(function(s, i, arr) {
    s.move();
    if (s.x < 0 || arr.length > maxShapes) {
      arr.splice(i, 1);
    } else {
      s.render();
    }
    
    s.render();
  });
  
  frames.forEach(function(f, i , arr) {
    f.move();
    f.render();
  });
  
  //requestAnimationFrame();
  //requestAnimationFrame(.bind(this));
}

function populate(num) {
  for (var i = 0; i < num; i++) {
    var newPart = new Particle(canvas);
    particles.push(newPart);
  }
}

function populateShapes(num) {
  for (var i = 0; i < 1; i++) {
    var newShape = new Shape(canvas);
    shapes.push(newShape);
  }
}

function populateFrames(num) {
  for (var i = 0; i < 1; i++) {
    var newFrame = new Frame(canvas);
    frames.push(newFrame);
  }
}

function clear() {
  var ctx = document.getElementById("cv").getContext("2d");
  ctx.globalAlpha = 0.0999;
  ctx.fillStyle = "#000621";
  ctx.fillRect(0, 0, ww, wh);
  ctx.globalAlpha = 1.0;
}

/*****************************************/

function refreshEvents() {
  windowEvents();
}

function windowEvents() {
  // Remove window events to prevent duplicates
  $(window).off("resize");

  // Define resize event
  $(window).resize(function() {
    winDim();
    setBodyMinHeight();
    setCanvasSize();
    refreshEvents();
  });
}

function winDim() {
  ww = $(window).width();
  wh = $(window).height();
}

function setBodyMinHeight() {
  $("body").css("min-height", wh + "px");
}

function setCanvasSize() {
  $("#cv").attr("height", wh);
  $("#cv").attr("width", ww);
}

/*

function Particle(canvas, progress) {
  var construct = function(canvas, progress) {
    var random = Math.random();
    this.canvas = canvas;
    this.progress = 0;

    // Initialize Position
    positionVariance = 200;
    this.x = ww * 0.5 + positionVariance * random;
    this.y = hh * 0.5 + positionVariance * random;
    this.a = 0;

    // Radius
    this.radius = random > 0.2 ? Math.random() * 1 : Math.random() * 3;
    this.radius = random > 0.8 ? Math.random() * 2 : this.radius;

    // Color
    this.color = random > 0.2 ? "#2E4765" : "#ff583b";
    this.color = random > 0.8 ? "#2E4765" : this.color;
  };

  var render = function() {
    this.canvas.beginPath();
    this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.canvas.lineWidth = 2;
    this.canvas.fillStyle = this.color;
    this.canvas.fill();
    this.canvas.closePath();
  }.bind(this);

  var move = function() {
    this.x += Math.cos(this.a); //* this.s;
    this.y += Math.sin(this.a); //* this.s;
    this.a += Math.random() * 0.8 - 0.4; // Probably angle or angular velocity

    this.render();
    this.progress++; // Advance progress

    return true;
  };
}

//var particles = []; // Holdes particle instances
//var maxParticles = 300;
//var numParticles = populate(maxParticles);

//Populate particles array


function clear(){
  var ctx = document.getElementById('cv').getContext('2d');
  ctx.globalAlpha=0.075;
  ctx.fillStyle='#000155';
  ctx.fillStyle='#000021'; // Alien
  ctx.fillRect(0, 0, ww, wh);
  ctx.globalAlpha=1.0;
}

///////////////////////////
console.log("helo");*/