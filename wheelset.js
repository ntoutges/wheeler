import { AttachableListener } from "./framework/src/module/attachableListener.js";
import { DraggableWidget } from "./framework/src/module/widgets/draggable-widget.js";

export class WheelSetWidget extends DraggableWidget {
  constructor({
    size = 1,
    spacing = 1,
    count = 1,
    offset = 0,
    color = ""
  }) {
    const wheelsEl = document.createElement("div");

    super({
      name: "wheel-set",
      content: wheelsEl,
      header: {
        "title": `Wheels`,
        "buttons": {
          "close": {
            "show": false
          },
          "collapse": {
            "show": false
          }
        }
      },
      options: {
        "hideOnInactivity": true,
        "draggable": {
          "scrollX": true,
          "scrollY": false
        }
      },
      pos: {
        "yAlign": "bottom"
      },
      style: {
        "background": "transparent"
      },
      doDragAll: true,
      doCursorDragIcon: true
    });

    wheelsEl.classList.add("wheels-container");
    wheelsEl.style.gap = `${spacing}px`;
    
    this.evenWheelsEl = document.createElement("div");
    this.evenWheelsEl.classList.add("wheels-container-even");
    this.oddWheelsEl = document.createElement("div");
    this.oddWheelsEl.classList.add("wheels-container-odd");

    wheelsEl.append(this.evenWheelsEl, this.oddWheelsEl);

    this.size = size;
    this.count = count;
    this.color = color;

    this.setPos(offset, 0);
    this.buildWheels();
  }

  buildWheels() {
    this.evenWheelsEl.innerHTML = "";
    this.oddWheelsEl.innerHTML = "";

    for (let i = 0; i < this.count / 2; i++) {
      const wheel = WheelSetWidget.buildWheel(this.size);
      wheel.style.background = this.color;
      this.evenWheelsEl.append(wheel);
    }

    if (this.count % 2 != 0) { // odd number of wheels
      this.oddWheelsEl.style.left = `${this.size/2}px`
      for (let i = 1; i < this.count / 2; i++) {
        const wheel = WheelSetWidget.buildWheel(this.size);
        wheel.style.background = this.color;
        this.oddWheelsEl.append(wheel);
      }
    }
  }

  setWheelCount(count) {
    this.count = count;
    this.buildWheels();
  }

  setWheelSize(size) {
    this.size = size;
    this.buildWheels();
  }

  static buildWheel(size) {
    const wheel = document.createElement("div");
    wheel.classList.add("wheels");

    wheel.style.width = `${size}px`;
    return wheel;
  }

  get width() {
    return Math.ceil(this.count / 2);
  }
}

export class PlowWidget extends DraggableWidget {
  constructor({
    height = 1
  }) {
    const plowEl = document.createElement("div");

    super({
      name: "plow",
      content: plowEl,
      header: {
        "show": false
      },
      options: {
        "hideOnInactivity": true,
        "draggable": {
          "scrollX": true,
          "scrollY": false
        }
      },
      pos: {
        "yAlign": "bottom",
        "xAlign": "right"
      },
      style: {
        "background": "transparent"
      },
      doDragAll: true,
      doCursorDragIcon: true
    });

    plowEl.classList.add("plows");
    plowEl.style.height = `${height}px`;
  }
}

export class PistonWidget extends DraggableWidget {
  constructor({
    width = 1,
    offsetX = 0,
    offsetY = 0
  }) {
    const pistonEl = document.createElement("div");

    super({
      name: "piston",
      content: pistonEl,
      header: {
        "show": false
      },
      options: {
        "hideOnInactivity": true,
        "draggable": {
          "scrollX": true,
          "scrollY": false
        }
      },
      pos: {
        "yAlign": "bottom",
        "xAlign": "right"
      },
      style: {
        "background": "transparent"
      },
      doDragAll: true,
      doCursorDragIcon: true,
      layer: 100
    });

    pistonEl.classList.add("pistons");
    pistonEl.style.width = `${width}px`;
    
    this.setPos(offsetX, offsetY);
    
    this.width = width;
  }
}

class TrainBodyWidget extends DraggableWidget {
  constructor({
    body,
    offsetY=0,
    ratio=0 // implies ratio will be ignored
  }) {
    super({
      name: "body",
      content: body,
      header: {
        "show": false
      },
      options: {
        "hideOnInactivity": true,
        "draggable": {
          "scrollX": false,
          "scrollY": true
        }
      },
      pos: {
        "yAlign": "bottom",
        "xAlign": "left"
      },
      style: {
        "background": "transparent"
      },
      doDragAll: true,
      doCursorDragIcon: true,
      layer: -1
    });

    body.classList.add("bodies");
    this.pos.setPos({ y: offsetY });
    this.ratio = ratio;

    this.startWidget = null;
    this.endWidget = null;

    this.startListener = new AttachableListener(() => this.startWidget.elListener);
    this.endListener = new AttachableListener(() => this.endWidget.elListener);

    this.startListener.on("resize", this.onEndpointMove.bind(this));
    this.startListener.on("move", this.onEndpointMove.bind(this));
    this.endListener.on("resize", this.onEndpointMove.bind(this));
    this.endListener.on("move", this.onEndpointMove.bind(this));
  }

  setStartWidget(widget) {
    this.startWidget = widget;
    this.startListener.updateValidity();
    this.onEndpointMove();
  }

  setEndWidget(widget) {
    this.endWidget = widget;
    this.endListener.updateValidity();
    this.onEndpointMove();
  }

  onEndpointMove() {
    if (!this.startWidget || !this.endWidget) return; // endpoints not defined

    const left = this.startWidget.pos.getPosComponent("x") + this.offsetLeft;
    const right = this.endWidget.pos.getPosComponent("x") + this.endWidget.bounds.getPosComponent("x") - this.offsetRight;

    const width = right - left;
    const body = this.body.querySelector(".bodies");
    
    body.style.width = `${width}px`;
    if (this.ratio > 0) body.style.height = `${width*this.ratio}px`;
    this.pos.setPos({ x: left });
  }

  get offsetLeft() { return 0; }
  get offsetRight() { return 0; }
}

export class BoilerWidget extends TrainBodyWidget {
  constructor({
    offsetY=0,
    ratio=0.3
  }) {
    const boilerEl = document.createElement("div");
    super({
      body: boilerEl,
      offsetY: offsetY,
      ratio
    });

    boilerEl.classList.add("boilers");
  }

  // cancel out width of end wheels
  get offsetRight() { return this.endWidget.bounds.getPosComponent("x"); }
}

export class FireboxWidget extends TrainBodyWidget {
  constructor({
    offsetY=0
  }) {
    const fireboxEl = document.createElement("div");
    super({
      body: fireboxEl,
      offsetY: offsetY
    });

    fireboxEl.classList.add("fireboxes");
    this.top = null;

    this.elListener.on("move", () => {
      if (this.top !== null) this.stretchTo(this.top);
    });
  }

  stretchTo(top) {
    this.top = top;
    const newHeight = this.pos.getPosComponent("y") - top;
    this.body.querySelector(".bodies").style.height = `${newHeight}px`;
  }
}