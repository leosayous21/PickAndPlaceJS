var SerialPort = require("serialport").SerialPort;

var serialPortGrbl = new SerialPort("/dev/tty.usbmodem1411", {baudrate: 115200}, false);

serialPortGrbl.on('close', function(error){
});

serialPortGrbl.on('error', function(){
});

serialPortGrbl.open(function (error) {

    serialPortGrbl.on('data', function (data) {
        //data reçu on va les traiter!
        if(data=="ok")
        {
            serialPortGrbl.write("?\r");
        }
        else
        {
            console.log(data.toString());
        }
    });
});

var x=0;
var y=0;
var z=0;

// X AXIS
function moveRelativeX(distance){
    x+=distance;
    serialPortGrbl.write("G0 X"+x+"\r");


}
exports.moveRelativeX=moveRelativeX;

function moveAbsoluteX(distance){
    x=distance;
    serialPortGrbl.write("G0 X"+x+"\r");
}
exports.moveAbsoluteX=moveAbsoluteX;


// Y AXIS
function moveRelativeY(distance){
    y+=distance;
    serialPortGrbl.write("G0 Y"+y+"\r");


}
exports.moveRelativeY=moveRelativeY;

function moveAbsoluteY(distance){
    y=distance;
    serialPortGrbl.write("G0 Y"+y+"\r");
}
exports.moveAbsoluteY=moveAbsoluteY;

//Z AXIS
function moveAbsoluteZ(distance){
    z=distance;
    serialPortGrbl.write("G0 Z"+distance+"\r");
}
exports.moveAbsoluteZ=moveAbsoluteZ;



//BOTH AXIS
function moveRelative(distance){
    y+=distance.y;
    x+=distance.x;
    serialPortGrbl.write("G0 X"+x+" Y"+y+"\r");


}
exports.moveRelative=moveRelative;

function moveAbsolute(distance){
    y=distance.y;
    x=distance.x;
    serialPortGrbl.write("G0 X"+x+" Y"+y+"\r");
}
exports.moveAbsolute=moveAbsolute;


//Curent status !
function getCurrentStatus(){
    serialPortGrbl.write("?\r");
}
exports.getCurrentStatus=getCurrentStatus;