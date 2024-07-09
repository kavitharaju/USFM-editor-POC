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
  query.captures(tree.rootNode).forEach(match => {
    highlights.push({
        type: match.name,
        start: match.node.startIndex,
        end: match.node.endIndex
      });
  });

  let html = '';
  let lastIndex = 0;

  highlights.sort((a, b) => a.start - b.start).forEach(({ type, start, end }) => {
    const before = code.slice(lastIndex, start);
    const highlighted = code.slice(start, end);
    html += before + `<span class="${type}">${highlighted}</span>`;
    lastIndex = end;
  });

  html += code.slice(lastIndex);
  return html;
}

// // Generate the HTML
// const highlightedHTML = generateHTML(tree, query);
// let fullHTML = `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Syntax Highlighting</title>
//     <link rel="stylesheet" href="style.css">
//   </head>
//   <body>
//     <code>${highlightedHTML}</code>
//   </body>
//   </html>
// `;
// // Save or output the HTML
// fs.writeFileSync('highlighted.html', fullHTML);
// console.log('Syntax highlighted HTML generated.');

module.exports = { parseUSFM };