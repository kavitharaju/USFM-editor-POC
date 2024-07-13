const fs = require('fs');
const Parser = require('tree-sitter');
const USFM3 = require('tree-sitter-usfm3');
const { Query, QueryCursor } = Parser;

// Initialize the parser with the JavaScript language
const parser = new Parser();
parser.setLanguage(USFM3);

// Load the highlight.scm queries
const highlightQuery = `
  (bookcode) @enum
  (chapterNumber) @number
  (verseNumber) @number
  (text) @string
  (ERROR) @error
  [
    (customAttribute)
    (defaultAttribute)
    (lemmaAttribute)
    (strongAttribute)
    (scrlocAttribute)
    (glossAttribute)
    (linkAttribute)
    (altAttribute)
    (srcAttribute)
    (sizeAttribute)
    (locAttribute)
    (copyAttribute)
    (refAttribute)
    (msAttribute)
  ] @attribute
  (footnote) @note
  (crossref) @note
  (paragraph) @foldable
  (chapter) @foldable
  (footnote) @foldable
  (crossref) @foldable
  (ERROR) @foldable
`;

// const cursor = new QueryCursor();
const highQuery = new Query(USFM3, highlightQuery);

function parseUSFM(sourceCode) {
  const tree = parser.parse(sourceCode);
  let highlightedHTML = generateHTML(tree, highQuery, sourceCode);
  return highlightedHTML
}

// Function to generate HTML with syntax highlighting
function generateHTML(tree, query, code) {
  let highlights = [];
  let foldables = [];
  
  query.captures(tree.rootNode).forEach(match => {
    if (match.name === 'foldable') {
      foldables.push({
        start: match.node.startIndex,
        end: match.node.endIndex
      });
    } else {
      highlights.push({
        type: match.name,
        start: match.node.startIndex,
        end: match.node.endIndex
      });
    }
  });

  let html = '';
  let lastIndex = 0;
  let foldableStack = [];

  highlights.sort((a, b) => a.start - b.start).forEach(({ type, start, end }) => {
    while (foldables.length && foldables[0].start <= start) {
      const { start: foldStart, end: foldEnd } = foldables.shift();
      if (foldStart > lastIndex) {
        html += code.slice(lastIndex, foldStart);
        html += `<div class="foldable"><div class="fold-header" onclick="toggleFold(this.parentElement)">...</div><div class="fold-content">`;
        foldableStack.push(foldEnd);
        lastIndex = foldStart;
      }
    }

    let before = code.slice(lastIndex, start);
    before.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
  
    let highlighted = code.slice(start, end);
    highlighted.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
  
    html += before + `<span class="${type}">${highlighted}</span>`;
    lastIndex = end;

    while (foldableStack.length && foldableStack[foldableStack.length - 1] <= lastIndex) {
      html += `</div></div>`;
      foldableStack.pop();
    }
  });

  html += code.slice(lastIndex);

  // Close any remaining foldables
  while (foldableStack.length) {
    html += `</div></div>`;
    foldableStack.pop();
  }
  return html;
}


module.exports = { parseUSFM };