var SerialPort = require("serialport").SerialPort;

var serialPortGrbl = new SerialPort("/dev/tty.usbmodem1411", {baudrate: 115200}, false);

serialPortGrbl.on('close', function(error){
});

serialPortGrbl.on('error', function(){
});

serialPortGrbl.open(function (error) {

    serialPortGrbl.on('data', function (data) {
        //data reçu on va les traiter!
        console.log("grbl data:"+data);
    });
});

var x=0;
var y=0;

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

