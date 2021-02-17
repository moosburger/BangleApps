//WIDGETS = {};

(() => {
  require("Font7x11Numeric7Seg").add(Graphics);
  var stepTimeDiff = 9999; //Time difference between two steps
  var startTimeStep = new Date(); //set start time
  var stopTimeStep = 0; //Time after one step
  var timerResetActive = 0; //timer to reset active
  var steps = 0; //steps taken
  var stepsCounted = 0; //active steps counted
  var active = 0; //x steps in y seconds achieved
  var stepGoalPercent = 0; //percentage of step goal
  var stepGoalBarLength = 0; //length og progress bar
  var lastUpdate = new Date(); //used to reset counted steps on new day
  var width = 32; //width of widget

  const cMaxTime = 1100;
  const cMinTime = 240;
  const cStepThreshold = 30;
  const cIntervalResetActive = 30000;

  const s = require('Storage');
  const SETTINGS_FILE = 'pedometer.settings.json';
  const PEDOMFILE = "pedometer.steps.json";

  let settings;
  //load settings
  function loadSettings() {
    settings = s.readJSON(SETTINGS_FILE, 1) || {};
  }

  //return setting
  function setting(key) {
    //define default settings
    const DEFAULTS = {
      'stepSensitivity' : 80,
      'stepGoal' : 10000
    };
    if (!settings) { loadSettings(); }
    return (key in settings) ? settings[key] : DEFAULTS[key];
  }

  function setStepSensitivity(s) {
    function sqr(x) { return x*x; }
    var X=sqr(8192-s);
    var Y=sqr(8192+s);
    Bangle.setOptions({stepCounterThresholdLow:X,stepCounterThresholdHigh:Y});
  }

  //Set Active to 0
  function resetActive() {
    active = 0;
    steps = 0;
    if (Bangle.isLCDOn()) WIDGETS["pedometer"].draw();
  }

  function saveSteps(){
    let d = { //define array to write to file
      lastUpdate : lastUpdate.toISOString(),
      stepsToday : stepsCounted
    };
    s.write(PEDOMFILE,d); //write array to file
  }

  function calcSteps() {
    stopTimeStep = new Date(); //stop time after each step
    stepTimeDiff = stopTimeStep - startTimeStep; //time between steps in milliseconds
    startTimeStep = new Date(); //start time again

    //Remove step if time between first and second step is too long or too short
    if ((stepTimeDiff >= cMaxTime) || (stepTimeDiff <= cMinTime))
    { //milliseconds
      steps--;
    }

    //Step threshold reached
    if (steps >= cStepThreshold) {
      if (active == 0) {
        stepsCounted = stepsCounted + (cStepThreshold -1) ; //count steps needed to reach active status, last step is counted anyway, so treshold -1
      }
      active = 1;
      clearInterval(timerResetActive); //stop timer which resets active
      timerResetActive = setInterval(resetActive, cIntervalResetActive); //reset active after timer runs out
      steps = 0;
    }

    if (active == 1) {
      stepsCounted++; //count steps
      saveSteps();
    }
    settings = 0; //reset settings to save memory
  }

  function onConnect() {
    //Check if same day
    let date = new Date();
    if (lastUpdate.getDate() != date.getDate())
    { //different day, set all steps to 0
      stepsCounted = 0;
    }
    lastUpdate = date;
    saveSteps();
  }

  function draw() {
    var height = 23; //width is defined globaly

    //Check if same day
    let date = new Date();
    if (lastUpdate.getDate() != date.getDate())
    { //different day, set all steps to 0
      stepsCounted = 0;
    }
    lastUpdate = date;

    g.reset();
    g.clearRect(this.x, this.y, this.x+width, this.y + height);

    //draw numbers
    if (active == 1) g.setColor(0x07E0); //green
    else g.setColor(0xFFFF); //white
    g.setFont("7x11Numeric7Seg", 1);
    g.setFontAlign(1, -1); // align to x: center, y: center
    g.drawString(stepsCounted,this.x+width + 3,this);
    g.drawImage(atob("CgoCLguH9f2/7+v6/79f56CtAAAD9fw/n8Hx9A=="),this.x+(width-10)/2,this.y + 13);

    //draw step goal bar
    stepGoalPercent = (stepsCounted / setting('stepGoal')) * 100;
    stepGoalBarLength = width / 100 * stepGoalPercent;
    if (stepGoalBarLength > width) stepGoalBarLength = width; //do not draw across width of widget
    g.setColor(0xFFFF); //white
    g.fillRect(this.x, this.y+height, this.x+1, this.y+height-1); //draw start of bar
    g.fillRect(this.x+width, this.y+height, this.x+width-1, this.y+height-1); //draw end of bar
    g.fillRect(this.x+width, this.y+height, this.x+width-stepGoalBarLength, this.y+height); // draw progress bar

    settings = 0; //reset settings to save memory
  }

  //This event is called just before the device shuts down for commands such as reset(), load(), save(), E.reboot() or Bangle.off()
  E.on('kill', () => {
      saveSteps();
  });

  NRF.on("connect", () => setTimeout(onConnect, 1000));

  //When Step is registered by firmware
  Bangle.on('step', (up) => {
    steps++; //increase step count
    calcSteps();
    if (Bangle.isLCDOn()) WIDGETS["pedometer"].draw();
  });

  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) WIDGETS["pedometer"].draw();
  });

  //Read data from file and set variables
  let pedomData = s.readJSON(PEDOMFILE,1);
  if (pedomData) {
      if (pedomData.lastUpdate) lastUpdate = new Date(pedomData.lastUpdate);
      stepsCounted = pedomData.stepsToday|0;
  }
  pedomdata = 0; //reset pedomdata to save memory

  setStepSensitivity(setting('stepSensitivity')); //set step sensitivity (80 is standard, 400 is muss less sensitive)
  //Add widget
  WIDGETS["pedometer"]={area:"tl",width:width,draw:draw};
})();

//Bangle.drawWidgets();
