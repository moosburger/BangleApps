(() => {
  // Music handling
  const state = {
    music: "stop",

    musicInfo: {
      artist: "",
      album: "",
      track: ""
    },

    scrollPos: 0
  };
  const s = require('Storage');
  const PEDOMFILE = "pedometer.steps.json";
  const cMaxTime = 1100;
  const cMinTime = 240;
  // activity reporting
  let currentSteps = 0, lastSentSteps=0; lastConnectDate=0;
  let activityInterval;
  let hrmTimeout;
  let callActive = false;
  let pedomData = 0;
  let isConnect = false;

  function settings() {
    let settings = require('Storage').readJSON("gbridge.json", true) || {};
    if (!("showIcon" in settings)) settings.showIcon = true;
    if (!("lastSentSteps" in settings)) settings.lastSentSteps = 0;
    if (!("lastConnectDate" in settings)) settings.lastConnectDate = "2020-02-02T00:0:00.000Z";
    return settings;
  }

  function gbSend(message) {
    Bluetooth.println("");
    Bluetooth.println(JSON.stringify(message));
  }

  function prettifyNotificationEvent(event) {
    switch (event.src) {
      case "ALARMCLOCKRECEIVER":
        return {
          id: event.id,
          title: event.title || "Alarm: "+require('locale').time(new Date(), true),
          body: event.body,
          // same icon as apps/alarm/app-icon.js
          icon: require("heatshrink").decompress(atob("mEwwkGswAhiMRCCAREAo4eHBIQLEAgwYHsIJDiwHB5gACBpIhHCoYZEGA4gFCw4ABGA4HEjgXJ4IXGAwcUB4VEmf//8zogICoJIFAodMBoNDCoIADmgJB4gXIFwXDCwoABngwFC4guB4k/CQXwh4EC+YMCC44iBp4qDC4n/+gNBC41sEIJCEC4v/GAPGC4dhXYRdFC4xhCCYIXCdQRdDC5HzegQXCsxGHC45IDCwQXCUgwXHJAIXGRogXJSIIXcOw4XIPAYXcBwv/mEDBAwXOgtQC65QGC5vzoEAJAx3Nmk/mEABIiPN+dDAQIwFC4zXGFwKRCGAjvMFwQECGAgXI4YuGGAUvAgU8C4/EFwwGCAgdMC4p4EFwobFOwoXDJAIoEAApGBC4xIEABJGHGAapEAAqNBFwwXD4heI+YuBC5BIBVQhdHIw4wD5inFS4IKCCxFmigNCokzCoMzogICoIWIsMRjgPCAA3BiMWC48RBQIXJEgMRFxAJCCw4lEC44IECooOIBAaBJKwhgIAH4ACA==")),
        };
      default:
        return event;
    }
  }
  function handleNotificationEvent(event) {
    if (event.t === "notify") {
      require("notify").show(prettifyNotificationEvent(event));
      Bangle.buzz(200);
    } else { // notify-
      require("notify").hide(event);
    }
  }

  function updateMusic(options){
    if (state.music === "play") {
      require("notify").show(Object.assign({
        size:120, id:"music",
        render:a => {
          //if (a.h>119) {
            // large:
            //    [icon]
            //    [    ]
            //   <artist>
            // ------------- middle of screen
            // <title>
            const iconSize = 24*3; // 24x24px, scale 3
            let x = a.x,
              y = a.y+a.h/2, // we use coords relative to vertical middle
              w=a.w,h=a.h;
            // try to fit musicInfo property into width
            const fitFont = (prop,max) => {
              if (!(prop in state.musicInfo)) return max;
              let size = Math.floor(w/(state.musicInfo[prop].length*6));
              if (size<1) {size=1;}
              if (size>max) {size=max;}
              return size;
            };
            let aSize = fitFont('artist',3);
            // TODO: split long title over multiple lines instead
            let tSize = fitFont('track',2);
            let bSize = fitFont('album',2);
            g.setColor(-1);
            // TODO: use a nicer large icon?
            g.drawImage(
              require("heatshrink").decompress(atob("jEYwILI/EAv/8gP/ARcMgOAASN8h+A/kfwP8n4CD/E/gHgjg/HA=")),
              x+(w-iconSize)/2, y-(iconSize+aSize*8)-12, {scale: 3});
            // artist: centered above middle
            g.setFontAlign(0, 1).setFont("6x8", aSize).drawString(state.musicInfo.artist, x+w/2, y-4);
            // title: left-aligned below middle
            g.setFontAlign(-1, -1).setFont("6x8", tSize).drawString(state.musicInfo.track, x, y+4);
            // album: centered at bottom
            if (state.musicInfo.album) {
              // note: using a.y rather than y
              g.setFontAlign(0, 1).setFont("6x8", bSize).drawString(state.musicInfo.album, x+w/2, a.y+h);
            }
        }}, options));
    }

    if (state.music === "pause") {
      require("notify").hide("music");
    }
  }
  function handleMusicStateUpdate(event) {
    if (state.music !== event.state) {
      state.music = event.state;
      updateMusic({on: true});
    }
  }
  function handleMusicInfoUpdate(event) {
    state.musicInfo = event;
    updateMusic({on: false});
  }

  function handleCallEvent(event) {
    if ((event.cmd === "") && ((event.name)||(event.number))){
      event.cmd = "incoming";}
    else if ((event.cmd === "") && (!callActive) && (!event.name) && (!event.number)){
      event.cmd = "incoming";
      event.name = "VoIP App";}
    else if ((event.cmd === "") && (callActive) && (!event.name) && (!event.number)){
      event.cmd = "end";}

    switch (event.cmd) {
      case "incoming":
        require("notify").show({
        size: 55, title: event.name, id: "call",
        body: event.number, icon:require("heatshrink").decompress(atob("jEYwIMJj4CCwACJh4CCCIMOAQMGAQMHAQMDAQMBCIMB4PwgHz/EAn4CBj4CBg4CBgACCAAw="))});
        Bangle.buzz(300);
        callActive = true;
        break;
      case "accept":
      case "outgoing":
      case "reject":
      case "start":
      case "end":
        require("notify").hide(event);
        callActive = false;
        break;
    }
  }

  function handleFindEvent(event) {
    if (state.find) {
      clearInterval(state.find);
      delete state.find;
    }
    if (event.n)
      state.find = setInterval(_=>{
        Bangle.buzz(200);
        setTimeout(_=>Bangle.beep(), 1000);
      },2000);
  }

  function handleActivityEvent(event) {
    let s = settings();
    // handle setting activity interval
    if (s.activityInterval===undefined ||
        s.activityInterval<30)
      s.activityInterval = 3*60; // 3 minutes default
    if (event.int) {
      if (event.int<30) event.int = 30; // min 30 secs
      s.activityInterval = event.int;
      require('Storage').writeJSON("gbridge.json", s);
    }
    // set up interval/HRM to handle activity data
    var interval = s.activityInterval;
    var realtime = event.hrm || event.stp;
    if (activityInterval)
      clearInterval(activityInterval);
    activityInterval = undefined;
    if (s.hrm) Bangle.setHRMPower(1);
    if (s.hrm) {
      if (realtime) {
        // if realtime reporting, leave HRM on and use that to trigger events
        hrmTimeout = undefined;
      } else {
        // else trigger it manually every so often
        hrmTimeout = 5;
        activityInterval = setInterval(function() {
          hrmTimeout = 5;
          Bangle.setHRMPower(1);
        }, interval*1000);
      }
    } else {
      // no HRM - manually push data
      if (realtime) interval=10;
      activityInterval = setInterval(function() {
        sendActivity(-1);
      }, interval*1000);
    }
    s = 0;
  }

  function openPedomFile(step){
    pedomData = s.readJSON(PEDOMFILE,1);
    if (pedomData) currentSteps = pedomData.stepsToday|0;
    pedomdata = 0; //reset pedomdata to save memory

    pedomdata = settings();
    if (pedomdata.lastConnectDate) lastConnectDate = new Date(pedomdata.lastConnectDate);
    if (lastSentSteps === 0) lastSentSteps = pedomdata.lastSentSteps|0;
    pedomdata = 0;
  }

  function savePedomFile(name, val){
    pedomdata = settings();
    pedomdata[name] = val;
    require('Storage').writeJSON('gbridge.json', pedomdata);

    pedomdata = 0; //reset pedomdata to save memory
  }

  function readPedomSteps(step){
    openPedomFile(step);
    if (currentSteps === 0){
      currentSteps = step;
      if (lastSentSteps === 0)
        lastSentSteps = currentSteps -1;
    }
    savePedomFile('lastSentSteps', lastSentSteps);
  }

  function onConnect() {
    isConnect = true;
    sendBattery();

    // Um die Werte aus dem PEDOMFILE zu lesen
    lastSentSteps = 0;
    openPedomFile(0);

    let date = new Date();
    if (lastConnectDate.getDate() != date.getDate())
    { //different day, set all steps to 0
      lastSentSteps = 0;
      savePedomFile('lastConnectDate', lastConnectDate.toISOString());
      savePedomFile('lastSentSteps', lastSentSteps);
    }
    sendActivity(-1);
  }

  function onDisconnect(){
    isConnect=false;
    callActive = false;
    savePedomFile('lastConnectDate', new Date().toISOString());
    savePedomFile('lastSentSteps', lastSentSteps);
  }

  var _GB = global.GB;
  global.GB = (event) => {
    switch (event.t) {
      case "notify":
      case "notify-":
        handleNotificationEvent(event);
        break;
      case "musicinfo":
        handleMusicInfoUpdate(event);
        break;
      case "musicstate":
        handleMusicStateUpdate(event);
        break;
      case "call":
        handleCallEvent(event);
        break;
      case "find":
        handleFindEvent(event);
        break;
      case "act":
        handleActivityEvent(event);
        break;
    }
    if(_GB)setTimeout(_GB,0,event);
  };

  Bangle.on("swipe", (dir) => {
    if (state.music === "play") {
      const command = dir > 0 ? "next" : "previous";
      gbSend({ t: "music", n: command });
    }
  });

  function draw() {
    g.setColor(-1);
    if (NRF.getSecurityStatus().connected)
      g.drawImage(require("heatshrink").decompress(atob("i0WwgHExAABCIwJCBYwJEBYkIBQ2ACgvzCwoECx/z/AKDD4WD+YLBEIYKCx//+cvnAKCBwU/mc4/8/HYv//Ev+Y4EEAePn43DBQkzn4rCEIoABBIwKHO4cjmczK42I6mqlqEEBQeIBQaDED4IgDUhi6KaBbmIA==")), this.x + 1, this.y + 1);
    else
      g.drawImage(require("heatshrink").decompress(atob("i0WwQFC1WgAgYFDAgIFClQFCwEK1W/AoIPB1f+CAMq1f7/WqwQPB/fq1Gq1/+/4dC/2/CAIaB/YbBAAO///qAoX/B4QbBDQQ7BDQQrBAAWoIIIACIIIVC0ECB4cACAZiBAoRtCAoIDBA")), this.x + 1, this.y + 1);
  }

  function changedConnectionState() {
    WIDGETS.gbridgew.draw();
    g.flip(); // turns screen on
  }

  function reload() {
    NRF.removeListener("connect", changedConnectionState);
    NRF.removeListener("disconnect", changedConnectionState);
    if (settings().showIcon) {
      WIDGETS.gbridgew.width = 24;
      WIDGETS.gbridgew.draw = draw;
      NRF.on("connect", changedConnectionState);
      NRF.on("disconnect", changedConnectionState);
    } else {
      WIDGETS.gbridgew.width = 0;
      WIDGETS.gbridgew.draw = ()=>{};
    }
  }

  function sendBattery() {
    gbSend({ t: "status", bat: E.getBattery() });
  }

  // Send a summary of activity to Gadgetbridge
  function sendActivity(hrm) {
    if (!isConnect) return;
    var steps = currentSteps - lastSentSteps;
    lastSentSteps = currentSteps;
    gbSend({ t: "act", stp: steps, hrm:hrm });
  }

  // OnConnect setSteps to send
  NRF.on("connect", () => setTimeout(onConnect, 10000));
  // Battery monitor
  //NRF.on("connect", () => setTimeout(sendBattery, 2000));
  setInterval(sendBattery, 10*60*1000);
  sendBattery();

  NRF.on("disconnect", () => onDisconnect());

  // Show launcher when middle button pressed
  setWatch(onConnect, BTN3, { repeat: true, edge: "falling" });

  // Activity monitor
  Bangle.on("step", s => {
    readPedomSteps(s);
  });
  Bangle.on('HRM',function(hrm) {
    var ok = hrm.confidence>80;
    if (hrmTimeout!==undefined) hrmTimeout--;
    if (ok || hrmTimeout<=0) {
      if (hrmTimeout!==undefined)
        Bangle.setHRMPower(0);
      sendActivity(hrm.confidence>50 ? hrm.bpm : -1);
    }
  });
  handleActivityEvent({}); // kicks off activity reporting

  // Finally add widget
  WIDGETS.gbridgew = {area: "tl", width: 24, draw: draw, reload: reload};
  reload();
})();
