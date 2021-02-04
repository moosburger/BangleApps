// http://forum.espruino.com/conversations/345155/#comment15172813
//const locale = require('locale');
//const p = Math.PI / 2;
const pRad = Math.PI / 180;
const faceWidth = 105; // watch face radius (240/2 - 24px for widget area)
const widgetHeight=24+1;
let timer = null;
let currentDate = new Date();
let iSecCnt = 0;
//let toggle = true;
const centerX = g.getWidth() / 2;
const centerY = (g.getWidth() / 2) + widgetHeight/2;
const secCnt = 36;

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// position on screen
const daysOfWeek = ["SUN", "MON", "TUE","WED","THU","FRI","SAT"];

const seconds = (angle) => {
  const a = angle * pRad;
  const x = centerX + Math.sin(a) * faceWidth;
  const y = centerY - Math.cos(a) * faceWidth;

  // if 15 degrees, make hour marker larger
  const radius = (angle % 15) ? 2 : 4;
  g.fillCircle(x, y, radius);
};

const getOffset = (currentSec) => {
  var nSec = currentSec % 10;
  if (currentSec === 0){
    iSecCnt = 1;}
  if ((nSec == 1) || (nSec == 6)) {
    resetSeconds();
    g.setColor(1, 1, 1);
    iSecCnt -= 1;
  }
  if ((nSec == 4) || (nSec == 9)) {
    g.setColor(0, 0, 0);
    iSecCnt += 3;
  }
};

const drawAll = () => {
  currentDate = new Date();
  const currentSec = currentDate.getSeconds();
  for (let i = 0; i <= currentSec; i++) {
    getOffset(i);
  }
  g.setColor(1, 1, 1);
  drawDigit();
  var nSec = currentSec % 10;
  if ((nSec == 2) || (nSec == 7)) {
    seconds((360 * (currentSec-iSecCnt-1)) / secCnt);
  }
  if ((nSec == 3) || (nSec == 8)) {
    seconds((360 * (currentSec-iSecCnt-2)) / secCnt);
    seconds((360 * (currentSec-iSecCnt-1)) / secCnt);
  }
  seconds((360 * (currentSec-iSecCnt)) / secCnt);
};

const resetSeconds = () => {
  g.setColor(0, 0, 0);
  for (let i = 0; i <= secCnt; i++) {
    seconds((360 * i) / secCnt);
  }
};

const onSecond = () => {
  currentDate = new Date();
  let currentSec = currentDate.getSeconds();
  //const sep = toggle ? ":":" ";
  getOffset(currentSec);
  var actSec = currentSec - iSecCnt;
  //console.log(currentSec.toString() + '-----(' + actSec.toString() + ')');
  seconds((360 * actSec) / secCnt);
  var col = g.getColor();
  drawDigit();
  g.setColor(col);
};

const startTimers = () => {
  timer = setInterval(onSecond, 1000);
};

function drawDigit() {
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = (" "+h).substr(-2) + ":" + ("0"+m).substr(-2);
  // Reset the state of the graphics library
  g.reset();
  g.setColor(1, 1, 1);
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg",5);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(time, 210, 160, false /*clear background*/);

  // draw the Date
  g.setFont("7x11Numeric7Seg",3);
  var D = d.getDate(); var M = d.getMonth();
  var dateStr = (" "+D).substr(-2) + "." + ("0"+M).substr(-2);
  g.drawString(dateStr, 170, 220, true /*clear background*/);

  // draw the Day of Week
  dateStr = daysOfWeek[d.getDay()];
  g.setFont("6x8", 3);
  g.drawString(dateStr, 160, 80, true /*clear background*/);
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    g.clear();
    drawAll();
    startTimers();
    Bangle.drawWidgets();
  } else {
    if (timer) {
      clearInterval(timer);
    }
  }
});

g.clear();
resetSeconds();
startTimers();
drawAll();
Bangle.loadWidgets();
Bangle.drawWidgets();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
