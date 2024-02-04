export function getObjectFromPattern(types, value) {
  if (types.hasOwnProperty(value)) return types[value];
  
  // deeper search
  for (const pattern in types) {
    const bounds = pattern.split(":");
    if (bounds.length != 2) continue; // not a pattern
    
    // pattern in the form of <min>:<max> (min/max are optional)
    if (bounds[0].length == 0) bounds[0] = 0; // start
    else bounds[0] = isNaN(+bounds[0]) ? 0 : +bounds;
    if (bounds[1].length == 0) bounds[1] = Infinity; // end
    else bounds[1] = isNaN(+bounds[1]) ? 0 : +bounds;

    if (bounds[0] <= value || value <= bounds[1]) return types[pattern];
  }
  return null;
}

const valuePattern = /(\d+)|(?:\[([^\]]+)\])/;
const wheelCountPattern = /(?:(\d+)(?:-(\d+))?(?:@(\d*)n([+-])?(\d*))?),?/g
export function getValueTokens(valueStr) {
  const valueMatch = valuePattern.exec(valueStr)
  if (valueMatch[1]) return new Token({ type: "number", value: +valueMatch[1] }); // standard number
  else if (valueMatch[2]) { // pattern
    
    let ranges = []; // {min: number, max: number, mod: number, offset: number}[]
    let values = []; // number[]
    for (const validPart of valueMatch[2].matchAll(wheelCountPattern)) {
      const val = validPart[1];
      const max = validPart[2];

      if (isNaN(val)) continue; // invalid
      if (max) {
        if (isNaN(max)) continue;

        // ranges.push( val,max ]);
        let mod = validPart[3] ? +validPart[3] : 1;
        let offset = validPart[5] ? ((validPart[4] == "+") ? +validPart[5] : -validPart[5]) : 0;
        if (isNaN(mod) || mod == 0) mod = 1;
        if (isNaN(mod)) offset = 0;

        offset = (offset % mod);
        if (offset < 0) offset += mod;

        ranges.push({ min: +val, max: +max, mod: Math.abs(mod), offset });
      }
      else values.push(+val);
    }

    return new Token({ type: "pattern", ranges, values });
  }
}

export class Token {
  constructor(data) {
    this.data = data;
    this.count = 1;
  }

  getMatchingCounts(values=[]) {
    let count = 0;
    for (const part of values) {
      if (this.data.type == "number" && this.data.value != part) return count;
      else if (this.data.type == "pattern" && !this.isValidValue(part)) return count;
      count++;
    }
    return count;
  }

  matches(values=[]) {
    const count = this.getMatchingCounts(values);
    if (typeof this.count == "number") return count >= this.count ? this.count : -1;
    return this.count.matchesLen(count);
  }

  matchesLen(count) {
    if (this.data.type == "number") return count >= this.data.value ? this.data.value : -1;
    return this.isValidValue(count) ? count : -1;
  }

  isValidValue(part) {
    if (this.data.values.includes(part)) return true; // matches!
    for (const range of this.data.ranges) {
      if (range.min <= part && part <= range.max && (part % range.mod == range.offset)) return true;
    }
    return false; // doesn't match
  }
}
