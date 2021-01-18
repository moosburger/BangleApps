(function(back) {

  const Storage = require("Storage");
  const filename = 'miclock2.json';
  let settings = Storage.readJSON(filename,1)|| null;

  function getSettings(){
    return {
      cDebug: false,
      cSize: 2,
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
      value : settings.size,
      min: 0,
      max: 2,
      step: 1,
      onchange : saveChange('size')
    },
    'Show RAM': {
      value: settings.cShowRAM,
      min: false,
      max: true,
      onchange: save('cShowRAM'),
    },
    'Max time (ms)': {
      value: settings.cMaxTime,
      min: 0,
      max: 10000,
      step: 100,
      onchange: save('cMaxTime'),
    },
    'Min time (ms)': {
      value: settings.cMinTime,
      min: 0,
      max: 500,
      step: 10,
      onchange: save('cMinTime'),
    },
    'Step threshold': {
      value: settings.sCtepThreshold,
      min: 0,
      max: 100,
      step: 1,
      onchange: save('cStepThreshold'),
    },
    'Act.Res. (ms)': {
      value: settings.cIntervalResetActive,
      min: 100,
      max: 100000,
      step: 1000,
      onchange: save('cIntervalResetActive'),
    },
    'Step sens.': {
      value: settings.cStepSensitivity,
      min: 0,
      max: 1000,
      step: 10,
      onchange: save('cStepSensitivity'),
    },
    'Step goal': {
      value: settings.cStepGoal,
      min: 1000,
      max: 100000,
      step: 1000,
      onchange: save('cStepGoal'),
    },
    'Debug': {
      value: settings.cDebug,
      min: false,
      max: true,
      onchange: save('cDebug'),
    },
    '< Back': back
  });
});
