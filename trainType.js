import { getObjectFromPattern, getValueTokens } from "./patterns.js";

var types = {};
var descs = {};
export function initTypes(l_types) {
  types = l_types;
}

export function initDescs(l_descs) {
  descs = {};
  for (const type in l_descs) {
    const descObjs = l_descs[type];
    descs[type] = [];
    for (const config in descObjs) {
      descs[type].push(new TrainDesc(config, descObjs[config]));
    }
  }
}


export function getTrainType(wheelSets) {
  let obj = getObjectFromPattern(types, wheelSets);
  return obj;
}

// config in the form of <front>-<drive>-<drive>-...-<drive>-<back>
export function getTrainDesc(type, config) {
  const descObj = [];
  if (descs.hasOwnProperty(type)) descObj.push(...descs[type]);
  if (descs.hasOwnProperty("*")) descObj.push(...descs["*"]); // add in wildcard!

  let lastObj = null;
  for (const obj of descObj) {
    if (obj.matches(config)) {
      const priority = obj.desc?.priority ?? 100;
      if (lastObj == null || priority > lastObj) lastObj = obj;
    }
  }
  return lastObj?.desc ?? null;
}

const configPattern = /(?:(?:(\d+|(?:\[[^\]]+\]))(?:<([^>]*)>)?)-?)/g;
class TrainDesc {
  constructor(config, desc) {
    this.configPattern = [];
    this.desc = desc;
    
    for (const configPart of config.matchAll(configPattern)) {
      const token = getValueTokens(configPart[1]);
      if (configPart[2] !== undefined) {
        token.count = getValueTokens(configPart[2]);
      }
      else token.count = 1;
      this.configPattern.push(token);
    }
  }

  matches(config) {
    const configParts = config.split("-").map(val => +val);
    
    let i = 0;
    for (const pattern of this.configPattern) {
      const count = pattern.matches(configParts.slice(i));
      if (count == -1) return false;
      i += count;
    }
    console.log(i, configParts.length)
    return i == configParts.length;
  }
}

/*

"0<[2-4]>": {
      "name": "A Steam Maglev???",
      "desc": {
        "0": "How is this even hovering? There aren't any wheels!",
        "2": "This is the worst locomotive I've ever seen! I bet it won't even move...",
        "3": "What is wrong with you.",
        "4:": "No. Just No."
      },
      "sub-type": "maglev",
      "exp": 1
    }
  }

  "0-[4-10@2n]-0": {
      "name": "test",
      "priority": 100
    }    
*/