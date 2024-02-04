import { BoilerWidget, FireboxWidget, PistonWidget, PlowWidget, WheelSetWidget } from "./wheelset.js";

const wheelWidgets = []; // { wheel: WheelSetWidget, piston?: PistonWidget }[]
const WHEEL_SPACING = 5;
const INTERWHEELSET_SPACING = 20;

export function getWheelTokens(tokens) {
  const wheelTokens = [];
  for (const token of tokens) {
    if (token.type == "value") wheelTokens.push(token);
  }
  return wheelTokens;
}

export function rebuildWheels(scene, wheelTokens) {
  const newWheelCount = wheelTokens.length;

  // remove extra wheels
  for (let i = wheelWidgets.length-1; i >= newWheelCount; i--) {
    wheelWidgets[i].wheel.close();
    if (wheelWidgets[i].piston) wheelWidgets[i].piston.close();
    wheelWidgets.splice(i,1);
   }

   // remove piston from trailing wheels
   if (newWheelCount > 0 && wheelWidgets.length >= newWheelCount && wheelWidgets[newWheelCount-1].piston) {
     const data = wheelWidgets[newWheelCount-1];
     data.piston.close();
     data.piston = null;
   }

   // generate wheels and pistons
  let offset = 0;
  for (const i in wheelTokens) {
    if (i >= wheelWidgets.length) { // new wheel required
      const data = buildWheelData(offset, scene, wheelTokens[i]);
      wheelWidgets.push(data);
    }
    else updateWheelData(offset, scene, wheelTokens[i], i); // old wheel can be used
    
    offset += updatePistonPosition(offset, i);
    
    const { size } = getWheelParams(wheelTokens[i]);
    offset += wheelWidgets[i].wheel.width*(size + WHEEL_SPACING) + INTERWHEELSET_SPACING;
  }
}

function getWheelParams(token) {
  const isGuide = token.isFirst || token.isLast;
  
  const size = isGuide ? 50 : 100;
  const count = token.value;
  return { isGuide, size, count };
}

function buildWheelData(offset, scene, token) {
  const { isGuide, size, count } = getWheelParams(token);

  const wheelWidget = new WheelSetWidget({
    size,
    spacing: WHEEL_SPACING,
    count,
    offset
  });
  let pistonWidget = null;

  if (!isGuide) {
    pistonWidget = new PistonWidget({
      width: 60,
      offsetY: -60
    });
    scene.addWidget(pistonWidget);
  }

  scene.addWidget(wheelWidget);
  const data = {
    wheel: wheelWidget,
    piston: pistonWidget
  };

  wheelWidget.draggable.listener.on("drag", () => {
    if (data.piston) {
      data.piston.pos.offsetPos({ x: -wheelWidget.draggable.delta.x });
    }
  });

  return data;
}

function updateWheelData(offset, scene, token, i) {
  const data = wheelWidgets[i];

  const { isGuide, size, count } = getWheelParams(token);

  // add in piston
  if (!isGuide && !data.piston) {
    data.piston = new PistonWidget({
      width: 60,
      offsetY: -60
    });
    scene.addWidget(data.piston);
  }

  data.wheel.pos.setPos({ x: offset });
  data.wheel.setWheelCount(count);
  data.wheel.setWheelSize(size);
}

function updatePistonPosition(offset, i) {
  if (wheelWidgets[i].piston) {
    const data = wheelWidgets[i];

    let addedGap = 0;
    if (i != 1) {
      addedGap = data.piston.width + 2 * WHEEL_SPACING - INTERWHEELSET_SPACING;
      data.wheel.pos.offsetPos({x: addedGap });
    }
    data.piston.pos.setPos({ x: addedGap + offset - WHEEL_SPACING })
    return addedGap;
  }
  return 0;
}

var buildableWidgets = {};
function doBuild(type, scene, doShow, onBuild) {
  if (doShow && !buildableWidgets.hasOwnProperty(type)) { // show widget
    const widget = onBuild();
    scene.addWidget(widget);
    buildableWidgets[type] = widget;
  }
  else if (!doShow && buildableWidgets.hasOwnProperty(type)) { // hide widget
    buildableWidgets[type].close();
    delete buildableWidgets[type];
  }
}

export function buildPlow(scene, doShow=true) {
  doBuild("plow", scene, doShow, () => {
    const plowWidget = new PlowWidget({
      height: 55
    });
    plowWidget.pos.setPos({ x: -20 });
    return plowWidget;
  });
}

export function buildBoiler(scene, doShow=true) {
  doBuild("body.boiler", scene, doShow, () => {
    const boilerWidget = new BoilerWidget({
      offsetY: -110,
      ratio: 0.2
    });

    function resizeFirebox() {
      const top = boilerWidget.pos.getPosComponent("y") - boilerWidget.bounds.getPosComponent("y");
      (buildableWidgets["body.firebox"])?.stretchTo(top);
    }

    boilerWidget.elListener.on("move", resizeFirebox);
    boilerWidget.elListener.on("resize", resizeFirebox);

    return boilerWidget;
  });

  if (buildableWidgets.hasOwnProperty("body.boiler")) {
    const boilerWidget = buildableWidgets["body.boiler"];
    boilerWidget.setStartWidget(wheelWidgets[0].wheel);
    boilerWidget.setEndWidget(wheelWidgets[wheelWidgets.length-1].wheel);
  }
}

export function buildFirebox(scene, doShow=true) {
  doBuild("body.firebox", scene, doShow, () => {
    const fireboxWidget = new FireboxWidget({
      offsetY: -60
    });
    return fireboxWidget;
  });
  
  if (buildableWidgets.hasOwnProperty("body.firebox")) {
    const fireboxWidget = buildableWidgets["body.firebox"];
    const lastWheelWidget = wheelWidgets[wheelWidgets.length-1].wheel;
    fireboxWidget.setStartWidget(lastWheelWidget);
    fireboxWidget.setEndWidget(lastWheelWidget);
  }
}
