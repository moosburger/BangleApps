
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
require("Font7x11Numeric7Seg").add(Graphics);

/**************************************************************************************************
* Defines
* jshint esversion: 6
**************************************************************************************************/
const cDiameter = 14;
const Radius = { "center": 6, "hour": 60 + 14, "min": 80 + cDiameter, "sec" : 85 + cDiameter, "dots": 93 + cDiameter };
const Center = { "x": 120, "y": 108};
const Widths = { hour: 2, minute: 2, second: 1 };
var buf = Graphics.createArrayBuffer(240,216,1,{msb:true});

/**************************************************************************************************
* Variablen
**************************************************************************************************/

/**************************************************************************************************
* Funktionen
**************************************************************************************************/

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
    var dateArray = date.toString().split(" ")[2];
    var point = [];
    var start = [];
    var second = date.getSeconds();
    var minute = date.getMinutes();
    var hour = date.getHours();

    g.reset();
    buf.clear();

    buf.setColor(-1);
    // draw date
    buf.setFont("7x11Numeric7Seg", 2);
    buf.setFontAlign(0, 0);
    buf.drawString((dateArray), Center.x + Radius.dots - 30, Center.y, true);

    // draw hour and minute dots
    for (i = 1; i < 61; i++) {
        if ((i % 5 == 0) && (i != 15))
        { //Punkte
          point = rotatePoint(0, Radius.dots -3, i * 6);
          buf.fillCircle(point[0], point[1], 2);
          buf.setFont("7x11Numeric7Seg", 2);
          point = rotatePoint(0, Radius.dots - 20, i * 6);
          buf.drawString(i/5 , point[0], point[1], true);
        }
        else
        {
          //Linien
          point = rotatePoint(0, Radius.dots, i * 6);
          start = rotatePoint(0, Radius.dots - 6, i * 6);
          buf.drawLine(start[0], start[1], point[0], point[1]);
          buf.fillPoly(setLineWidth(start[0], start[1], point[0], point[1], 1));
        }
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
    
    g.drawImage({width:buf.getWidth(),height:buf.getHeight(),bpp:1,buffer:buf.buffer}, 0, 38 - cDiameter);
  }
}

//*************************************************************************************************
// FunktionsName:   Bangle.on
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
Bangle.on('lcdPower', function(on) {
  if (on){
    drawMixedClock(true);
    Bangle.drawWidgets();
  }
});
/*Bangle.on('faceUp',function(up){
  if (up && !Bangle.isLCDOn()) {
    drawMixedClock(true);
  }
});
Bangle.on('touch', function(button) {
  Bangle.showLauncher();
});*/

//*************************************************************************************************
// FunktionsName:
/// \details
/// \param[in]      -
/// \return         -
//*************************************************************************************************
setInterval(() => drawMixedClock(true), 30000); // force an update every 30s even screen is off

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawMixedClock(); // immediately draw
setInterval(drawMixedClock, 500); // update twice a second

// Show launcher when middle button pressed after freeing memory first
setWatch(() => {delete buf.buffer; Bangle.showLauncher()}, BTN2, {repeat:false,edge:"falling"});

