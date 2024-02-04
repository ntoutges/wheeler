import { HInput, HToken } from "./hInput.js";
import { tokenize } from "./tokenizer.js";
import { Scene } from "./framework/src/module/scene.js";
import { GridWidget } from "./framework/src/module/widgets/grid.js";
import { buildBoiler, buildFirebox, buildPlow, getWheelTokens, rebuildWheels } from "./widgetRebuilder.js";
import * as trainTypes from "./trainType.js";
import { getObjectFromPattern } from "./patterns.js";

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
hInput.appendTo($("#wheel-input"));
hInput.onInput(() => {
  const tokens = tokenize(hInput.value);
  const wheelTokens = getWheelTokens(tokens);
  
  
  hInput.setTokens(tokens.concat(new HToken(-1, "black")));
  
  rebuildWheels(scene, wheelTokens);
  buildPlow(scene, wheelTokens.length > 2); // if less than 2, then not a train--just a cart
  buildBoiler(scene, wheelTokens.length > 2);
  buildFirebox(scene, wheelTokens.length > 2);

  const config = wheelTokens.map(token => token.value).join("-");
  const type = trainTypes.getTrainType(wheelTokens.length);
  const descData = trainTypes.getTrainDesc(type,config);

  let name = "";
  let desc = "";
  let subtype = "";
  let expAdd = 0;
  if (descData) {
    name = descData.name ?? config;
    desc = (typeof descData.desc == "object") ?  getObjectFromPattern(descData.desc, 0) : descData.desc ?? ""; // handles exasperation (exp) levels
    expAdd += descData.exp ?? 0;
    subtype = descData["sub-type"] ?? "train";
  }
  console.table({name,desc,expAdd, subtype})
});

fetch("./data/type.json").then(data => data.json()).then(types => {
  trainTypes.initTypes(types);
});

fetch("./data/desc.json").then(data => data.json()).then(types => {
  trainTypes.initDescs(types);
})
