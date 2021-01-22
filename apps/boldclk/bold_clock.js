
require("Font7x11Numeric7Seg").add(Graphics);

var hour_hand = {
  width : 74, height : 4, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/////////////////////////////////////////////////////////////////////////////////w=="))
};
var minute_hand = {
  width : 94, height : 4, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/////////////////////////////////////////////////////////////////////////w=="))
};
var second_hand = {
  width : 142, height : 2, bpp : 1,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("/////////////////////////////////////////////////////////////////////////w=="))
};

//g.fillRect(0,24,239,239); // Apps area
let intervalRef = null;
const p180 = Math.PI/180;
const clock_center = {x:Math.floor((240-1)/2), y:24+Math.floor((240-24)/2)};
// ={ x: 119, y: 131 }
const radius = Math.floor((239-24+1)/2); // =108

let tick0 = Graphics.createArrayBuffer(6,6,1,{msb:true});
tick0.fillCircle(3, 3, 2);

//let tick5 = Graphics.createArrayBuffer(6,6,1,{msb:true});
//tick5.fillRect(0,0,tick5.getWidth()-1, tick5.getHeight()-4);
let tick1 = Graphics.createArrayBuffer(8,2,1,{msb:true});
tick1.fillRect(0,0,tick1.getWidth()-4, tick1.getHeight()-1);

function big_wheel_x(angle){
  return clock_center.x + radius * Math.cos(angle*p180);
}
function big_wheel_y(angle){
  return clock_center.y + radius * Math.sin(angle*p180);
}
function rotate_around_x(center_x, angle, tick){
  return center_x + Math.cos(angle*p180) * tick.getWidth()/2;
}
function rotate_around_y(center_y, angle, tick){
  return center_y + Math.sin(angle*p180) * tick.getWidth()/2;
}
function hour_pos_x(angle){
  return clock_center.x + Math.cos(angle*p180) * hour_hand.width/2;
}
function hour_pos_y(angle){
  return clock_center.y + Math.sin(angle*p180) * hour_hand.width/2;
}
function minute_pos_x(angle){
  return clock_center.x + Math.cos(angle*p180) * minute_hand.width/2;
}
function minute_pos_y(angle){
  return clock_center.y + Math.sin(angle*p180) * minute_hand.width/2;
}
function second_pos_x(angle){
  return clock_center.x + Math.cos(angle*p180) * second_hand.width/5;
}
function second_pos_y(angle){
  return clock_center.y + Math.sin(angle*p180) * second_hand.width/5;
}

function second_angle(date){
  //let minutes = date.getMinutes() + date.getSeconds()/60;
  let seconds = date.getSeconds();
  return 6*seconds - 90;
}
function minute_angle(date){
  //let minutes = date.getMinutes() + date.getSeconds()/60;
  let minutes = date.getMinutes();
  return 6*minutes - 90;
}
function hour_angle(date){
  let hours= date.getHours() + date.getMinutes()/60;
  return 30*hours - 90;
}

function draw_clock(){
  
  //console.log("draw_clock");
  let date = new Date();
  //g.clear();
  g.setBgColor(0,0,0);
  g.setColor(0,0,0);
  g.fillRect(0,24,239,239); // clear app area
  g.setColor(1,1,1);

  // draw cross lines for testing
  g.setColor(0x0F00);
  // Y - Mittelpunkt der Uhr, mit 24px oben für Widget
  g.drawLine(1, 134 - 2, 240, 134 - 2);
  g.drawLine(120, 1, 120, 240);
  g.setColor(0xF000);
  // Y - Mittelpunkt Display
  g.drawLine(1, 120, 240, 120);
  // WidgetGrenze
  g.drawLine(1, 24, 238, 24);

  g.setColor(1,1,1);
  
  let hour_agl = hour_angle(date);
  let minute_agl = minute_angle(date);
  let second_agl = second_angle(date);
  g.drawImage(hour_hand, hour_pos_x(hour_agl), hour_pos_y(hour_agl), {rotate:hour_agl*p180}); //
  g.drawImage(minute_hand, minute_pos_x(minute_agl), minute_pos_y(minute_agl), {rotate:minute_agl*p180}); //
  g.drawImage(second_hand, second_pos_x(second_agl), second_pos_y(second_agl), {rotate:second_agl*p180}); //
  g.setColor(1,1,1);
  g.fillCircle(clock_center.x, clock_center.y, 6);
  g.setColor(0,0,0);
  g.fillCircle(clock_center.x, clock_center.y, 3);

  // draw minute ticks. Takes long time to draw!
  g.setColor(1,1,1);
  for (var i=0; i<60; i++)
  {
    let agl = i*6+180;
    if (i % 5 == 0)
    {
      g.drawImage(tick0.asImage(), rotate_around_x(big_wheel_x(i*6), agl, tick0), rotate_around_y(big_wheel_y(i*6), agl, tick0), {rotate:agl*p180});
      /*if (i != 15)
        g.drawString(i/5 , point[0], point[1], true);*/
    }
    else
    {
      g.drawImage(tick1.asImage(), rotate_around_x(big_wheel_x(i*6), agl, tick1), rotate_around_y(big_wheel_y(i*6), agl, tick1), {rotate:agl*p180});
    }
  }

  g.setFont("6x8", 2);
  var m = process.memory();
  var pc = Math.round(m.usage*100/m.total);
  g.drawString(pc+"%", 125, 80, true);

  g.flip();
  //console.log(date);
}
function clearTimers(){
  //console.log("clearTimers");
  if(intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    //console.log("interval is cleared");
  }
}
function startTimers(){
  //console.log("startTimers");
  if(intervalRef) clearTimers();
  intervalRef = setInterval(draw_clock, 1000);
  //console.log("interval is set");
  draw_clock();
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    //console.log("lcdPower: on");
    Bangle.drawWidgets();
    startTimers();
  } else {
    //console.log("lcdPower: off");
    clearTimers();
  }
});
Bangle.on('faceUp',function(up){
  //console.log("faceUp: " + up + " LCD: " + Bangle.isLCDOn());
  if (up && !Bangle.isLCDOn()) {
    //console.log("faceUp and LCD off");
    clearTimers();
    Bangle.setLCDPower(true);
  }
});
Bangle.on('touch', function(button) {
  Bangle.showLauncher();
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
startTimers();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
