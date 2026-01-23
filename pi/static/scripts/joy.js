console.Log = console.log;
const RGB_Log_Shade = (p, c) => {
  var i = parseInt,
    r = Math.round,
    [a, b, c, d] = c.split(","),
    P = p < 0,
    t = P ? 0 : p * 255 ** 2,
    P = P ? 1 + p : 1 - p;
  return (
    "rgb" +
    (d ? "a(" : "(") +
    r((P * i(a[3] == "a" ? a.slice(5) : a.slice(4)) ** 2 + t) ** 0.5) +
    "," +
    r((P * i(b) ** 2 + t) ** 0.5) +
    "," +
    r((P * i(c) ** 2 + t) ** 0.5) +
    (d ? "," + d : ")")
  );
};

class Joystick {
  constructor(container, kwargs, callback) {
    this.containerElement =
      container instanceof HTMLElement
        ? container
        : document.getElementById(container);
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.containerElement.appendChild(this.canvas);
    this.orientation = kwargs?.orientation || "full"; // x, y, or full
    this.setSize();

    // Style
    this.strokeThickness = kwargs?.strokeThickness || 5;
    if (this.orientation !== "full") {
      this.strokeThickness = 0;
    }
    this.padding = 10;
    this.joyColor = kwargs?.joyColor || "black";
    this.stickColor = kwargs?.stickColor || "black";
    console.log(this.joyColor, this.stickColor);
    // Size and positioning
    this.maxSize = 500;
    this.cx = this.canvas.width / 2;
    this.cy = this.canvas.height / 2;
    this.sx = this.cx;
    this.sy = this.cy;
    this.fullRadius = Math.min(this.canvas.width, this.canvas.height) / 2;
    this.fullRadius -= this.strokeThickness / 2;
    this.fullRadius -= this.padding;

    this.stickRadius = this.canvas.height * 0.2;

    // State
    this.clicked = false;
    this.touchIndex = -1;
    this.callback = callback || function (dist, angle) {};

    // Mouse Events
    if (window.matchMedia("(pointer: coarse)").matches) {
      console.Log("Touch device detected");
      // Touch Events
      this.canvas.addEventListener("touchstart", this.mousedown.bind(this));
      this.canvas.addEventListener("touchmove", this.mousemove.bind(this));
      this.canvas.addEventListener("touchend", this.mouseup.bind(this));
    } else {
      console.log("Mouse device detected");
      this.canvas.addEventListener("mousedown", this.mousedown.bind(this));
      this.canvas.addEventListener("mousemove", this.mousemove.bind(this));
      this.canvas.addEventListener("mouseup", this.mouseup.bind(this));
    }

    this.draw();
  }

  setSize() {
    // Set canvas size to container size
    this.canvas.width = this.containerElement.clientWidth;
    this.canvas.height = this.containerElement.clientHeight;
    this.canvas.style.width = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.height + "px";
    console.Log(
      this.containerElement.clientWidth,
      this.containerElement.clientHeight,
    );
  }

  draw() {
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw container
    this.context.beginPath();
    this.context.fillStyle = this.joyColor;
    if (this.orientation === "x") {
      // Horizontal line only
      const thickness = this.stickRadius * 0.2;
      this.context.roundRect(
        this.cx - this.fullRadius,
        this.cy - thickness / 2,
        this.fullRadius * 2,
        thickness,
        thickness / 2,
      );
      this.context.fill();
    } else if (this.orientation === "y") {
      // Vertical line only
      const thickness = this.stickRadius * 0.2;
      this.context.roundRect(
        this.cx - thickness / 2,
        this.cy - this.fullRadius,
        thickness,
        this.fullRadius * 2,
        thickness / 2,
      );
      this.context.fill();
    } else {
      // Full circle
      this.context.arc(this.cx, this.cy, this.fullRadius, 0, 2 * Math.PI);
      this.context.lineWidth = this.strokeThickness;
      this.context.strokeStyle = this.joyColor;
      this.context.stroke();
    }

    // Draw stick
    this.context.beginPath();
    this.context.arc(this.sx, this.sy, this.stickRadius, 0, 2 * Math.PI);

    if (this.clicked) {
      this.context.fillStyle = "yellow";
    } else {
      this.context.fillStyle = this.stickColor;
    }
    this.context.fill();
  }

  isIn(x, y) {
    // Check if point is inside the joystick circle
    const dx = x - this.cx;
    const dy = y - this.cy;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    return distance <= this.stickRadius;
  }

  getMouse(event) {
    if (this.touchIndex === -1 || this.touchIndex >= event?.touches?.length) {
      this.touchIndex = event?.touches?.length - 1 || 0;
    }

    const touch = event?.touches?.[this.touchIndex];
    const x = touch.clientX || event.clientX;
    const y = touch.clientY || event.clientY;

    this.boundingBox = this.canvas.getBoundingClientRect();
    console.Log(
      `${this.boundingBox.top}, ${this.containerElement.getBoundingClientRect().top}`,
    );
    console.log(event?.touches?.[this.touchIndex]);

    return {
      x: x - this.boundingBox.left,
      y: y - this.boundingBox.top,
    };
  }

  mousedown(event) {
    const { x, y } = this.getMouse(event);
    console.Log(`Mouse down at ${x}, ${y}`);

    if (!x || !y) return;
    console.log(this.cx, this.cy, x, y);
    if (this.isIn(x, y)) {
      this.clicked = true;
    }
  }
  mousemove(event) {
    if (this.clicked) {
      const { x, y } = this.getMouse(event);

      if (!x || !y) return;

      this.sx = x;
      this.sy = y;
      if (this.orientation === "x") {
        this.sy = this.cy;
      } else if (this.orientation === "y") {
        this.sx = this.cx;
      }
      this.constrainStick();
      this.callback(...this.getInfo());
    }
    this.draw();
  }
  mouseup() {
    this.clicked = false;
    this.sx = this.cx;
    this.sy = this.cy;
    this.touchIndex = -1;
    this.callback(...this.getInfo());
    this.draw();
  }

  constrainStick() {
    let dx = this.sx - this.cx;
    let dy = this.sy - this.cy;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const threshhold = this.fullRadius - this.stickRadius;
    if (distance > threshhold) {
      this.sx = this.cx + threshhold * (dx / distance);
      this.sy = this.cy + threshhold * (dy / distance);
    }
  }

  getInfo() {
    const dx = this.sx - this.cx;
    this.dy = this.sy - this.cy;

    const distance = Math.sqrt(dx ** 2 + this.dy ** 2);
    const angle = Math.atan2(this.dy, dx) * (180 / Math.PI);
    return [distance, angle, distance / (this.fullRadius - this.stickRadius)];
  }
}
