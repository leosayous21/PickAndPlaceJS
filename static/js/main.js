//need to be loaded from the server
var xCalibration=43.18265676111665;
var yCalibration=42.48143916612829;
var xMove_mm=6;
var yMove_mm=6;
var imageI=0;
var imageJ=0;
var xDeviationSurY=0.6746094358403099;

var autoDraw={i:9, j:4};
var auto=true;
var allImages=[];

$(document).ready(function () {

    var socket = io.connect('http://192.168.0.4:8080');

    socket.on('image', function(info){
        if(info.image)
        {
            allImages.push(info);
            var img = new Image();
            img.src = 'data:image/jpeg;base64,' + info.buffer;
            img.onload = function(){
                drawImage(img, info.position.i, info.position.j);
                img=null;
            }

        }});

    socket.on('begin', function(mesage){
        socket.emit("setCalibration", false);
    });


    var moveX=function(){
        socket.emit("getImage", {i:imageI, j:imageJ});
        socket.emit("moveRelativeX", 6);
        imageI+=1;
        //xPicture+=6*xCalibration;

        if(auto){
            if(imageI<autoDraw.i)
            {
                setTimeout(moveX, 1500);
            }
            else if(imageJ<autoDraw.j)
            {
                setTimeout(moveY, 1500);
            }
            else
            {
                setTimeout(function() {
                    socket.emit("moveAbsolute", {x: 0, y: 0});
                    imageI = 0;
                    imageJ = 0;
                    allImages = 0;
                }, 1000);
            }
        }

    };
    $("#startX").click(moveX);


    var moveY=function(){
        socket.emit("getImage", {i:imageI, j:imageJ});
        socket.emit("moveAbsoluteX", 0);
        imageI=0;
        //xPicture=xDeviationSurY*yPicture/yCalibration;
        setTimeout(function(){
            socket.emit("moveRelativeY", -6);
            imageJ+=1;
            //yPicture+=6*yCalibration;

            setTimeout(function(){
            if(auto){
                if(imageI<autoDraw.i)
                {
                    setTimeout(moveX, 1500);
                }
                else if(imageJ<autoDraw.j)
                {
                    setTimeout(moveY, 1500);
                }
                else
                {
                    setTimeout(function() {
                        socket.emit("moveAbsolute", {x: 0, y: 0});
                        imageI = 0;
                        imageJ = 0;
                        allImages = 0;
                    }, 1000);
                }
            }},1500);
        }, 3000)};
    $("#startY").click(moveY);

    $("#goZero").click(function(){
        socket.emit("moveAbsolute", {x:0,y:0});
        imageI=0;
        imageJ=0;
        allImages=0;
    });

    $("#saveImage").click(function(){
        var img = imageCanvas.toDataURL("image/png");
        socket.emit("saveImage", img);
    });


    var z=0;
    $("#grid_canvas").click(function(){
       if(z==0)
       {
           socket.emit("moveAbsoluteZ", 20);
           z=20;
       }
        else
       {
           socket.emit("moveAbsoluteZ", 0);
           z=0;
       }
    });




    $("#info_panel").append("<div class='panel panel-default'> <div class='panel-body' id='calibrationPanel'></div> </div>");

    addInputText($("#calibrationPanel"), "xCalibration", xCalibration, function(newData){xCalibration=newData;drawAllImages();});
    addInputText($("#calibrationPanel"), "yCalibration", yCalibration, function(newData){yCalibration=newData;drawAllImages();});
    addInputText($("#calibrationPanel"), "xDeviationSurY", xDeviationSurY, function(newData){xDeviationSurY=newData;drawAllImages();});


    function addInputText(data, title, content, callback){
        var div=$("<div class='input-group'> </div>");
        var span=$("<span class='input-group-addon' id='"+title+"'>"+title+"</span>");
        var input=$("<input type='text' class='form-control' placeholder='"+content+"' aria-describedby='"+title+"' value='"+content+"'>");

        data.append(div);
        div.html(span);
        div.append(input);
        data.append("<br/>");


        input.blur(function(){
            callback(input.val());
            });

    }
});