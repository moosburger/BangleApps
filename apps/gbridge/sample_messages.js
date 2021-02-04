/**
 * Some sample messages to test Gadgetbridge notifications
 */
// send both of these to trigger music notification
GB({"t":"musicinfo","artist":"Some Artist Name","album":"The Album Name","track":"The Track Title Goes Here","dur":241,"c":2,"n":2})
GB({"t":"musicinfo","artist":"Cohen, Leonard","album":"You want it darker","track":"Im ready my Lord","dur":241,"c":2,"n":2})
GB({"t":"musicstate","state":"play","position":0,"shuffle":1,"repeat":1})
GB({"t":"musicstate","state":"pause","position":0,"shuffle":1,"repeat":1})

// WhatsApp group
GB({"t":"notify","id":1592721712,"src":"WhatsApp","title":"Sample Group: Sam","body":"This is a test WhatsApp message"})
GB({"t":"notify","id":1592721714,"src":"WhatsApp","title":"Sample Group (2 messages): Robin","body":"This is another test WhatsApp message"})
GB({"t":"notify","id":1592721719,"src":"WhatsApp","title":"Sample Group (3 messages): Kim","body":"This is yet another test WhatsApp message, but it is really really really really really really long.  Almost as if somebody wanted to test how much characters you could stuff into a notification before all of the body text just wouldn't fit anymore."})

// Telegram
GB({"t":"notify","id":1575479849,"src":"Telegram FOSS","title":"Prexl, Gerhard","body":"message contents"})

// Alarm clock + dismissal
GB({"t":"notify","id":1592721714,"src":"ALARMCLOCKRECEIVER"})
GB({"t":"notify-","id":1592721714})

// Set Alarm
GB({"t":"alarm","d":[{"h":9,"m":35},{"h":9,"m":34}]}) 

// Weather update (doesn't show a notification, not handled by gbridge app: see weather app)
GB({"t":"weather","temp":288,"hum":94,"txt":"Light rain","wind":0,"loc":"Test City"})

// Nextcloud updated a file
GB({"t":"notify","id":1594184421,"src":"Nextcloud","title":"Downloaded","body":"test.file downloaded"})

//Telefoncall
GB({"t":"call","cmd":""})
GB({"t":"call","cmd":"","number":"+491234"})
GB({"t":"call","cmd":"","name":"name"})
GB({"t":"call","cmd":"","name":"name","number":"+491234"})
GB({"t":"call","cmd":"incoming","name":"name","number":"+491234"})

//Time
setTime(1612165843);E.setTimeZone(1.0);(s=>{s&&(s.timezone=1.0)&&require('Storage').write('setting.json',s);})(require('Storage').readJSON('setting.json',1))
