(function(back) {

  const Storage = require("Storage");
  const filename = 'miclock2.json';
  let settings = Storage.readJSON(filename,1)|| null;

  function getSettings(){
    return {
      digital : true,
      size: 2
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
    "Size digital clock" : {
      value : settings.size,
      min: 0, max: 3, step: 1,
      onchange : saveChange('size')
    },
    '< Back': back
  });
});
