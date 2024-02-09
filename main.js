import { readFileSync } from 'fs';
import * as acorn from 'acorn'
import { toJs } from 'estree-util-to-js'
import { decorateBrackets } from './decorators/brackets.js';
import { wrapFunctions } from './decorators/functionCallWrapper.js';

// getting path(and file) from command line
const path = process.argv[2];
const code = readFileSync(path);

const ast = acorn.parse(code, { ecmaVersion: 2022 });

// rapl start and stop nodes
const startNode = acorn.parse("rapl.start()").body[0];
const stopNode = acorn.parse("rapl.stop()").body[0];

// wrap function calls in start and stop nodes
wrapFunctions(ast, startNode, stopNode);
//decorateBrackets(ast, startNode, stopNode);

// converting the ast to js
const decoratedCode = toJs(ast).value;

console.log("------ before ------");
console.log(code.toString());
console.log()

console.log("------ after ------");
console.log(decoratedCode);

