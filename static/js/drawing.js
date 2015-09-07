$(document).ready(function () {

    draw();


});

var grid={
    width:3000,
    height:3000,
    xOffset:0,
    yOffset:0,
    size:1
    };

var gridCanvas = document.getElementById("grid_canvas");
var ctx_grid = gridCanvas.getContext("2d");

var imageCanvas = document.getElementById("image_canvas");
var ctx_image = imageCanvas.getContext("2d");


function drawBackgroundGrid()
{
    //vertical
    var unite=parseInt(grid.width/50);
    for(var i=0; i<=unite; i++)
    {
        ctx_grid.beginPath();
        ctx_grid.lineWidth=1;
        ctx_grid.moveTo(parseInt(grid.size*(i*50))+grid.xOffset*grid.size,grid.yOffset*grid.size);
        ctx_grid.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx_grid.lineTo(parseInt(grid.size*(i*50))+grid.xOffset*grid.size,parseInt(grid.size*(grid.height))+grid.yOffset*grid.size);
        ctx_grid.stroke();
    }

    //horizontal
    unite=parseInt(grid.height/50);
    for(var i=0; i<=unite; i++)
    {
        ctx_grid.beginPath();
        ctx_grid.lineWidth=1;
        ctx_grid.moveTo(grid.xOffset*grid.size, parseInt(grid.size*(i*50))+grid.yOffset*grid.size);
        ctx_grid.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx_grid.lineTo(parseInt(grid.size*(grid.width))+grid.xOffset*grid.size,parseInt(grid.size*(i*50))+grid.yOffset*grid.size);
        ctx_grid.stroke();
    }


}

function draw(){
    //we erase the contenu
    ctx_grid.clearRect(-100, -100,  gridCanvas.width+100,  gridCanvas.height+100);

    ctx_grid.drawImage(imageCanvas,grid.xOffset*grid.size,grid.yOffset*grid.size, 3000*grid.size, 3000*grid.size);

    drawBackgroundGrid();
}

function drawImage(image, x,y){
    x=typeof x !== 'undefined' ? x : 0;
    y=typeof y !== 'undefined' ? y : 0;


    ctx_image.drawImage(image, x, y);

    draw();
}



//resize canvas
var windowSizeWidth=0;
var windowSizeHeight=0;


//function to resize the canvas
function resizeCanvas()
{
    if(windowSizeHeight!=$(window).height() || windowSizeWidth!=$(window).width())
    {
        windowSizeWidth=$(window).width();
        windowSizeHeight=$(window).height();
        $("#grid_canvas").attr('width',$(window).width()-2);
        $("#grid_canvas").attr('height',$(window).height()-70);
        $("#grid_canvas").css("margin-top","60px");
        $("#grid_canvas").css("margin-left","-30px");

        draw();

    }

    //we adjust the canvas to the screen

    setTimeout(function(){resizeCanvas()}, 1000);
}
resizeCanvas();