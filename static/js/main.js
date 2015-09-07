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

    socket.on('begin', function(mesage){
        socket.emit("setCalibration", false);
    });

    var xPicture=0;
    var yPicture=0;
    $("#startX").click(function(){
        socket.emit("getImage", {x:xPicture, y:yPicture});
        socket.emit("moveRelativeX", 6);
        xPicture+=375.26*6/9;



    });

    $("#startY").click(function(){
        socket.emit("getImage", {x:xPicture, y:yPicture});
        socket.emit("moveAbsoluteX", 0);
        xPicture=4;
        setTimeout(function(){
            socket.emit("moveRelativeY", -6);
            yPicture+=375.26*6/9;
        }, 500);


    });

    $("#goZero").click(function(){
        socket.emit("moveAbsoluteX", 0);
        socket.emit("moveAbsoluteY", 0);
        xPicture=0;
        yPicture=0;
    });

});