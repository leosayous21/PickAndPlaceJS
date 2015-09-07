var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var favicon = require('serve-favicon'); // Charge le middleware de favicon

var app = express();


//for camera stream
var cv = require('opencv');
var camWidth = 640;
var camHeight = 480;
var camFps = 40;
var camInterval = 1000 / camFps;

camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);


app.use(morgan('dev')) // Active le middleware de logging
    .use(express.static(__dirname + '/static')); // Indique que le dossier /static contient des fichiers statiques (middleware chargé de base)


//recupere les routes
app.get('/calibration', function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.render('calibration.ejs',  {random:Math.random()});
        });

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.render('main.ejs',  {random:Math.random()});
});


app.use(function(req, res, next){
        res.setHeader('Content-Type', 'text/plain');
        res.status(404).send('Page introuvable !');
        });



//SOCKET IO
var server=app.listen(8080);

var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {

    socket.on('moveRelativeX', function(message){
        grbl.moveRelativeX(message);
    });

    socket.on('moveAbsoluteX', function(message){
        grbl.moveAbsoluteX(message);
    });

    socket.on('moveRelativeY', function(message){
        grbl.moveRelativeY(message);
    });

    socket.on('moveAbsoluteY', function(message){
        grbl.moveAbsoluteY(message);
    });
});


var imageNumber=0;
var calibration=false;
var position={x:0, y:0};
var cameraCallback=function(err, im) {
    if (err) throw err;
    //im.save('original' + i + '.jpg');
    console.log("image"+imageNumber);

    //correct the angle rotation
    im=cameraCorrection(im);


    imageNumber++;

    if(calibration)
    {
        var imageWithCalibratedPoint=circleCalibration(im);
        for(var i=0; i<io.sockets.sockets.length; i++){
            io.sockets.sockets[i].volatile.emit('image2', { image: true, buffer: imageWithCalibratedPoint.toBuffer().toString('base64')});
        }
    }

    position.x=im.width()*(imageNumber%7);
    position.y=im.height()*parseInt(imageNumber/7);

    for(var i=0; i<io.sockets.sockets.length; i++){
        io.sockets.sockets[i].volatile.emit('image', { image: true, buffer: im.toBuffer().toString('base64'), position:position});
    }

    if(imageNumber>35)
    {
        imageNumber=0;
    }


    //we restart the function
    setTimeout(function(){camera.read(cameraCallback);}, 300);
};

camera.read(cameraCallback);

function cameraCorrection(image){
    var angleCorrection= -3.0053;
    image.rotate(angleCorrection);



    var dy=parseInt(Math.sin(Math.abs(angleCorrection)/180*Math.PI)*camHeight);
    var dx=parseInt(Math.sin(Math.abs(angleCorrection)/180*Math.PI)*camWidth);

    var newImage=image.crop(dx, dy, camWidth-2*dx, camHeight-2*dy);
    newImage.rotate(-90);
    return newImage;
}


var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R


// (B)lue, (G)reen, (R)ed
var lower_threshold = [80,80,80];
var upper_threshold = [255,255,255];

cv.readImage('./files/coin1.jpg', function(err, im) {

});
function circleCalibration(im){
    var ancienneImage=im.clone();
    im.medianBlur(5);
    im.inRange(lower_threshold, upper_threshold);

    var x_mean=0;
    var y_mean=0;
    var number=0;
    for(var x=0; x<im.height(); x+=3)
    {
        for(var y=0; y<im.width(); y+=3) {
            if (im.pixel(x, y) == 0) {
                x_mean+=x;
                y_mean+=y;
                number++;
            }
        }
    }
    if(number!=0) {
        x_mean = x_mean / number;
        y_mean = y_mean / number;
    }
    console.log(number);
    im.ellipse(y_mean, x_mean, 2,2, RED, 3);



    if(imageNumber%5==0) {

        if(number==0)
            return;

        io.sockets.emit("point", {x: x_mean, y: y_mean});
    }
    return;
}

/*
function circleCalibration(im){
    var ancienneImage=im.clone();
    im.convertGrayscale();
    im.medianBlur(5);

    var circles=im.houghCircles(2, 30, 50, 240, 20, 130);



    for(var i=0; i<circles.length; i++)
    {
        var rayon=circles[i][2];
        ancienneImage.ellipse(circles[i][0], circles[i][1], 2,2, RED, 3);
        ancienneImage.ellipse(circles[i][0], circles[i][1], rayon, rayon, GREEN, 3);
    }
    console.log(circles);

    return ancienneImage;
}*/

var grbl=require("./grbl");