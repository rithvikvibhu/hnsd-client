
/**
 * Write value at a nested path in object
 * source: https://gist.github.com/fawwaz/b037a105e41fa8ed7292b324abb07f42
 * @param {object} obj object to write into
 * @param {string[]} keys array of nested keys in path
 * @param {any} v value
 * @returns
 */
const writeToObj = (obj, keys, v) => {
  if (keys.length === 0) {
    return v;
  }
  if (keys.length === 1) {
    obj[keys[0]] = v;
  } else {
    const [key, ...remainingKeys] = keys;
    const nextKey = remainingKeys[0];
    const nextRemainingKeys = remainingKeys.slice(1);

    if (typeof nextKey === "number") {
      // create array
      if (!obj[key]) {
        obj[key] = [];
      }

      // Fill empty index with empty object
      if (obj[key].length < nextKey + 1) {
        delta = nextKey + 1 - obj[key].length;
        for (let i = 0; i < delta; i++) {
          obj[key].push({});
        }
      }

      // recursively write the object
      obj[key][nextKey] = writeToObj(obj[key][nextKey], nextRemainingKeys, v);
    } else {
      // recursively write the object
      obj[key] = writeToObj(
        typeof obj[key] === "undefined" ? {} : obj[key],
        remainingKeys,
        v
      );
    }
  }

  return obj;
};


/**
 * Regexes for dns names
 * Used in castValueByName
 */
const NAMES_BY_TYPE = {
  boolean: [
    /^synced\.chain\.hnsd\.?$/i,
  ],
  number: [
    /^(height|time)\.tip\.chain\.hnsd\.?$/i,
    /^progress\.chain\.hnsd\.?$/i,
    /^size\.pool\.hnsd\.?$/i,
  ],
  // string: [
  //   /^hash\.tip\.chain\.hnsd\.?$/i,
  //   /^(host|agent)\.[0-65535]\.peers\.pool\.hnsd\.?$/i,
  // ],
}


/**
 * Cast value to type based on dns name
 * Also enforces if type if known
 * @param {string} value
 * @param {string} name
 */
function castValueByName(value, name) {
  // Boolean
  for (const regexp of NAMES_BY_TYPE.boolean) {
    if (regexp.test(name)) {
      switch (value) {
        case 'true':
          return true;
        case 'false':
          return false;
        default:
          throw new Error(`${name} is of incorrect type (expected=boolean)`);
      }
    }
  }

  // Number
  for (const regexp of NAMES_BY_TYPE.number) {
    if (regexp.test(name)) {
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new Error(`${name} is of incorrect type (expected=number)`);
      }
      return num;
    }
  }

  // Strings
  // Don't do anything

  // Everything else, return as-is
  return value;
}


module.exports = {
  writeToObj,
  castValueByName,
}