/**
 * Created by leopold on 07/09/15.
 */
mouseDown=false;
var dx=0;
var dy=0;

$(document).ready(function () {
    console.log("document ready");

    //mouse interaction
    gridCanvas.onmousedown = function (event) {
        mouseDown = true;
        dx=parseInt(event.clientX/grid.size)-grid.xOffset;
        dy=parseInt(event.clientY/grid.size)-grid.yOffset;
    };
    gridCanvas.onmouseup = function (event) {
        mouseDown = false;

        draw();
    };
    gridCanvas.onclick = function (event) {
    };
    gridCanvas.onmousemove = function (event) {
        if (!mouseDown)
            return;

        grid.xOffset = parseInt(event.clientX / grid.size) - dx;
        grid.yOffset = parseInt(event.clientY / grid.size) - dy;

        draw();
    };




    var scale = 1;  // scale of the image
    // if mousewheel is moved
    $("#grid_canvas").bind('mousewheel',function(e)
    {
        console.log("wheel");
        // find current location on screen
        var xScreen = e.pageX - $(this).offset().left;
        var yScreen = e.pageY - $(this).offset().top;




        // determine the new scale
        if (e.originalEvent.wheelDelta > 0)
        {
            scale *= 1.02;

        }
        else
        {
            scale /= 1.02;
        }
        scale = scale < 0.1 ? 0.1 : (scale > 5 ? 5 : scale);



        grid.xOffset+=xScreen/(parseInt(scale*100)/100)-xScreen/grid.size;
        grid.yOffset+=yScreen/(parseInt(scale*100)/100)-yScreen/grid.size;



        // redraw
        grid.size=parseInt(scale*100)/100;
        console.log(scale);
        draw();
        return false;
    });
});