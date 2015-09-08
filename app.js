var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var favicon = require('serve-favicon'); // Charge le middleware de favicon
var fs=require("fs");
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

    socket.emit('begin', null);

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

    socket.on('moveRelative', function(message){
        grbl.moveRelative(message);
    });

    socket.on('moveAbsolute', function(message){
        grbl.moveAbsolute(message);
    });


    socket.on("getCurrentStatus", function(message){
        grbl.getCurrentStatus();
    });

    socket.on("setCalibration", function(message){
        calibration=message;
        console.log("calibration="+message);
    });

    socket.on("getImage", function(message){
        getLastImage(message);
    });

    socket.on("setGrayThreshold", function(message){
        //BGR
        lower_threshold = [message.lower.B, message.lower.G, message.lower.R];
        upper_threshold = [message.upper.B, message.upper.G, message.upper.R];
    });

    socket.on("saveImage", function(message){
        var base64Data = message.replace(/^data:image\/png;base64,/, "");

        fs.writeFile("saved.png", base64Data, 'base64', function(err) {
            if(err)
            console.log(err);
            else
            console.log("Image saved successfully !");
        });
    });
});


var imageNumber=0;
var calibration=false;
var position={x:0, y:0};
var lastImage=null;
var cameraCallback=function(err, im) {
    if (err) throw err;
    //im.save('original' + i + '.jpg');
    //console.log("image"+imageNumber);

    //correct the angle rotation
    im=cameraCorrection(im);


    imageNumber++;

    position.x=im.width()*(imageNumber%14);
    position.y=im.height()*parseInt(imageNumber/14);

    lastImage=im;



    if(calibration)
    {
        var imageWithCalibratedPoint=circleCalibration(im);
        io.sockets.emit('image2', { image: true, buffer: imageWithCalibratedPoint.toBuffer().toString('base64'), position:position});

        io.sockets.emit('image', { image: true, buffer: lastImage.toBuffer().toString('base64'), position:position});

    }



    if(imageNumber>140)
    {
        imageNumber=0;
    }


    //we restart the function
    setTimeout(function(){camera.read(cameraCallback);}, 100);
};

camera.read(cameraCallback);

function cameraCorrection(image){
    var angleCorrection= -3.0053;
    image.rotate(angleCorrection);



    var dy=parseInt(Math.sin(Math.abs(angleCorrection)/180*Math.PI)*camHeight);
    var dx=parseInt(Math.sin(Math.abs(angleCorrection)/180*Math.PI)*camWidth);

    //var newImage=image.crop(dx, dy, camWidth-2*dx, camHeight-2*dy);
    var newImage=image.crop(170, 90, 300, 300);
    newImage.rotate(-90);
    return newImage;
}


var GREEN = [0, 255, 0]; // B, G, R
var WHITE = [255, 255, 255]; // B, G, R
var RED   = [0, 0, 255]; // B, G, R


var grayThreshold = 80;
// (B)lue, (G)reen, (R)ed
var lower_threshold = [grayThreshold,grayThreshold,grayThreshold];
var upper_threshold = [255,255,255];

cv.readImage('./files/coin1.jpg', function(err, im) {

});
function circleCalibration(im){
    var image=im.clone();
    image.medianBlur(5);
    image.inRange(lower_threshold, upper_threshold);

    var x_mean=0;
    var y_mean=0;
    var number=0;
    for(var x=0; x<image.height(); x+=3)
    {
        for(var y=0; y<image.width(); y+=3) {
            if (image.pixel(x, y) == 0) {
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
    //console.log(number);
    image.ellipse(y_mean, x_mean, 2,2, RED, 3);



    if(number==0)
        return image;

    io.sockets.emit("point", {x: x_mean, y: y_mean});

    return image;
}


function getLastImage(position){
    io.sockets.emit('image', { image: true, buffer: lastImage.toBuffer().toString('base64'), position:position});
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