(function(back) {
  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }
  function settings() {
    let settings = require('Storage').readJSON("gbridge.json", true) || {
        showIcon : true,
        hrm : true
    };
    return settings;
  }
  function updateSetting(setting, value) {
    let settings = require('Storage').readJSON("gbridge.json", true) || {};
    settings[setting] = value;
    require('Storage').writeJSON('gbridge.json', settings);
  }
  function setIcon(visible) {
    updateSetting('showIcon', visible);
    // need to re-layout widgets
    WIDGETS.gbridgew.reload();
    g.clear();
    Bangle.drawWidgets();
  }
  var mainmenu = {
    "" : { "title" : "Gadgetbridge" },
    "< Back" : back,
    "Connected" : { value : NRF.getSecurityStatus().connected?"Yes":"No" },
    "Show Icon" : {
      value: settings().showIcon,
      format: v => v?"Yes":"No",
      onchange: setIcon
    },
    "Record HRM" : {
      value: settings().hrm,
      format: v => v?"Yes":"No",
      onchange: v => updateSetting('hrm', v)
    },
    "Find Phone" : function() { E.showMenu(findPhone); },
  };
  var findPhone = {
    "" : { "title" : "-- Find Phone --" },
    "On" : _=>gb({t:"findPhone",n:true}),
    "Off" : _=>gb({t:"findPhone",n:false}),
    "< Back" : function() { E.showMenu(mainmenu); },
  };
  E.showMenu(mainmenu);
});
