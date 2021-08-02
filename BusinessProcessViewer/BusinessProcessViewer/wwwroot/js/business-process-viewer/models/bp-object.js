function BpObject(point, id) {
    this.Point = point;
    this.Width = 64;
    this.Height = 64;
    this.Id = id;

    this.IsOnObject = function(x, y) {
        return x > this.Point.X &&
            this.Point.X + this.Width < x &&
            y > this.Point.Y &&
            this.Point.Y + this.Height < y;
    }

    this.IsOnObject = function (point) {
        return this.Point.X < point.X &&
            this.Point.X + this.Width > point.X &&
            this.Point.Y < point.Y &&
            this.Point.Y + this.Height > point.Y;
    }
}