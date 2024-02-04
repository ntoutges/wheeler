export class HInput {
  constructor() {
    this.onInputCallbacks = [];

    this.el = document.createElement("div");
    this.el.classList.add("hinput-container");
    
    this.input = document.createElement("input");
    this.input.classList.add("hinput-input");
    this.input.placeholder = " "; // required--do not make empty!
    
    this.highlight = document.createElement("div");
    this.highlight.classList.add("hinput-highlight");

    this.widthGetter = document.createElement("div");
    this.widthGetter.classList.add("hinput-width-getter");

    this.el.append(this.input, this.highlight, this.widthGetter);

    this.input.addEventListener("input", () => {
      this.resizeInput();
      this.onInputCallbacks.forEach(callback => { callback() });
    });
    this.resizeInput();
  }

  appendTo(other) {
    other.append(this.el);
  }

  resizeInput() {
    this.widthGetter.innerText = this.input.value;
    const width = this.widthGetter.offsetWidth;
    this.el.style.width = `${width}px`;
  }

  onInput(callback) {
    this.onInputCallbacks.push(callback);
  }

  get value() { return this.input.value; }

  // tokens: HToken[]
  setTokens(tokens) {
    this.highlight.innerHTML = ""; // reset
    
    let offset = 0;
    const text = this.input.value;
    for (const token of tokens) {
      if (offset >= text.length) break;

      const substr = text.substring(offset);
      this.highlight.append(token.build(substr));
      offset += token.size(substr);
    }
  }
}

export class HToken {
  constructor(
    length, // if end = -1, goes to end of all text
    color="transparent",
    opacity=0.2
  ) {
    this.length = length;
    this.color = color;
    this.opacity = opacity;
  }

  size(text) {
    return this.length == -1 ? text.length : this.length;
  }

  build(text) {
    const substr = this.length == -1 ? text : text.substring(0, this.length);

    const el = document.createElement("div");
    el.classList.add("hinput-tokens");
    el.style.background = this.color;
    el.style.opacity = this.opacity;
    el.innerText = substr;
    return el;
  }
}