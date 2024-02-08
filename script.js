import { HInput, HToken } from "./hInput.js";
import { tokenize } from "./tokenizer.js";
import { Scene } from "./framework/src/module/scene.js";
import { GridWidget } from "./framework/src/module/widgets/grid.js";
import { buildBoiler, buildFirebox, buildPlow, getWheelTokens, rebuildWheels } from "./widgetRebuilder.js";
import * as trainTypes from "./trainType.js";
import { getObjectFromPattern } from "./patterns.js";
import * as typer from "./typeable.js";

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

// this scale is as follows
// 0:2 -> strange, but ok... treat as a wierd person and humor them
// 3:4 -> a little annoied, but altogether not too bad
// 5:  -> JUST STOP!

const minExp = 0;
const maxExp = 10;
var exp = 0;

const hInput = new HInput();
hInput.appendTo($("#wheel-input"));
hInput.onInput(() => {
  const tokens = tokenize(hInput.value);
  const wheelTokens = getWheelTokens(tokens);
  
  
  hInput.setTokens(tokens.concat(new HToken(-1, "black")));

  const config = wheelTokens.map(token => token.value).join("-");
  const type = trainTypes.getTrainType(wheelTokens.length);
  const descData = trainTypes.getTrainDesc(type,config);

  let name = config;
  let example = "";
  let desc = "";
  let subtype = "train";
  let expAdd = 0;
  if (descData) {
    const expRnd = Math.floor(exp);
    console.log(exp)

    if (descData.name) name = descData.name;
    if (descData.example) example = descData.example;
    desc = (typeof descData.desc == "object") ?  getObjectFromPattern(descData.desc, expRnd) : descData.desc ?? ""; // handles exasperation (exp) levels
    expAdd += descData.exp ?? 0;
    if (descData["sub-type"]) subtype = descData["sub-type"];
  }
  addExp(expAdd, name);

  rebuildWheels(scene, wheelTokens, subtype == "trains");
  
  const isTrain = wheelTokens.length > 2; // if less than 2, then not a train--just a cart
  buildPlow(scene,    isTrain);
  buildBoiler(scene,  isTrain);
  buildFirebox(scene, isTrain);

  typer.clean("name")

  const names = name.split("/");
  for (let i in names) {
    const typeable = new typer.Typeable($("#name-box"), "name");
    typeable.type(names[i], Math.random()*200 + i*400);
  }

  typer.clean("example");
  const examples = example.split("/");
  for (const i in examples) {
    const typeable = new typer.Typeable($("#example-box"), "example");
    typeable.type(examples[i], Math.random()*200 + i*400, true);
  }

  typer.clean("desc");
  new typer.Typeable($("#desc-box"), "desc", desc);
});

fetch("./data/type.json").then(data => data.json()).then(types => {
  trainTypes.initTypes(types);
});

fetch("./data/desc.json").then(data => data.json()).then(types => {
  trainTypes.initDescs(types);
});

const EXP_MEMORY_LENGTH = 10;
const EXP_TIMEOUT = 2000;

// only add to exp after some time
var expTimer = null;
var expMemory = [];
var expMemoryPointer = 0;
function addExp(amount, name) {
  if (expTimer !== null) {
    clearTimeout(expTimer);
    expTimer = null;
  }

  if (expMemory.includes(name)) return; // already saw this one
  expMemory[expMemoryPointer] = name;
  expMemoryPointer = (expMemoryPointer+1) % EXP_MEMORY_LENGTH;

  expTimer = setTimeout(() => {
    exp = Math.min(Math.max(exp + amount, minExp), maxExp);
    expTimer = null;
  }, EXP_TIMEOUT);
}
