require("Font7x11Numeric7Seg").add(Graphics);
const s = require('Storage');
const ADVIZOR_FILE = 'advizor.color.json';

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
let circColor = -1;

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
  var h = d.getHours(), m = d.getMinutes();
  h = (" "+h).substr(-2);
  m = ("0"+m).substr(-2);
  g.setColor(1, 1, 1);
  //g.reset();
  g.setFont("7x11Numeric7Seg",5);
  g.setFontAlign(1,1); // align right bottom
  g.drawString(h, 110, 160, true);
  g.drawString(m, 204, 160, true);

  var col = secToggle ? (0):(-1);
  secToggle = !secToggle;
  g.setColor(col);
  g.drawString(":", 135, 160, true);
  g.setColor(1, 1, 1);

  // draw the Date
  g.setFont("7x11Numeric7Seg",3);
  var D = d.getDate(); var M = d.getMonth() + 1;
  var dateStr = (" "+D).substr(-2) + "." + ("0"+M).substr(-2);
  g.drawString(dateStr, 170, 220, true);

  // draw the Day of Week
  dateStr = daysOfWeek[d.getDay()];
  g.setFont("6x8", 3);
  g.drawString(dateStr, 160, 80, true);

  /*g.setFont("6x8", 2);
  g.setFontAlign(0,1); // align center bottom
  dateStr = "    "+require("locale").date(d)+"    ";
  g.drawString(dateStr, g.getWidth()/2, Y+40, false);*/
}

const drawAll = () => {
  currentDate = new Date();
  const currentSec = currentDate.getSeconds();
  circColor = minToggle ? 65535:0;
  g.setColor(circColor);
  for (let i = 1; i < 61; i++) {
    if((i === currentSec + 1) && (minToggle)){
      g.setColor(0);
    }
    if((i === currentSec + 1) && (!minToggle)){
      g.setColor(65535);
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
  circColor = minToggle ? 65535:0;
  g.setColor(circColor);
  seconds((360 * currentDate.getSeconds()) / 60);
  drawDigit(currentDate);
};

const startTimers = () => {
  timer = setInterval(onSecond, 1000);
};

//This event is called just before the device shuts down for commands such as reset(), load(), save(), E.reboot() or Bangle.off()
E.on('kill', () => {
  let d = { //define array to write to file
    toggle : minToggle ? 1:0
  };
s.write(ADVIZOR_FILE,d); //write array to file
  d = 0;
});

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

//Read data from file and set variables
let advizorData = s.readJSON(ADVIZOR_FILE,1);
if (advizorData) {
  minToggle = advizorData.toggle;
}
advizorData = 0; 

g.clear();
//resetSeconds();
startTimers();
drawAll();
Bangle.loadWidgets();
Bangle.drawWidgets();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
