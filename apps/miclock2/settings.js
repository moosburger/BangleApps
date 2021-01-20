(function(back) {

  const Storage = require("Storage");
  const filename = 'miclock2.json';
  let settings = Storage.readJSON(filename,1)|| null;

  function getSettings(){
    return {
      cDebug: false,
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
  }

  function updateSettings() {
    require("Storage").writeJSON(filename, settings);
    Bangle.buzz();
  }

  if(!settings){
    settings = getSettings();
    updateSettings();
  }

  function saveChange(name){
    return function(v){
      settings[name] = v;
      updateSettings();
    };
  }

  E.showMenu({
    '': { 'title': 'Clock settings' },
    "Size dig. clock" : {
      value : settings.cSize,
      min: 0, max: 2, step: 1,
      onchange : saveChange('cSize')
    },
    "Center" : {
      value : settings.cMoveCenter,
      min : -30, max : 30, step : 1,
      onchange : saveChange('cMoveCenter')
    },
    "Diameter" : {
      value : settings.cDiameter,
      min : -30, max : 30, step : 1,
      onchange : saveChange('cDiameter')
    },
    "Show RAM": {
      value : settings.cShowRAM,
      format : v => v?"On":"Off",
      onchange : saveChange('cShowRAM')
    },
/*    "Max time (ms)": {
      value : settings.cMaxTime,
      min : 0, max : 10000, step : 100,
      onchange : saveChange('cMaxTime')
    },
    "Min time (ms)": {
      value : settings.cMinTime,
      min : 0, max : 500, step : 10,
      onchange : saveChange('cMinTime')
    },
    "Step threshold": {
      value : settings.cStepThreshold,
      min : 0, max : 100, step : 1,
      onchange : saveChange('cStepThreshold')
    },
    "Act.Res. (ms)": {
      value : settings.cIntervalResetActive,
      min : 100, max : 100000, step : 1000,
      onchange : saveChange('cIntervalResetActive')
    },
    "Step sens.": {
      value : settings.cStepSensitivity,
      min : 0, max : 1000, step : 10,
      onchange : saveChange('cStepSensitivity')
    },
    "Step goal": {
      value : settings.cStepGoal,
      min : 1000, max : 100000, step : 1000,
      onchange : saveChange('cStepGoal')
    },*/
    '< Back': back
  });
});

