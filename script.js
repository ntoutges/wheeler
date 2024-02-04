import { HInput, HToken } from "./hInput.js";
import { tokenize } from "./tokenizer.js";
import { Scene } from "./framework/src/module/scene.js";
import { GridWidget } from "./framework/src/module/widgets/grid.js";
import { BlockWidget } from "./framework/src/module/widgets/block.js";
import { PistonWidget, PlowWidget, WheelSetWidget } from "./wheelset.js";
import { buildBoiler, buildFirebox, buildPlow, getWheelTokens, rebuildWheels } from "./widgetRebuilder.js";

const $ = document.querySelector.bind(document);
const scene = new Scene({
  parent: $("#wheel-display"),
  widgets: [
    new GridWidget({
      style: {
        opacity: 0.3
      }
    })
  ],
  doStartCentered: true,
  options: {
    // scrollX: true,
    // scrollY: false,
    // zoom: {
    //   able: false
    // }
  }
});

const hInput = new HInput();

let plowWidget = null;

hInput.appendTo($("#wheel-input"));

hInput.onInput(() => {
  const tokens = tokenize(hInput.value);
  const wheelTokens = getWheelTokens(tokens);
  
  
  hInput.setTokens(tokens.concat(new HToken(-1, "black")));
  
  rebuildWheels(scene, wheelTokens);
  buildPlow(scene, wheelTokens.length > 2); // if less than 2, then not a train--just a cart
  buildBoiler(scene, wheelTokens.length > 2);
  buildFirebox(scene, wheelTokens.length > 2);
});