function Point(x, y) {
    this.X = x;
    this.Y = y;

    this.Init = function(point) {
        this.X = point.X;
        this.Y = point.Y;
        return this;
    }

    this.IncX = function(x) {
        this.X += x;
        return this;
    }

    this.IncY = function (y) {
        this.Y += y;
        return this;
    }
}