(function(back) {

  const Storage = require("Storage");
  const filename = 'miclock2.json';
  let settings = Storage.readJSON(filename,1)|| null;

  function getSettings(){
    return {
      cDebug: false,
      cSize: 2
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
    "Debug" : {
      value : settings.cDebug,
      format : v => v?"On":"Off",
      onchange : saveChange('cDebug')
    },
    '< Back': back
  });
});

