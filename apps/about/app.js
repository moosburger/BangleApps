var ENV = process.env;
var MEM = process.memory();
var s = require("Storage");

g.clear(1);
g.setFont("6x8", 2);
var y = 24, h=18;
g.drawImage(require("heatshrink").decompress(atob("vE4gQZWg//AAI3Zh4dCoAd6wAd64Ad2j4d6l4dcn4dC6Adc+AdYv4dUggHG//kgN//AGB1WkDpkOAwsH/gDBgJ4CTRwdGl6RDl/0gHQgJeMDo2/AgcDIAIkBnAdRgJyCAAQdDlgdRgZPDgbWBDoUcDqMPRYcJgEfoA7Uh9AAgQ1BEgIdBngdRKQIACmBbB6AdB2gdRnoEDyB+C8tbbQVpgNAqOkAwMGyEQDoMB1AIBvgdDPYMC+H//7zBg//+fAA4OAgH//twDoMv/4WB3iyEAAPwHINvTYMAv/A/sC6BmBh/wDoP4gIuBdwayBAAP/DoMH4F4ToQSB+EPJQUOgKmDBgIABhAdFB4L7BgfAAYNwjpKChwJBTIQdDiAdFgHgAYIdDmDaCO4MD9Wq14dM+CdCDoU0nDjChyhBAAIdFsgdTZgaVDmPYLJk0LIodDaIcxcILRDSo80jiVECgUAvgDCmG0YQTRHDoTRBgLRCMwJDBnodDeAMDKoUvAIU/DocD6ELDoKRCAIM/LIcGG4PQUIKCBU4PzDoaEB/p3BFQKKCh9ADoXsKIVVqonCtVBoFQcAUKyFwghdB3IPBCwJZCAQMfEgQAL2AGFgZJBDoZgDABEMWYQJFgLwCkACB/gdLWYMCfoQAE35BEDpkH8EfdgYADl4mDl68BABazBFBA2CgK8CABcBUZP/8kBv58CAC1//4ABUQwASn4dgOxoALl4dC4AdYj4d6h4d+wAd6oAd2g4dCAwQA=")),120,y);
g.drawString("BANGLEJS.COM",60,y-12);
g.drawString("Powered by Espruino",10,y+=50+h);
g.drawString("Version   "+ENV.VERSION,10,y+=h);
g.drawString("Commit    "+ENV.GIT_COMMIT,10,y+=h);
y+=h;
function getVersion(name,file) {
  var j = s.readJSON(file,1);
  var v = ("object"==typeof j)?j.version:false;
  g.drawString(v?(name+" "+(v?"v"+v:"Unknown")):"NO "+name,10,y+=h);
}
function getLauncher(name,file) {
  var j = s.readJSON(file,1);
  var v = ("object"==typeof j)?j.version:false;
  v?(getVersion(name,file)) : '';
}
getVersion ("Bootloader","boot.info");
getLauncher("Launcher  ","launch.info");
getLauncher("Toucher   ","toucher.info");
getVersion ("Settings  ","setting.info");
