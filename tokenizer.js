#!/usr/bin/env node

// process.argv.forEach((index,val) => {
//   console.log(index,val);
// })
// const optionDefinitions = [
//   { name: 'verbose', alias: 'v', type: Boolean },
//   { name: 'src', type: String, multiple: true, defaultOption: true },
//   { name: 'timeout', alias: 't', type: Number }
// ]
// const commandLineArgs = require('command-line-args')
// const options = commandLineArgs(optionDefinitions)

// console.log(options);
const {argv} = require('yargs');
const path = require('path'),
      fs = require("fs")

const fsp = require('fs').promises

//const stringify = require("json-stringify-pretty-compact");
const stringify = require("stringify-object");

let poemFile = argv._[0],
    baseName = poemFile ? path.parse(poemFile).name : null,
    outFile = baseName ? baseName + ".js" : null
    
// const  poemFile = argv.i ? argv.i :  './al-kolera.txt',
//       outFile = argv.o ? argv.o : './al-kolera.js'

//console.log(linesText);


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
  const raw = l.split(/(\s+)|(\,|\.|\;|\!)/)
  // console.log(raw);
  for (let e of raw) {
    if (typeof(e) !== 'undefined') {
      let newel = {type: "word", content: e, class: "", meta: ""}
      if (e.match(/^\s/)) {
        if (e.length > 1) {a.push({...newel, type: "indent"})}
        //a.push({type: "space", content: e})
      } else if (e.match(/^(\,|\;|\.|\!)/)) {
        //console.log(e, "e is pucntuation!");
        a.push({...newel, type: "punctuation"})
      } else if (e.length > 0){
        a.push(newel)
      }
    }
  }
  return {type: tag, class:"", original: l, content: a }
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
  return {type: "stanza", class:"", content: lines}
}

function tokenizePoem (file) {
  const poemText = fs.readFileSync(file, 'utf8');
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

async function rewriteHtmlFile (poemName) {
  let html = await fsp.readFile("poem.html", 'utf-8'),
      newHtml = html.replace(/poem.js/g, `${poemName}.js`)
  return await fsp.writeFile (`${poemName}.html`, newHtml)
}
// const poemStanzas = createStanzas(poemFile)

// const poemObj = {stanzas: poemStanzas}

// write to poem.js
let options = {indent: '  ', inlineCharacterLimit: 80},
    parsedPoem = stringify(tokenizePoem(poemFile),options).replace(/meta: ''/g, "meta: ``")
if (fs.existsSync(poemFile)) {
  fs.writeFileSync(outFile,'let poem=' +  parsedPoem);
  //rewriteHtmlFile(baseName)
} else {
  console.log(`unable to find poem file ${poemFile ? poemFile : "(you didn't provide a poem file)"}`);
}

