const typers = {};

export class Typeable {
  constructor(parent, type, text="") {
    this.el = document.createElement("div");
    this.el.classList.add("typeables");
    this.visible = document.createElement("span");
    this.hidden = document.createElement("span");
    this.hidden.classList.add("hiddens");

    this.el.append(this.visible, this.hidden);

    parent.append(this.el);
    this.int = null;
    this.tim = null;

    this.i = 0;
    this.text = "";

    this.maxSteps = 10;

    if (!typers.hasOwnProperty(type)) typers[type] = [];
    typers[type].push(this);

    if (text) this.type(text);
  }

  type(text, delay=0, reversed=false) {
    if (this.tim !== null) clearTimeout(this.tim);
    if (this.int !== null) clearInterval(this.int);
    this.i = 0;
    this.text = text;

    if (reversed) this.el.prepend(this.hidden);
    else this.el.prepend(this.visible)

    this.tim = setTimeout(() => {
      this.int = setInterval(() => {
        console.log()
        const endIndex = Math.max(this.i, Math.round(this.i / this.maxSteps * this.text.length));
  
        this.visible.innerText = this.text.substring(0,endIndex+1) + "|";
        this.hidden.innerText = this.text.substring(endIndex+1);
        this.i++;
  
        if (endIndex >= this.text.length-1) {
          clearInterval(this.int);
          this.int = null;
          this.visible.innerText = this.text;
          this.hidden.innerText = "|";
        }
      }, 100);
      this.tim = null;
    }, delay);
  }

  clear() {
    this.el.remove();
  }
}

export function clean(type) {
  if (!typers.hasOwnProperty(type)) return;
  for (const typer of typers[type]) {
    typer.clear();
  }
  typers[type] = [];
}