var globalData;
$(document).ready(function() {
    $.get( "http://localhost:3000/tts", function( data ) {
        globalData = data;
        document.getElementById("json").textContent = JSON.stringify(data, undefined, 2);
    }); 
});

function saveToMongo(){
   $.post("http://localhost:3000/tts", globalData, function(result){
    alert(result.message);
  });

}