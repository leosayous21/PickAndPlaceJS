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


});


var imageNumber=0;
var cameraCallback=function(err, im) {
    if (err) throw err;
    //im.save('original' + i + '.jpg');
    console.log("image"+imageNumber);


    imageNumber++;

    for(var i=0; i<io.sockets.sockets.length; i++){
        io.sockets.sockets[i].volatile.emit('image', { image: true, buffer: circleCalibration(im).toBuffer().toString('base64')});
    }



    //we restart the function
    camera.read(cameraCallback);
};

camera.read(cameraCallback);

function cameraCorrection(image){
    return image;
    var angleCorrection=0;
    image.rotate(angleCorrection);


    for(var i=0; i<io.sockets.sockets.length; i++){
        io.sockets.sockets[i].volatile.emit('image2', { image: true, buffer: image.toBuffer().toString('base64')});
    }

    var dy=parseInt(Math.sin(angleCorrection/180*Math.PI)*camHeight);
    var dx=parseInt(Math.sin(angleCorrection/180*Math.PI)*camWidth);

    console.log(dx+";"+dy+";"+(camWidth-2*dx)+";"+(camHeight-2*dy));
    return image.crop(dx, dy, camWidth-2*dx, camHeight-2*dy);
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

    /*
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
    */
/*
    var contours = im.findContours();
    console.log(contours);*/
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
    ancienneImage.ellipse(y_mean, x_mean, 2,2, RED, 3);

    for(var i=0; i<io.sockets.sockets.length; i++){
        io.sockets.sockets[i].volatile.emit('image2', { image: true, buffer: im.toBuffer().toString('base64')});
    }

    return ancienneImage;
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

