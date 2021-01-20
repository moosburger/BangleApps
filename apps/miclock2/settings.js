(function(back) {

  const Storage = require("Storage");
  const filename = 'miclock2.json';
  let settings = Storage.readJSON(filename,1)|| null;

  function getSettings(){
    return {
      cSize: 0,
      cDiameter : 23,
      cShowRAM: false
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
    "Diameter" : {
      value : settings.cDiameter,
      min : -10, max : 30, step : 1,
      onchange : saveChange('cDiameter')
    },
    "Show RAM": {
      value : settings.cShowRAM,
      format : v => v?"On":"Off",
      onchange : saveChange('cShowRAM')
    },
    '< Back': back
  });
});

