// const fsp = require('fs').promise,
//       fs = require('fs')
// const stringify = require("json-stringify-pretty-compact");

// const  poemFile = './al-kolera.txt'
//console.log(linesText);
//import {stringify} from './stringify-pretty-compact.js'

// similarly, for whatever reason stringify-object isn't loading either?
// probably something about modules etc etc
const isObj = function (value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
const getOwnEnumPropSymbols = function (object) {
  return Object
    .getOwnPropertySymbols(object)
    .filter((keySymbol) => Object.prototype.propertyIsEnumerable.call(object, keySymbol))}
//require('get-own-enumerable-property-symbols').default;

let  seen = [];
function stringifyObject(input, options = {}, pad = '') {
  options.indent = options.indent || '\t';

  let tokens;

  if (options.inlineCharacterLimit === undefined) {
    tokens = {
      newLine: '\n',
      newLineOrSpace: '\n',
      pad,
      indent: pad + options.indent
    };
  } else {
    tokens = {
      newLine: '@@__STRINGIFY_OBJECT_NEW_LINE__@@',
      newLineOrSpace: '@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@',
      pad: '@@__STRINGIFY_OBJECT_PAD__@@',
      indent: '@@__STRINGIFY_OBJECT_INDENT__@@'
    };
  }

  const expandWhiteSpace = string => {
    if (options.inlineCharacterLimit === undefined) {
      return string;
    }

    const oneLined = string
	  .replace(new RegExp(tokens.newLine, 'g'), '')
	  .replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ')
	  .replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');

    if (oneLined.length <= options.inlineCharacterLimit) {
      return oneLined;
    }

    return string
      .replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n')
      .replace(new RegExp(tokens.pad, 'g'), pad)
      .replace(new RegExp(tokens.indent, 'g'), pad + options.indent);
  };

  if (seen.indexOf(input) !== -1) {
    return '"[Circular]"';
  }

  if (input === null ||
      input === undefined ||
      typeof input === 'number' ||
      typeof input === 'boolean' ||
      typeof input === 'function' ||
      typeof input === 'symbol'
     ) {
    return String(input);
  }

  if (input instanceof Date) {
    return `new Date('${input.toISOString()}')`;
  }

  if (Array.isArray(input)) {
    if (input.length === 0) {
      return '[]';
    }

    seen.push(input);

    const ret = '[' + tokens.newLine + input.map((el, i) => {
      const eol = input.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;

      let value = stringifyObject(el, options, pad + options.indent);
      if (options.transform) {
	value = options.transform(input, i, value);
      }

      return tokens.indent + value + eol;
    }).join('') + tokens.pad + ']';

    seen.pop();

    return expandWhiteSpace(ret);
  }

  if (isObj(input)) {
    let objKeys = Object.keys(input).concat(getOwnEnumPropSymbols(input));

    if (options.filter) {
      objKeys = objKeys.filter(el => options.filter(input, el));
    }

    if (objKeys.length === 0) {
      return '{}';
    }

    seen.push(input);

    const ret = '{' + tokens.newLine + objKeys.map((el, i) => {
      const eol = objKeys.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
      const isSymbol = typeof el === 'symbol';
      const isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el);
      const key = isSymbol || isClassic ? el : stringifyObject(el, options);

      let value = stringifyObject(input[el], options, pad + options.indent);
      if (options.transform) {
	value = options.transform(input, el, value);
      }

      return tokens.indent + String(key) + ': ' + value + eol;
    }).join('') + tokens.pad + '}';

    seen.pop();

    return expandWhiteSpace(ret);
  }

  input = String(input).replace(/[\r\n]/g, x => x === '\n' ? '\\n' : '\\r');

  if (options.singleQuotes === false) {
    input = input.replace(/"/g, '\\"');
    return `"${input}"`;
  }

  input = input.replace(/\\?'/g, '\\\'');
  return `'${input}'`;
}


// I have to just steal the code from strginfy-pretty-compact b/c there's no
// cdn and I want to run form a file so can't use modules
// Note: This regex matches even invalid JSON strings, but since we’re
// working on the output of `JSON.stringify` we know that only valid strings
// are present (unless the user supplied a weird `options.indent` but in
// that case we don’t care since the output would be invalid anyway).
var stringOrChar = /("(?:[^\\"]|\\.)*")|[:,]/g;

function stringify(passedObj, options) {
  var indent, maxLength, replacer;

  options = options || {};
  indent = JSON.stringify(
    [1],
    undefined,
    options.indent === undefined ? 2 : options.indent
  ).slice(2, -3);
  maxLength =
    indent === ""
    ? Infinity
    : options.maxLength === undefined
    ? 80
    : options.maxLength;
  replacer = options.replacer;

  return (function _stringify(obj, currentIndent, reserved) {
    // prettier-ignore
    var end, index, items, key, keyPart, keys, length, nextIndent, prettified, start, string, value;

    if (obj && typeof obj.toJSON === "function") {
      obj = obj.toJSON();
    }

    string = JSON.stringify(obj, replacer);

    if (string === undefined) {
      return string;
    }

    length = maxLength - currentIndent.length - reserved;

    if (string.length <= length) {
      prettified = string.replace(
        stringOrChar,
        function (match, stringLiteral) {
          return stringLiteral || match + " ";
        }
      );
      if (prettified.length <= length) {
        return prettified;
      }
    }

    if (replacer != null) {
      obj = JSON.parse(string);
      replacer = undefined;
    }

    if (typeof obj === "object" && obj !== null) {
      nextIndent = currentIndent + indent;
      items = [];
      index = 0;

      if (Array.isArray(obj)) {
        start = "[";
        end = "]";
        length = obj.length;
        for (; index < length; index++) {
          items.push(
            _stringify(obj[index], nextIndent, index === length - 1 ? 0 : 1) ||
              "null"
          );
        }
      } else {
        start = "{";
        end = "}";
        keys = Object.keys(obj);
        length = keys.length;
        for (; index < length; index++) {
          key = keys[index];
          keyPart = JSON.stringify(key) + ": ";
          value = _stringify(
            obj[key],
            nextIndent,
            keyPart.length + (index === length - 1 ? 0 : 1)
          );
          if (value !== undefined) {
            items.push(keyPart + value);
          }
        }
      }

      if (items.length > 0) {
        return [start, indent + items.join(",\n" + nextIndent), end].join(
          "\n" + currentIndent
        );
      }
    }

    return string;
  })(passedObj, "", 0);
};




/**
 * given a filename  POEM, return an array of arrays. Each child array
 * contains a fully tokenized stanza. Stanzas are delimited by blank lines. 
 * @param {string} poem
 * @returns {array} array of tokenized stanzas
 */
function createStanzas(linesText) {
  let stanzas = []
  let lastIndex = 0
  for (let i = 0; i < linesText.length; i++) {
    //console.log(i, linesText[i], linesText[i].length);
    //console.log(lastIndex);
    if (linesText[i].length <= 0) {
      const newStanza = linesText.slice(lastIndex , i)
      //console.log("stanza >o ?", newStanza);
      if (newStanza.length > 0)  {
        stanzas.push(tokenizeStanza(newStanza)) } else console.log("empty stanza");
      lastIndex = i + 1
    }
  }
  //console.log(`LinesText Length is ${linesText.length}`);
  //console.log(stanzas);
  return stanzas
}



/**
 * fully tokenize an array of string elements representing a line of poetry
 * Still not sure whether to preserve whitespace markers in the text.
 * Punctuation marks should be preserved as individual tokens,
 * but the RegEx may not be working.
 * @param {string} l
 * @returns {array} array of objects  
 */
function tokenizeLine (l, tag="line") {
  let a = []
  console.log(l);
  const raw = l.split(/(\s+)|(\,|\.|\;|\!)/)
  // console.log(raw);
  for (let e of raw) {
    if (typeof(e) !== 'undefined') {
      let newel = {element: "word", content: e, class: "", meta: ""}
      if (e.match(/^\s/)) {
        if (e.length > 1) {a.push({...newel, element: "indent"})}
        //a.push({element: "space", content: e})
      } else if (e.match(/^(\,|\;|\.|\!)/)) {
        //console.log(e, "e is pucntuation!");
        a.push({...newel, element: "punctuation"})
      } else if (e.length > 0){
        a.push(newel)
      }
    }
  }
  return {element: tag, class:"", original: l , meta:"", content: a }
}


/**
 * Given an array of untokenized line arrays, return a proper stanza object
 * @param {} stanza
 * @returns {array} 
 */
function tokenizeStanza(stanza) {
  let lines = [];
  //console.log(stanza);
  for (let l of stanza) {
    //console.log(a);
    lines.push(tokenizeLine(l))
  }
  return {element: "stanza", class:"", meta:"", content: lines}
}

function tokenizePoem (el) {
  //const poemText = fs.readFileSync(file, 'utf8');
  let poemText = el.value
  const linesText = poemText.split(/\n/)
  console.log(linesText);
  if ( linesText.length > 3 ) {
    let titleText = linesText.shift(),
        authorText = linesText.shift()
    console.log(titleText,authorText);
    
    let title = tokenizeLine(titleText, "h1"),
        author = tokenizeLine(authorText, "h2"),
        stanzas = createStanzas(linesText);
    return {title: title, author: author, stanzas: stanzas}
  } else {
    return null
  }
}

function displayPoemJs (el) {
  let value = tokenizePoem(el),
      code = document.querySelector("pre#jsonoutput code"),
      hiddenarea = document.querySelector("#tocopy"),
      parsed =  stringifyObject(value, {indent: '  ', inlineCharacterLimit: 80}).replace(/meta: ''/g, "meta: ``");// stringify(value, {maxLength: 80, indent: 2});
  console.log(value);
  if (value) {
    code.textContent = `let poem = ${parsed};`
    hiddenarea.textContent = `let poem = ${parsed};`
    hiddenarea.select();
    document.execCommand("copy");

  } else {
    code.textContent = `Please enter a full poem or parsing cannot succeed.` 
  }
}
// const poemStanzas = createStanzas(poemFile)

// const poemObj = {stanzas: poemStanzas}

// write to poem.js
//fs.writeFileSync('poem.js','let poem=' + stringify(tokenizePoem(poemFile)))
const userinput = document.querySelector('textarea#userinput')


