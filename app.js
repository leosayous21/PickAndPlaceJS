var cv = require('opencv');
var camWidth = 640;
var camHeight = 480;
var camFps = 40;
var camInterval = 1000 / camFps;
var i=0;

camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);


var cameraCallback=function(err, im) {
    if (err) throw err;
    //im.save('original' + i + '.jpg');
    console.log("image"+i);
    i++;
    camera.read(cameraCallback);
};

camera.read(cameraCallback);