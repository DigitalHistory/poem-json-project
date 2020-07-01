
function addTooltip (text, target) {
  target.classList.add("tooltip-reference");
  const tip = document.createElement("tooltip");
  tip.textContent = text;
  target.appendChild(tip)
}

function parseInlineCollection (collection,target) {
  
  for (let e of collection) {
    let newInline = document.createElement(e.type);
    e.class && newInline.classList.add(...e.class.split(" "))
    if (Array.isArray(e.content)) {
      parseInlineCollection(e.content, newInline)
    } else {
      newInline.textContent = e.content;
    }
    if (e.meta) {
      addTooltip (e.meta, newInline)
    }
    target.appendChild(newInline);
  }   
}

const target = document.querySelector("#poem")
//let newDiv =  document.createElement

parseInlineCollection(poem, target)

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
