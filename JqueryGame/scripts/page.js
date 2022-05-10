let throwingItemIdx = 1;

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2;
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units

let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

let gwhGame, gwhStatus, gwhScore;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

var arr = []
var thecandy = $('.throwingitemnewcandy')
var thebead = $('.throwingitemnewbead')

const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

var createThrowingItemIntervalHandle;
var currentThrowingFrequency = 2000;

var stopThrowing = false
let gamePause = false
var throwingspeedval = 2000
var totalScore = 0
var candyCount = 0
var beadCount = 0


document.createElement("backgroundSound")

//another main:
//$(window).on("load", function(){}) //all content

// Main
$(document).ready(function () {//just DOM
  console.log("Ready!");
  // document.body.style.zoom = "80%";
  var audio = new Audio('scripts/audio/fun.mp3')
  
  // audio.src = ("./audio/fun.mp3");
  setInterval (function () {
    
  }, 2000)
  

  // var music = loadSound("./audio/fun.mp3")
  // music.play()

  // TODO: Event handlers for the settings panel
  candyCounter = $('#candyCounter')
  beadsCounter = $('#beadsCounter')
  candyCounter.after('<div class = "sounding"><br> <button id = "soundbutton0" > Play Audio</button> <br><br> <button id = "soundbutton1" > Pause Audio</button><br> </div>')
  $('#soundbutton0').click(
  function(){console.log("PLASYASJD");
  audio.volume = 0.2;
  audio.loop = true
  document.getElementById('soundbutton0').innerHTML = "Playing"
  document.getElementById('soundbutton1').innerHTML = "Pause Audio"

  audio.play();})
  
  $('#soundbutton1').click(function(){
    console.log("sdf");
    audio.pause();
    document.getElementById('soundbutton0').innerHTML = "Play Audio"
    document.getElementById('soundbutton1').innerHTML = "Paused"
    
  })
  candyCounter.after('<div class = "settings"> <br><br><button id = "button1">Open Settings Panel</button> </div>')
  $('.settings').append('<div id = "allsettings"><hr><br>Item thrown from parade float every <input value = "2000" id = "throwingspeed" type = "text"/> milliseconds (min allowed value: 100)<br><button id = "savebutton">Save and close settings panel</button><br><button id = "discardbutton">Discard and close settings panel</button><hr></div>')
  $('#allsettings').hide()
  $('#button1').click(() => {
    console.log("clicked");
    $('#button1').hide()
    $('#allsettings').show()
  })
  var prev = 2000;
  $('#savebutton').click(() => {
    if ($('#throwingspeed').val() < 100) {
      alert("Frequency must be a number greater than or equal to 100")

    } else {
      clearInterval(createThrowingItemIntervalHandle)
      throwingspeedval = $('#throwingspeed').val()
      prev = throwingspeedval
      currentThrowingFrequency = throwingspeedval
      createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
      


      console.log(currentThrowingFrequency)
      $('#button1').show()
      $('#allsettings').hide()
    }

  })


  $('#discardbutton').click(() => {
    $('#button1').show()
    $('#allsettings').hide()
    $('#throwingspeed').val(prev)

  })

  
  $('#scoress').before("<button id= 'resetall'>Reset</button>")
  $('#resetall').click(function () {
    if (document.getElementById("score-box").innerHTML == 0) {
      alert("Pressing Reset when you are already at 0 is a very wise decision")
      var audio5 = new Audio('scripts/audio/makingfunofyou.wav')
      audio5.play()
    } else {

      var audio4 = new Audio('scripts/audio/arcade.wav')
      audio4.play()
      document.getElementById("beadsCounter").innerHTML = 0; beadCount = 0;
      document.getElementById("candyCounter").innerHTML = 0; candyCount = 0;
      document.getElementById("score-box").innerHTML = 0; totalScore = 0;
    }
  })

  splash = $('.splash')
  console.log(splash)
  
  setTimeout(() => {
    $('.flashingLights').remove()
    splash.hide();

    bead = $('#beads')
    candy = $('#candy')
    // Set global handles (now that the page is loaded)
    // Allows us to quickly access parts of the DOM tree later
    gwhGame = $('#actualGame');
    gwhStatus = $('.status-window');
    gwhScore = $('#score-box');
    player = $('#player');  // set the global player handle
    player.show();
    paradeRoute = $("#paradeRoute");
    paradeFloat1 = $("#paradeFloat1");
    paradeFloat2 = $("#paradeFloat2");

    // Set global positions for thrown items
    maxItemPosX = $('.game-window').width() - 50;
    maxItemPosY = $('.game-window').height() - 40;

    // Set global positions for the player
    maxPersonPosX = $('.game-window').width() - player.width();
    maxPersonPosY = $('.game-window').height() - player.height();

    // Keypress event handler
    $(window).keydown(keydownRouter);

    // Periodically check for collisions with thrown items (instead of checking every position-update)
    setInterval(function () {
      checkCollisions();
    }, 100);


    startParade();
    // Throw items onto the route at the specified frequency
    if (stopThrowing == false) {
       createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
    }



  }, 3000);

});


function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

// Handle player movement events
// TODO: Stop the player from moving into the parade float. Only update if
// there won't be a collision DONE
function movePerson(arrow) {
  switch (arrow) {
    case KEYS.left: { // left arrow
      let newPos = parseInt(player.css('left')) - PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if (willCollide(player, paradeFloat1, -PERSON_SPEED, 0) || willCollide(player, paradeFloat2, -PERSON_SPEED, 0)) {
        //var posSanta = (player.offset().left, player.offset().left)
        // console.log("asdfklsdaklsd")
        player.css(newPos)
        
      }
      console.log("left " + newPos)
      player.css('left', newPos);
      break;
    }
    case KEYS.right: { // right arrow
      let newPos = parseInt(player.css('left')) + PERSON_SPEED;
      // console.log((player.offset().left, player.offset().left))
      if (newPos > maxPersonPosX) {
        newPos = maxPersonPosX;
      }
      if (willCollide(player, paradeFloat1, PERSON_SPEED, 0) || willCollide(player, paradeFloat2, PERSON_SPEED, 0)) {
        //console.log("DSKJFSDFOIRKNLFSOIDF EOP KSEFOP S")
        // var posSanta = (player.offset().left, player.offset().left)
        player.css(newPos)
        //break;
      }
      console.log("right: " + newPos)
      player.css('left', newPos);
      break;
    }
    case KEYS.up: { // up arrow
      let newPos = parseInt(player.css('top')) - PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      if (willCollide(player, paradeFloat1, 0, -PERSON_SPEED) || willCollide(player, paradeFloat2, 0, -PERSON_SPEED)) {
        player.css(newPos)
      }
      console.log(newPos)
      player.css('top', newPos);
      break;
    }
    case KEYS.down: { // down arrow
      let newPos = parseInt(player.css('top')) + PERSON_SPEED;
      if (newPos > maxPersonPosY) {
        newPos = maxPersonPosY;
      }
      if (willCollide(player, paradeFloat1, 0, +PERSON_SPEED) || willCollide(player, paradeFloat2, 0, +PERSON_SPEED)) {
        // console.log("DKJSD DECRWLKDSAK")
        // var posSanta = (player.offset().top, player.offset().top)
        player.css(newPos)
      }
      console.log("Down + " + newPos)
      player.css('top', newPos);
      break;
    }
    //extra case for collisions
  }
}

// Check for any collisions with thrown items
// If needed, score and remove the appropriate item
var x = 20

function checkCollisions() {
  // TODO
  // }

  for (let i = 0; i < arr.length; i++) {
    // console.log("i is " + i)
    //2,5,8,11
    //0,1,3,4,6,7
    if (isColliding(player, arr[i])) {//arr[i]
      var elem = document.getElementById('k-' + i)
      elem.classList.add('circle')
      var audio2 = new Audio("scripts/audio/cool.wav")
      audio2.play()
      setInterval(function () {
        elem.remove()
        elem.classList.remove('circle')
      }, 50)
      if(elem.classList.contains('newbead')){
        beadCount += 1
        document.getElementById("beadsCounter").innerHTML = beadCount        
      }else{
        candyCount += 1
        console.log("kjsdjkasd")
        document.getElementById("candyCounter").innerHTML = candyCount
        console.log("WORKS PLEASE WORK PELASE")
      }
      totalScore += 100
      document.getElementById("score-box").innerHTML = totalScore
    }
  }
}

function startParade() {
  console.log("Starting parade...");
  // var id = null
  // id = setInterval(frame(), 10)
  // function frame(){
  //   paradeFloat1.style.left = pos + 'px';
  //   pos +=50
  // }
  paradeTimer = setInterval(function frame() {

    var curr = parseInt(paradeFloat1.css('left'))//end
    var curr2 = parseInt(paradeFloat2.css('left'))//begin


    var begin = paradeFloat1.css('left', curr + FLOAT_SPEED) //end
    var begin2 = paradeFloat2.css('left', curr2 + FLOAT_SPEED) //begin
    //              left px- 300px , 300 left px + 2 px speed
    stopThrowing = false
    if (/*isColliding(paradeFloat1, player) ||*/ isColliding(paradeFloat2, player)) {//only right side of float
      paradeFloat1.css('left', curr + 0)
      paradeFloat2.css('left', curr2 + 0)
      stopThrowing = true
      
      var audio3 = new Audio("scripts/audio/alarm.wav")
      audio3.play()
      audio3.volume = 0.01
      setInterval(function(){audio3.pause()}, 1000)
      
      // player.PERSON_SPEED = 0
    }

    // console.log(curr)
    if (curr == 480) {
      stopThrowing = false
      console.log("asdkjf askdfj sadf;kja sdf;kjas dfkasjd fasjkdf waejfk ")
      paradeFloat1.css('left', -300)
      paradeFloat2.css('left', -150)
    }


  }, OBJECT_REFRESH_RATE);
}

function createThrowingItem() {
  // newBead = $('#bead')
  // newCandy = $('#candy')

  ///3 positions: tb bt
  // document.createElement('newCandy')
  // document.createElement('newBead')
  if (stopThrowing === false) {
    var floatmovementx = parseInt(paradeFloat2.css('left')) + FLOAT_2_WIDTH - 50//begin
    if (floatmovementx < 480) {

      // var posOfSanta = (paradeFloat1.offset().left, paradeFloat1.offset().top)
      // console.log(posOfSanta)
      var x = getRandomNumber(0, maxItemPosX)
      var y = getRandomNumber(0, maxItemPosY)

      if (throwingItemIdx % 3 == 0) {
        var div = createItemDivString(throwingItemIdx, 'newcandy', "candy.png");
        gwhGame.append(div)
      } else {
        var div = createItemDivString(throwingItemIdx, 'newbead', "beads.png")
        gwhGame.append(div)//zebra
      }

      var thebestthrowintheworld = $('#i-' + throwingItemIdx);
      arr.push(thebestthrowintheworld)

      
      throwingItemIdx += 1


      var floatmovementy = 250//begin
      thebestthrowintheworld.css('left', floatmovementx) //throw comes from floatmovement
      thebestthrowintheworld.css('top', floatmovementy);

      while (x < 0 || x > 467) {
        x = getRandomNumber(0, maxItemPosX)
      }
      //if(x <= 25 && x >= 450 (&& y )
      while ((y < 300 && y > 135) || y < 0 || y > 550) {
        y = getRandomNumber(0, maxItemPosY)
      }
      // while(floatmovementx - x < 0 || floatmovementx - x > 467){
      //   x = getRandomNumber(0, maxItemPosX)
      // }
      // while((floatmovementy - y) < 300 && (floatmovementy - y) > 135 || (floatmovementy - y) > 550){
      //   y = getRandomNumber(0, maxItemPosY)
      // }
      var xdist; var ydist;
      if ((floatmovementx - x) > (floatmovementx)) {
        var xdist = (floatmovementx - x) / 50;
      } else if ((floatmovementx - x) < floatmovementx) {
        var xdist = (x - floatmovementx) / 50;
      } 
      // else if (x   floatmovementx > 0) {
      //   var xdist = (x - floatmovementx) / 50;
      // }else if (x - floatmovementx < 0) {
      //   var xdist = (floatmovementx - x) / 50;
      // }

      if ((floatmovementy - y) < floatmovementy) {
        var ydist = (y  - floatmovementy) / 50;
      } else if ((floatmovementy - y) > floatmovementy) {
        var ydist = (floatmovementy - y) / 50;
      } 
      updateThrownItemPosition(thebestthrowintheworld, xdist , ydist, 50)
    }
  }

}


var x = 0;
function createItemDivString(itemIndex, type, imageString) {
  return "<div id='i-" + itemIndex + "' class='throwingItem" + type + "'><img  class = '" + type + " size' id = k-" + x++ + " src='img/" + imageString + "'/></div>";
}


function updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft) {
  if (iterationsLeft > 0) {
  var newlocationx = parseInt(elementObj.css('left')) + xChange //x
  var newlocationy = parseInt(elementObj.css('top')) + yChange //y


    setTimeout(function () {
      elementObj.css("left", newlocationx);
      elementObj.css("top", newlocationy);

      
      
      iterationsLeft--
      
      updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft)
    }, 50);
  } else {
    graduallyFadeAndRemoveElement(elementObj)
  }
  // graduallyFadeAndRemoveElement(elementObj)

}

function graduallyFadeAndRemoveElement(elementObj) {
  // Fade to 0 opacity over 2 seconds
  elementObj.fadeTo(2000, 0, function () {
    $(this).remove();
  });
}


// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Input: Two elements, upcoming change in position for the moving element
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}



