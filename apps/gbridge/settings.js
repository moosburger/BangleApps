(function(back) {
  const SETTINGS_FILE = 'gbridge.json'

  function gb(j) {
    Bluetooth.println(JSON.stringify(j));
  }
  let settings = {
    'showIcon' : true,
    'hrm' : true
  };
  const storage = require('Storage')
  const saved = storage.readJSON(SETTINGS_FILE, 1) || {}
  for (const key in saved) {
    settings[key] = saved[key];
  }
  function updateSetting(key) {
    return function (value) {
      settings[key] = value;
      storage.write(SETTINGS_FILE, settings);
    WIDGETS["gbridgew"].reload();
    }
  }
  const onOffFormat = b => (b ? 'Yes' : 'No')
  const mainmenu = {
    "" : { "title" : "Gadgetbridge" },
    "< Back" : back,
    "Connected" : { value : NRF.getSecurityStatus().connected?"Yes":"No" },
    "Show Icon" : {
      value: settings.showIcon,
      format: onOffFormat,
      onchange: updateSetting('showIcon'),
    },
    "Record HRM" : {
      value: settings.hrm,
      format: onOffFormat,
      onchange: v => updateSetting('hrm'),
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
})
