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
        io.sockets.sockets[i].volatile.emit('image', { image: true, buffer: im.toBuffer().toString('base64')});
    }
    //we restart the function
    camera.read(cameraCallback);
};

camera.read(cameraCallback);