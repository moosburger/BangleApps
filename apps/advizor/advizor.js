require("Font7x11Numeric7Seg").add(Graphics);
const pRad = Math.PI / 180;
const faceWidth = 104; // watch face radius (240/2 - 24px for widget area)
const widgetHeight=24+1;
let timer = null;
let currentDate = new Date();
const centerX = g.getWidth() / 2;
const centerY = (g.getWidth() / 2) + widgetHeight/2;
const daysOfWeek = ["SUN", "MON", "TUE","WED","THU","FRI","SAT"];
// position on screen
const X = 180, Y = 140;
let secToggle = true;
let minToggle = true;

const seconds = (angle) => {
  const a = angle * pRad;
  const x = centerX + Math.sin(a) * faceWidth;
  const y = centerY - Math.cos(a) * faceWidth;

  // if 15 degrees, make hour marker larger
  const radius = (angle % 15) ? 2 : 4;
  g.fillCircle(x, y, radius);
};

function drawDigit(currentDate) {
  // work out how to display the current time
  var d = currentDate;//new Date();
  var h = d.getHours()+5, m = d.getMinutes();
  h = (" "+h).substr(-2);
  m = ("0"+m).substr(-2);
  g.setColor(1, 1, 1);
  //g.reset();
  g.setFont("7x11Numeric7Seg",5);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(h, 110, 160, false);
  g.drawString(m, 200, 160, false);

  var col = secToggle ? (0):(-1);
  secToggle = !secToggle;
  g.setColor(col);
  g.drawString(":", 135, 160, false);
  g.setColor(1, 1, 1);

  // draw the Date
  g.setFont("7x11Numeric7Seg",3);
  var D = d.getDate(); var M = d.getMonth() + 1;
  var dateStr = (" "+D).substr(-2) + "." + ("0"+M).substr(-2);
  g.drawString(dateStr, 170, 220, false);

  // draw the Day of Week
  dateStr = daysOfWeek[d.getDay()];
  g.setFont("6x8", 3);
  g.drawString(dateStr, 160, 80, false);

  /*g.setFont("6x8", 2);
  g.setFontAlign(0,1); // align center bottom
  dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, g.getWidth()/2, Y+40, false);*/
  g.drawLine(0,24,240,24);
  g.drawLine(0,120,240,120);
  g.drawLine(120,0,120,240);
}

const drawAll = () => {
  currentDate = new Date();
  const currentSec = currentDate.getSeconds();
  for (let i = 1; i < 61; i++) {
    if (i > currentSec) {
      g.setColor(0, 0, 0);
    } else {
      g.setColor(1, 1, 1);
    }
    seconds((360 * i) / 60);
  }
  onSecond();
};

const resetSeconds = () => {
  g.setColor(0, 0, 0);
  for (let i = 0; i < 60; i++) {
    seconds((360 * i) / 60);
  }
};

const onSecond = () => {
  currentDate = new Date();
  seconds((360 * currentDate.getSeconds()) / 60);
  if (currentDate.getSeconds() === 1) {
    //resetSeconds();
    minToggle = !minToggle;
  }
  var circColoer = minToggle ? (-1):(0);
  g.setColor(circColoer);
  seconds((360 * currentDate.getSeconds()) / 60);
  drawDigit(currentDate);
};

const startTimers = () => {
  timer = setInterval(onSecond, 1000);
};

Bangle.on('lcdPower', (on) => {
  if (on) {
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
//resetSeconds();
startTimers();
drawAll();
Bangle.loadWidgets();
Bangle.drawWidgets();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
