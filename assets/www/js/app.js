/**
 * 
 */
var startApp = function() {
   
   var stream = {
       title: "RaBe",
       mp3: "http://stream.rabe.ch:8000/livestream/rabe-low.mp3"
   },
   ready = false;

   $("#jquery_jplayer_1").jPlayer({
       ready: function (event) {
           ready = true;
           $(this).jPlayer("setMedia", stream);
       },
       pause: function() {
           $(this).jPlayer("clearMedia");
       },
       error: function(event) {
           if(ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
               // Setup the media stream again and play it.
               $(this).jPlayer("setMedia", stream).jPlayer("play");
           }
       },
       supplied: "mp3",
       preload: "none",
       cssSelectorAncestor: "#jp_container",
       swfPath: "../swf",
       solution:"flash,html",
       wmode: "window"
   });
   
   // hack for opening ticker links externally
   $('.link').live('tap', function() {
       url = $(this).attr("rel");   
       loadURL(url);
   });

   function loadURL(url){
       navigator.app.loadUrl(url, { openExternal:true });
       return false;
   } 

};