const BACKGROUND_COLOUR = '#000000';
const LINE_COLOUR = '#FFFFFF';
const LINE_WIDTH = 15;

var currentX = 0;
var currentY = 0;
var previousX = 0;
var previousY = 0;

var canvas;
var context;
var isDrawing = false;

function onPress(event){
  currentX = event.clientX - canvas.offsetLeft
  currentY = event.clientY - canvas.offsetTop;
  isDrawing = true;
}


function onRelease(event){
  isDrawing = false;
}


function onMove(event){
  previousX = currentX;
  previousY = currentY;
  if (event.type == 'touchmove'){
    currentX = event.touches[0].clientX - canvas.offsetLeft;
    currentY = event.touches[0].clientY - canvas.offsetTop;
  }else {
    currentX = event.clientX - canvas.offsetLeft;
    currentY = event.clientY - canvas.offsetTop;
  }
  if (isDrawing) {
    // backtick instead of quotes to use javascript equivalent of f-strings
    context.beginPath();
    context.moveTo(previousX, previousY);
    context.lineTo(currentX, currentY);
    context.closePath();
    context.stroke();
  }
}

function prepareCanvas(){
  console.log('Preparing canvas');
  canvas = document.getElementById('drawing-canvas');
  context = canvas.getContext('2d');
  context.fillStyle = BACKGROUND_COLOUR;
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  context.strokeStyle = LINE_COLOUR;
  context.lineWidth = LINE_WIDTH;
  context.lineJoin = 'round';
  document.addEventListener('mousedown', onPress);
  canvas.addEventListener('touchstart', onPress);


  document.addEventListener('mouseup', onRelease);
  canvas.addEventListener('touchend', onRelease);

  canvas.addEventListener('mouseleave', function (){
    isDrawing = false;
  })
  canvas.addEventListener('touchcancel', function (){
    isDrawing = false;
  })

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove);
}


function clearCanvas() {
  currentX = 0;
  currentY = 0;
  previousX = 0;
  previousY = 0;
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}
