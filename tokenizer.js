const fsp = require('fs').promise,
      fs = require('fs')
const stringify = require("json-stringify-pretty-compact");

const  poemFile = './poem.txt'
//console.log(linesText);


/**
 * given a filename  POEM, return an array of arrays. Each child array
 * contains a fully tokenized stanza. Stanzas are delimited by blank lines. 
 * @param {string} poem
 * @returns {array} array of tokenized stanzas
 */
function createStanzas(poem) {
  const poemText = fs.readFileSync(poem, 'utf8');
  const linesText = poemText.split(/\n/)
  let stanzas = []
  let lastIndex = 0
  for (let i = 0; i < linesText.length; i++) {
    //console.log(i, linesText[i], linesText[i].length);
    //console.log(lastIndex);
    if (linesText[i].length <= 0) {
      newStanza = linesText.slice(lastIndex , i)
      stanzas.push(tokenizeStanza(newStanza))
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
 * Punctuation marks should be preserved as individual tokens, the RegEx mau not be working.
 * @param {} l
 * @returns {} 
 */
function tokenizeLine (l) {
  let a = []
  const raw = l.split(/(\s+)|(\,|\.|\;\!)/)
  // console.log(raw);
  for (let e of raw) {
    if (typeof(e) !== 'undefined') {
      let newel = {type: "word", content: e, class: "", meta: ""}
      if (e.match(/^\s/)) {
        if (e.length > 1) {a.push({type: "indent", ...newel})}
        //a.push({type: "space", content: e})
      } else if (e.match(/^(\,|\;|\.|\!)/)) {
        a.push({type: "punctuation", ...newel})
      } else if (e.length > 0){
        a.push({type: "word", ...newel})
      }
    }
  }
  return a
}


/**
 * Given an array of untokenized line arrays, return a proper stanza object
 * @param {} stanza
 * @returns {array} 
 */
function tokenizeStanza(stanza) {
  let lines = [];
  console.log(stanza);
  for (let l of stanza) {
    //console.log(a);
    lines.push(tokenizeLine(l))
  }
  return lines
}



const poemStanzas = createStanzas(poemFile)
const poemObj = {stanzas: poemStanzas}

// write to poem.js
fs.writeFileSync('poem.js','let poem=' + stringify(poemObj))
