
/*********************************************************************************/
/*!
*	\brief      AnalogClock
*	\details   Code based on the original Mixed Clock,
*
*	\file		AnalogClock.js
*
*	\copyright
*	\date       Erstellt am: 05.08.2014
*	\author     Gerhard Prexl
*
*	\version    1.0  -  05.08.2014
*/
/*< History > *************************************************************************************
*	Version     Datum       Kuerzel      Ticket#     Beschreibung
*   0.8.0.0     15.03.2018  GP          -------     Ersterstellung
* </ History >******************************************************************/

/**************************************************************************************************
* Includes
**************************************************************************************************/
var locale = require("locale");
const Storage = require("Storage");
const filename = 'miclock2.json';
let settings = Storage.readJSON(filename,1) || {
  cDebug: true,
  cSize: 0,
  cDiameter : 23,
  cMoveCenter : -24,
  cShowRAM: false,
  cMaxTime: 1100,
  cMinTime: 240,
  cStepThreshold: 30,
  cIntervalResetActive: 30000,
  cStepSensitivity: 80,
  cStepGoal: 10000
};

/**************************************************************************************************
* Defines
* jshint esversion: 6
**************************************************************************************************/
const Radius = { "center": 6, "hour": 60 + settings.cDiameter, "min": 80 + settings.cDiameter, "sec" : 85 + settings.cDiameter, "dots": 92 + settings.cDiameter };
const Center = { "x": 120, "y": 120};
const Widths = { hour: 2, minute: 2, second: 1 };
var buf = Graphics.createArrayBuffer(240,240,1,{msb:true});

const CHARGING = -1;//0x0007E0;
const CLOCK = -1; // always white
//const BTCON = 0x00041F;
//const BTDIS = 0x004A69;
const BTCON = -1;
const BTDIS = 0x000000;

/**************************************************************************************************
* Variablen
**************************************************************************************************/
var img_bt = E.toArrayBuffer(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="));
var img_Bat = E.toArrayBuffer(atob("DhgBHOBzgc4HOP////////////////////3/4HgB4AeAHgB4AeAHgB4AeAHg"));
var img_Pedo = E.toArrayBuffer(atob("CgoCLguH9f2/7+v6/79f56CtAAAD9fw/n8Hx9A=="));

var steps = 0; //steps taken

/**************************************************************************************************
* Funktionen
**************************************************************************************************/

//*************************************************************************************************
// FunktionsName:   drawBT
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function drawBT() {
  var isConnected = true;
  var ox = 108;
  var oy = 28;

  if (settings.cDebug == false)
    isConnected = (NRF.getSecurityStatus().connected);

  if (isConnected == true)
    buf.setColor(BTCON);
  else
    buf.setColor(BTDIS);
  buf.drawImage(img_bt, Center.x + ox, Center.y - Radius.dots + oy);
}

//*************************************************************************************************
// FunktionsName:   drawBatt
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function drawBatt() {

  var w = 30;
  var h = 16;
  var ox = 85;
  var oy = 0;

  if ((Bangle.isCharging()) || (settings.cDebug == true)) {
    buf.setColor(CHARGING).drawImage(img_Bat, Center.x + ox - 16, Center.y - Radius.dots - oy - 4);
  }

  buf.setColor(CLOCK);
  buf.fillRect (Center.x + ox, Center.y - Radius.dots - oy, Center.x + w + ox, Center.y - Radius.dots -oy + 16);
  buf.clearRect(Center.x + ox + 2, Center.y - Radius.dots - oy + 2, Center.x + ox + w - 2, Center.y - Radius.dots + h - oy - 2);
  buf.fillRect (Center.x + ox + w, Center.y - Radius.dots - oy + 4, Center.x + ox + w + 4, Center.y - Radius.dots + h - oy - 4);
  buf.setColor(CHARGING).fillRect(Center.x + ox + 2, Center.y - Radius.dots - oy + 2, Center.x + ox + 2 + E.getBattery()*(w-4)/100,Center.y - Radius.dots + h - oy - 2);
  buf.setColor(-1);
}

//*************************************************************************************************
// FunktionsName:   showRAMUsage
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function showRAMUsage() {

    var m = process.memory();
    var pc = Math.round(m.usage*100/m.total);
    buf.drawString(pc+"%", Center.x + 5, Center.y - 40, true);
}

//*************************************************************************************************
// FunktionsName:   setStepSensitivity
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function setStepSensitivity(s) {
  function sqr(x) { return x*x; }
  var X=sqr(8192-s);
  var Y=sqr(8192+s);
  Bangle.setOptions({stepCounterThresholdLow:X,stepCounterThresholdHigh:Y});
}

//*************************************************************************************************
// FunktionsName:   drawPEDO
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function drawPEDO() {

  var fx = 0;

  buf.setFont("6x8", 2);
  buf.setFontAlign(-1, 0);
  if (steps < 10)
    fx = 48;
  else if (steps < 100)
    fx = 36;
  else if (steps < 1000)
    fx = 24;
  else if (steps < 10000)
    fx = 12;

  fx -= 2;

  if (steps >= settings.cStepGoal)
    buf.setColor(CHARGING);

  //g.drawImage(img_Pedo, Center.x - 118, Center.y - Radius.dots - 1);
  //g.drawString(steps, Center.x - 105 + fx, Center.y - Radius.dots + 4);
  //g.drawImage(img_Pedo, Center.x - 116, Center.y - Radius.dots + 16);

  buf.drawImage(img_Pedo, Center.x - 57, Center.y - Radius.dots - 2);
  buf.drawString(steps, Center.x - 118 + fx, Center.y - Radius.dots + 4);
}

//*************************************************************************************************
// FunktionsName:   calcSteps
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function calcSteps() {
    stopTimeStep = new Date(); //stop time after each step
    stepTimeDiff = stopTimeStep - startTimeStep; //time between steps in milliseconds
    startTimeStep = new Date(); //start time again

    //Remove step if time between first and second step is too long
    if (stepTimeDiff >= setting('cMaxTime')) { //milliseconds
      steps--;
    }
    //Remove step if time between first and second step is too short
    if (stepTimeDiff <= setting('cMinTime')) { //milliseconds
      steps--;
    }

    //Step threshold reached
    if (steps >= setting('cStepThreshold')) {
      if (active == 0) {
        stepsCounted = stepsCounted + (setting('cStepThreshold') -1) ; //count steps needed to reach active status, last step is counted anyway, so treshold -1
        stepsOutsideTime = stepsOutsideTime - 10; //substract steps needed to reach active status
      }
      active = 1;
      clearInterval(timerResetActive); //stop timer which resets active
      timerResetActive = setInterval(resetActive, setting('cIntervalResetActive')); //reset active after timer runs out
      steps = 0;
    }
  }

//*************************************************************************************************
// FunktionsName:   rotatePoint
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function rotatePoint(x, y, d) {
    rad = -1 * d / 180 * Math.PI;
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);
    xn = ((Center.x + x * cos - y * sin) + 0.5) | 0;
    yn = ((Center.y + x * sin - y * cos) + 0.5) | 0;
    p = [xn, yn];
    return p;
}

//*************************************************************************************************
// FunktionsName:   setLineWidth
/// \details
/// from https://github.com/espruino/Espruino/issues/1702
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function setLineWidth(x1, y1, x2, y2, lw) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var d = Math.sqrt(dx * dx + dy * dy);
    dx = dx * lw / d;
    dy = dy * lw / d;

    return [
        // rounding
        x1 - (dx + dy) / 2, y1 - (dy - dx) / 2,
        x1 - dx, y1 -dy,
        x1 + (dy - dx) / 2, y1 - (dx + dy) / 2,

        x1 + dy, y1 - dx,
        x2 + dy, y2 - dx,

        // rounding
        x2 + (dx + dy) / 2, y2 + (dy - dx) / 2,
        x2 + dx, y2 + dy,
        x2 - (dy - dx) / 2, y2 + (dx + dy) / 2,

        x2 - dy, y2 + dx,
        x1 - dy, y1 + dx
    ];
}

//*************************************************************************************************
// FunktionsName:   drawMixedClock
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
function drawMixedClock(force) {
  if ((force || Bangle.isLCDOn()) && buf.buffer) {
    var date = new Date();
    var dateArray = date.toString().split(" ");
    var isEn = locale.name.startsWith("en");
    var point = [];
    var start = [];
    var second = date.getSeconds();
    var minute = date.getMinutes();
    var hour = date.getHours();
    var radius;

    g.reset();
    buf.clear();

    buf.setColor(CLOCK);
    // draw date
    buf.setFont("6x8", 3);
    buf.setFontAlign(0, 0);
    //Wochentag
    //buf.drawString(locale.dow(date,true), Center.x - 116, Center.y + Radius.dots - 26, true);
    //Tag
    //buf.drawString((dateArray[2]), Center.x - 116, Center.y + Radius.dots - 6, true);
    //buf.setFontAlign(1, 0);
    //Monat
    //buf.drawString(locale.month(date,true), Center.x + 116, Center.y + Radius.dots - 26, true);
    //Jahr
    //buf.drawString(dateArray[3], Center.x + 116, Center.y + Radius.dots - 6, true);

    //Tag
    buf.setFont("6x8", 3);
    buf.setFontAlign(0, 0);
    buf.drawString((dateArray[2]), Center.x + 80, Center.y, true);
    buf.setFont("6x8", 2);

    // draw hour and minute dots
    for (i = 0; i < 60; i++) {
        radius = (i % 5) ? 4 : 0;
        //Punkte
        point = rotatePoint(0, Radius.dots, i * 30); // 30 = Minuten; 6 = Sekunden
        buf.fillCircle(point[0], point[1], radius);
        //Linien
        point = rotatePoint(0, Radius.dots, i * 6);    // 30 = Minuten; 6 = Sekunden
        start = rotatePoint(0, Radius.dots - 5, i * 6);// 30 = Minuten; 6 = Sekunden
        buf.drawLine(start[0], start[1], point[0], point[1]);
        buf.fillPoly(setLineWidth(start[0], start[1], point[0], point[1], 1));
    }

    // draw digital time
    if(settings.cSize > 0)
    {
      buf.setFont("6x8", settings.cSize + 1);
      buf.setFontAlign(0, 0);
      buf.drawString(dateArray[4], Center.x, Center.y, true);
    }

    // draw new second hand
    point = rotatePoint(0, Radius.sec, second * 6);
    buf.drawLine(Center.x, Center.y, point[0], point[1]);
    buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.second));
    // draw backside for second hand
    point = rotatePoint(0, -Radius.sec / 3, second * 6);
    buf.drawLine(Center.x, Center.y, point[0], point[1]);
    buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.second));
    // draw new minute hand
    point = rotatePoint(0, Radius.min, minute * 6);
    buf.drawLine(Center.x, Center.y, point[0], point[1]);
    buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.minute));
    // draw new hour hand
    point = rotatePoint(0, Radius.hour, hour % 12 * 30 + date.getMinutes() / 2 | 0);
    buf.fillPoly(setLineWidth(Center.x, Center.y, point[0], point[1], Widths.hour));
    // draw center
    buf.fillCircle(Center.x, Center.y, Radius.center);

    if((settings.cShowRAM == true) || (settings.cDebug == true))
      showRAMUsage();

    drawBT();
    drawBatt();
    drawPEDO();

    g.drawImage({width:buf.getWidth(),height:buf.getHeight(),bpp:1,buffer:buf.buffer},0,24 + settings.cMoveCenter);
  }
}

//*************************************************************************************************
// FunktionsName:   Bangle.on
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
Bangle.on('lcdPower', function(on) {
  if (on)
    drawMixedClock(true);
    Bangle.drawWidgets();
});

//When Step is registered by firmware
Bangle.on('step', (up) => {
  steps++; //increase step count
  calcSteps();
});

//*************************************************************************************************
// FunktionsName:
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
setInterval(() => drawMixedClock(true), 30000); // force an update every 30s even screen is off

g.clear();
//Bangle.loadWidgets();
//Bangle.drawWidgets();
drawMixedClock(); // immediately draw
setInterval(drawMixedClock, 500); // update twice a second

setStepSensitivity(settings.cStepSensitivity); //set step sensitivity (80 is standard, 400 is muss less sensitive)

// Show launcher when middle button pressed after freeing memory first
//setWatch(() => {Bangle.showLauncher()}, BTN2, {repeat:false,edge:"falling"});
setWatch(() => {delete buf.buffer; Bangle.showLauncher()}, BTN2, {repeat:false,edge:"falling"});
