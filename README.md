# Using-acorn-to-decorate-JS

This is an example of how to use acorn for adding start and stop nodes to JavaScript code, the start and stop nodes is intended to be calls for our RAPL library.

Only commonJS is supported.

Missing features:
- Handling return statements and throws

## Structure
```mermaid
graph LR;
    JS[JS code]-- acorn -->AST;
    AST-- Decorators -->D[decorated AST];
    D-- ToJs -->e[decorated JS code];
```

## How to use
- ```npm install package.json```
- ```node decorateFile.js <your js file here>``` or ```node decorateFolder.js <your folder here> ```

