$(document).ready(function () {

    var socket = io.connect('http://192.168.0.4:8080');

    socket.on('image', function(info){
        if(info.image)
        {
            var img = new Image();
            img.src = 'data:image/jpeg;base64,' + info.buffer;
            img.onload = function(){
                drawImage(img, info.position.x, info.position.y);
                img=null;
            }

        }});



});