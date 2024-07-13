# USFM-editor-POC
A attempt to at least disprove the idea of having a web based editor with syntax highlighting and code folding running directly on top of tree-sitter AST

## Features

- Works directly on the **Syntax tree**, without converting to any other intermediate formats like json.
- Queries the parsed tree for specific node types and apply css classes and divs on them.


![Demo](./usfm-editor-poc.gif)

## Set up and Run express server
Setup code base
```
git clone https://github.com/kavitharaju/USFM-editor-POC.git
cd USFM-editor-POC
npm install .
```
Run the server

```
node server.js
```
and access UI at localhost:3000

