function BusinessProcessViewer() {

    this.private = 0;
    this.container = null;
    this.lineNumber = 0;
    this.canvas = null;

    this.Draw = function (container, model) {
        this.container = container;
        var width = $(container).innerWidth();
        var height = $(container).innerHeight();
        var center = width / 2;

        $(this.container).append("<canvas id=\"canvas_default\" width=\"" + width + "\" height=\"" + height + "\"></canvas>");
        this.canvas = document.querySelector("#canvas_default");

        this.addElement(TaskType.Start, new Point(center, 30));

        this.addElement(TaskType.Start, new Point(center, 150));
        

        this.addRelation(new Point(center, 30), new Point(center, 150));

    }

    this.addRelation = function (prevPoint, nextPoint)
    {
        this.addLine(
            new Point(prevPoint.X+32, prevPoint.Y+64), 
            new Point(nextPoint.X+32, nextPoint.Y));
    }


    this.addElement = function (type, point) {
        var ctx = this.canvas.getContext('2d');

        switch (type) {

            case TaskType.Start:

                this.addImage(point, '/js/business-process-viewer/img/start.png');
                break;

            default:
                this.addImage(point, '/js/business-process-viewer/img/start.png');
                break;

        }


    }

    this.addImage = function(point, src)
    {
        var ctx = this.canvas.getContext('2d'); 
        var image = new Image();
        image.src = src;
        image.onload = function(){
            ctx.drawImage(image,  point.X,  point.Y, 64, 64);
        }
    }

    this.addLine = function (pointFrom, pointTo) {
        var canvas = document.querySelector("#canvas_default");
        var ctx = canvas.getContext('2d');

        // set line stroke and line width
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        // draw a red line
        ctx.beginPath();
        ctx.moveTo(pointFrom.X, pointFrom.Y);
        ctx.lineTo(pointTo.X, pointTo.Y);
        ctx.stroke();

        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';

        var circle = new Path2D();
        circle.arc(pointFrom.X, pointFrom.Y, 5, 0, 2 * Math.PI);
        ctx.fill(circle);

        var circle2 = new Path2D();
        circle2.arc(pointTo.X, pointTo.Y, 5, 0, 2 * Math.PI);
        ctx.fill(circle2);
    }


}


