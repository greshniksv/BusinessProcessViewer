var BusinessProcessViewer = new function () {

    this.private = 0;
    this.container = null;
    this.lineNumber = 0;
    this.canvas = null;
    this.items = null;
    this.objects = [];
    this.mouse = new Point(0, 0);
    this.images = {}
    this.loaded = false;
    this.infoBoard = null;

    this.Draw = function (container, model) {
        this.container = container;
        this.items = model.$values;
        var width = 3000; //$(container).innerWidth();
        var height = 3000; // $(container).innerHeight();

        $(this.container).append("<canvas id=\"canvas_default\" width=\"" + width + "\" height=\"" + height + "\"></canvas>");
        this.canvas = document.querySelector("#canvas_default");

        this.addVisualComponents();


        this.canvas.addEventListener('mousemove', e => {
            var x = e.offsetX;
            var y = e.offsetY;

            this.mouse = new Point(x, y);
            
        });


        this.canvas.addEventListener('click', e => {

            var isOnObject = false;
            for (var i = 0; i < this.objects.length; i++) {
                var obj = this.objects[i];

                if (obj.IsOnObject(this.mouse)) {
                    isOnObject = true;
                    this.infoBoard = {
                        point: Object.assign({}, obj.Point),
                        id: obj.Id
                    };
                }
            }

            if (isOnObject === false) {
                this.infoBoard = null;
            }
        });



        this.canvas.addEventListener('dblclick', e => {

            for (var i = 0; i < this.objects.length; i++) {
                var obj = this.objects[i];
                if (obj.IsOnObject(this.mouse)) {
                    var item = this.findElement(obj.Id);
                    alert(JSON.stringify(item, null, '\t'));
                }
            }
        });


        window.setInterval(function () {
            BusinessProcessViewer.buildProcess(model);
        }, 20);
    }


    this.buildProcess = function () {

        var ctx = this.canvas.getContext('2d');

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, 3000, 3000);
        ctx.restore();
        ctx.beginPath();


        var width = $(this.container).innerWidth();
        var height = $(this.container).innerHeight();
        var center = width / 2;
        this.objects = [];

        //this.infoBoard = null;
        this.Render(this.items[0], center, 30);

        if (this.infoBoard !== null) {
            var pp = Object.assign({}, this.infoBoard.point);
            pp.IncX(70).IncY(10);
            this.drawInfo(new Point().Init(pp), this.findElement(this.infoBoard.id));
        }
    }

    this.Render = function (startElement, left, top) {

        var result = this.RenderBranch(startElement, left, top);
        var newBranches = result.events;
        var lastTop = result.top;


        // Calculate left and top
        var widthSum = 0;
        for (var j = 0; j < newBranches.length; j++) {
            widthSum += this.getBranchWidth(newBranches[j].step);
        }

        var startLeft = left - (widthSum / 2);
        var startTop = lastTop + 180;

        for (var i = 0; i < newBranches.length; i++) {
            startLeft = startLeft + (this.getBranchWidth(newBranches[i].step) / 2);
            this.Render(newBranches[i], startLeft, startTop);
            startLeft = startLeft + (this.getBranchWidth(newBranches[i].step) / 2);
        }

    }


    this.RenderBranch = function (startElement, left, top) {
        var events = [];

        var nextPoint = new Point(left, top);
        var next = startElement;
        var p = 0;
        while (next !== null) {

            if (p++ > 1000) {
                break;
            }

            if (next != null) {

                var type = next.type;
                var id = next.step;

                if (type === TaskType.Event) {
                    events.push(this.findElement(next.model.Position));
                }

                this.addElement(type, nextPoint, id);
                var prevPoint = nextPoint;

                nextPoint = new Point(nextPoint.X, nextPoint.Y + 120);

                if (next.type === TaskType.Condition) {

                    this.addRelation(prevPoint, new Point(nextPoint.X + 40, nextPoint.Y));
                    this.addRelation(prevPoint, new Point(nextPoint.X - 40, nextPoint.Y));

                    this.RenderBranch(this.findElement(next.success), nextPoint.X + 40, nextPoint.Y);
                    this.RenderBranch(this.findElement(next.fail), nextPoint.X - 40, nextPoint.Y);
                    break;

                } else {
                    if (next.success == null) {
                        break;
                    } else {
                        next = this.findElement(next.success);
                        this.addRelation(prevPoint, nextPoint);
                    }
                }

            }

        }

        return { events: events, top: nextPoint.Y };
    }

    this.getBranchWidth = function (id) {
        var width = 80;

        while (true) {
            var item = this.findElement(id);

            if (item.type === TaskType.Condition) {
                width += this.getBranchWidth(item.success);
                width += this.getBranchWidth(item.fail);
            }

            if (item.success == null) {
                break;
            }

            id = item.success;
        }

        return width;
    }


    this.addRelation = function (prevPoint, nextPoint) {
        this.addLine(
            new Point(prevPoint.X + 32, prevPoint.Y + 64),
            new Point(nextPoint.X + 32, nextPoint.Y));
    }

    this.findElement = function (id) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].step === id) {
                return this.items[i];
            }
        }

        return null;
    }

    this.addElement = function (type, point, id) {

        if (!this.loaded) {
            var object = new BpObject(point, id);
            this.objects.push(object);
        }

        var size = 64;

        //if (new BpObject(point, id).IsOnObject(this.mouse)) {
        //    //size = 72;
        //    this.infoBoard = {
        //        point: new Point().Init(point),
        //        id: id
        //    };
        //}

        switch (type) {

            case TaskType.Start:
                this.addImage(point, '/js/business-process-viewer/img/start.png', size);
                break;

            case TaskType.Condition:
                this.addImage(point, '/js/business-process-viewer/img/condition.png', size);
                break;

            case TaskType.Action:
                this.addImage(point, '/js/business-process-viewer/img/task.png', size);
                break;

            case TaskType.End:
                this.addImage(point, '/js/business-process-viewer/img/end.png', size);
                break;

            case TaskType.Event:
                this.addImage(point, '/js/business-process-viewer/img/create-event.png', size);
                break;

            case TaskType.EventLamp:
                this.addImage(point, '/js/business-process-viewer/img/lamp-event.png', size);
                break;

            case TaskType.Notification:
                this.addImage(point, '/js/business-process-viewer/img/notification.png', size);
                break;

            case TaskType.Stop:
                this.addImage(point, '/js/business-process-viewer/img/stop.png', size);
                break;

            default:
                this.addImage(point, '/js/business-process-viewer/img/unknown.png', size);
                break;
        }

    }

    this.addImage = function (point, src, size) {
        var ctx = this.canvas.getContext('2d');
        var self = this;

        if (typeof this.images[src] === "undefined") {
            var image = new Image();
            image.src = src;
            image.onload = function () {
                self.images[src] = image;
                ctx.drawImage(image, point.X, point.Y, size, size);
            }
        } else {
            ctx.drawImage(this.images[src], point.X, point.Y, size, size);
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

    this.addVisualComponents = function () {

        for (var i = 0; i < this.items.length; i++) {
            var item = this.items;

            if (item[i].type === TaskType.Event) {

                var newItem = {
                    "$type": "SigningPortal.BusinessProcess.Core.Models.BusinessProcessTask, SigningPortal.BusinessProcess.Core",
                    "step": this.genUuid(),
                    "type": 4,
                    "task": "",
                    "model": null,
                    "success": item[i].model.Position,
                    "fail": null
                };

                item[i].model.Position = newItem.step;
                this.items.push(newItem);
            }
        }
    }

    this.addPoint = function (pointFrom) {
        var ctx = this.canvas.getContext('2d');

        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue';

        var circle = new Path2D();
        circle.arc(pointFrom.X, pointFrom.Y, 5, 0, 2 * Math.PI);
        ctx.fill(circle);
    }

    this.drawInfo = function (point, item) {
        var ctx = this.canvas.getContext('2d');

        ctx.fillStyle = '#e6e6e6';
        var rectangle = new Path2D();
        rectangle.rect(point.X, point.Y, 440, 250);
        var rectangle2 = new Path2D();
        rectangle2.rect(point.X, point.Y, 440, 250);
        ctx.fill(rectangle);

        ctx.strokeStyle = '#4f4f4f';
        ctx.stroke(rectangle2);

        var settings = {
            "color": 'black',
            "font": '12px consolas'
        };

        point.IncX(10);

        var taskName = item.task.split(",")[0].split(".").slice(-1)[0];

        this.AddText("Type: " + this.getTaskTypeName(item.type), point.IncY(15), settings);
        this.AddText("Step: " + item.step, point.IncY(15), settings);
        this.AddText("Pass: " + item.type, point.IncY(15), settings);
        this.AddText("Task: " + taskName, point.IncY(15), settings);
        this.AddText("Success: " + item.success, point.IncY(15), settings);
        this.AddText("Fail: " + item.fail, point.IncY(15), settings);

        var model = Object.assign({}, item.model);
        delete model["$type"];

        this.AddText("Model: " , point.IncY(15), settings);

        var arr = JSON.stringify(model, null, '\t').split("\n");

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].length > 62) {
                arr[i] = arr[i].substring(0, 62)+"..>";
            }
            this.AddText(arr[i], point.IncY(15), settings);
        }
    }

    this.AddText = function (text, point, settings)
    {
        var ctx = this.canvas.getContext('2d');

        ctx.fillStyle = settings.color;
        ctx.font = settings.font;
        ctx.fillText(text, point.X, point.Y);
    }

    this.getTaskTypeName = function (num) {
        var arr = Object.keys(TaskType);
        for (var i = 0; i < arr.length; i++) {
            if (TaskType[arr[i]] === num) {
                return arr[i];
            }
        }

        return null;
    }

    this.genUuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}



