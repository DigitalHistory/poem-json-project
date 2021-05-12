
function addTooltip (text, target) {
  target.classList.add("tooltip-reference");
  const tip = document.createElement("tooltip");
  tip.textContent = text;
  target.appendChild(tip)
}

function parseInlineCollection (collection,target) {
  console.log(collection);
  if (Array.isArray (collection)) {
    collection.forEach (e =>parseInlineCollection(e, target))
  } else {
    const {content, meta, type } = collection
    let newInline = document.createElement(type);
    collection.class && newInline.classList.add(...collection.class.split(" "));
    if (Array.isArray(content)) {
      content.forEach (e => parseInlineCollection(e, newInline))  
    }
    else {
      newInline.textContent = content;
    }
    target.appendChild(newInline);
    meta ?  addTooltip (meta, newInline) : console.log("sorry, not meta in" + collection.content);;

  }
}


const target = document.querySelector("#poem")
//let newDiv =  document.createElement

parseInlineCollection(poem.title, document.querySelector("#title"))
parseInlineCollection(poem.author, document.querySelector("#author"))
parseInlineCollection(poem.stanzas, document.querySelector("#poem article"))
//parseInlineCollection(poem, target)

// for (const s of poem.stanzas) {
//   if (s.length > 0) {
//     const stanzaSec = document.createElement("stanza")
//     stanzaSec.classList.add("stanza")
//     for (const l of s) {
//       const newLine = document.createElement("line");
//       newLine.classList.add("line");
//       parseInlineCollection(l,newLine)
//       stanzaSec.appendChild(newLine);
//     }
//     target.appendChild(stanzaSec)
//   }
// }
