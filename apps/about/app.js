var ENV = process.env;
var MEM = process.memory();
var s = require("Storage");
require("Font8x12").add(Graphics);

g.clear(1);
g.setFont("8x12", 1);
var y = 24, h=12;
g.drawImage(require("heatshrink").decompress(atob("vE4gQZWg//AAI3Zh4dCoAd6wAd64Ad2j4d6l4dcn4dC6Adc+AdYv4dUggHG//kgN//AGB1WkDpkOAwsH/gDBgJ4CTRwdGl6RDl/0gHQgJeMDo2/AgcDIAIkBnAdRgJyCAAQdDlgdRgZPDgbWBDoUcDqMPRYcJgEfoA7Uh9AAgQ1BEgIdBngdRKQIACmBbB6AdB2gdRnoEDyB+C8tbbQVpgNAqOkAwMGyEQDoMB1AIBvgdDPYMC+H//7zBg//+fAA4OAgH//twDoMv/4WB3iyEAAPwHINvTYMAv/A/sC6BmBh/wDoP4gIuBdwayBAAP/DoMH4F4ToQSB+EPJQUOgKmDBgIABhAdFB4L7BgfAAYNwjpKChwJBTIQdDiAdFgHgAYIdDmDaCO4MD9Wq14dM+CdCDoU0nDjChyhBAAIdFsgdTZgaVDmPYLJk0LIodDaIcxcILRDSo80jiVECgUAvgDCmG0YQTRHDoTRBgLRCMwJDBnodDeAMDKoUvAIU/DocD6ELDoKRCAIM/LIcGG4PQUIKCBU4PzDoaEB/p3BFQKKCh9ADoXsKIVVqonCtVBoFQcAUKyFwghdB3IPBCwJZCAQMfEgQAL2AGFgZJBDoZgDABEMWYQJFgLwCkACB/gdLWYMCfoQAE35BEDpkH8EfdgYADl4mDl68BABazBFBA2CgK8CABcBUZP/8kBv58CAC1//4ABUQwASn4dgOxoALl4dC4AdYj4d6h4d+wAd6oAd2g4dCAwQA=")),120,y);
g.drawString("BANGLEJS.COM",120,y-4);
g.drawString("Powered by Espruino",0,y+=4+h);
g.drawString("Version "+ENV.VERSION,0,y+=h);
g.drawString("Commit "+ENV.GIT_COMMIT,0,y+=h);
function getVersion(name,file) {
  var j = s.readJSON(file,1);
  var v = ("object"==typeof j)?j.version:false;
  //g.drawString(v?(name+" "+(v?"v"+v:"Unknown")):"NO "+name,0,y+=h);
  y += (v? h:0);
  g.drawString(v?(name+": "+(v?"v"+v:"Unknown")):'',110,y);
}
y+=h;
g.setFontAlign(1,0);
getVersion("Bootloader","boot.info");
getVersion("Launcher","launch.info");
getVersion("Toucher","toucher.info");
getVersion("DT Launcher","dtlaunch.info");
getVersion("Settings","setting.info");
y+=h;
g.setFontAlign(-1,0);
g.drawString(MEM.total+" JS Variables available",0,y+=h);
g.drawString("Storage: "+(require("Storage").getFree()>>10)+"k free",0,y+=h);
if (ENV.STORAGE) g.drawString("         "+(ENV.STORAGE>>10)+"k total",0,y+=h);
if (ENV.SPIFLASH) g.drawString("SPI Flash: "+(ENV.SPIFLASH>>10)+"k",0,y+=h);
g.setFontAlign(0,0);
g.drawString(NRF.getAddress(),120,232);
g.flip();
