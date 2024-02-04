import { HToken } from "./hInput.js";

const typeColor = {
  "value": "green",
  "invalue": "red", // invalid value
  "separator": "black",
  "tank": "blue"
}

export class Token extends HToken {
  constructor(
    type,
    length,
    value=null
  ) {
    super(length, typeColor.hasOwnProperty(type) ? typeColor[type] : "transparent");
    this.type = type;
    this.value = value;

    this.isFirst = false;
    this.isLast = false;
  }
}

const tokenPattern = /([^-, ]+)([-, ]*)/g;
export function tokenize(text) {
  let isTank = false;
  if (text[text.length-1] == "T") { // tank
    text = text.substring(0,text.length-1);
    isTank = true;
  }

  const tokens = [];
  for (const match of text.matchAll(tokenPattern)) {
    const value = match[1];
    const separator = match[2];

    const numericVal = parseInt(value);
    if (numericVal != parseFloat(value) || isNaN(value)) tokens.push(new Token("invalue", value.length, 0));
    else tokens.push(new Token("value", value.length, numericVal));
    if (separator) tokens.push(new Token("separator", separator.length));
  }

  let lastTokens = {};
  for (const i in tokens) {
    const token = tokens[i];
    if (!lastTokens.hasOwnProperty(token.type)) token.isFirst = true;
    lastTokens[token.type] = token;
  }
  for (const type in lastTokens) { lastTokens[type].isLast = true; }

  if (isTank) {
    tokens.push(new Token("tank", 1));
  }

  return tokens;
}
