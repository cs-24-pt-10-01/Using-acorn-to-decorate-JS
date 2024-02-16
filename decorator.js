import * as fs from 'fs';
import * as acorn from 'acorn'
import { toJs } from 'estree-util-to-js'
import { decorateBrackets } from './decorators/brackets.js';
import { findFunctionCallsInAST, wrapFunctions } from './decorators/functionCallWrapper.js';

// reads a single file and returns a decorated version as a string
function decorateString(code){
    const acornOptions = {ecmaVersion: "latest"};

    const ast = acorn.parse(code, acornOptions);

    // rapl start and stop nodes
    const startNode = acorn.parse("rapl.start()", acornOptions).body[0];
    const stopNode = acorn.parse("rapl.stop()", acornOptions).body[0];

    // wrap function calls in start and stop nodes
    wrapFunctions(ast, startNode, stopNode);

    return toJs(ast).value;
}

function decorateSingleFile(path){
    const code = fs.readFileSync(path);
    const decoratedCode = decorateString(code);
    fs.writeFile(path + "_decorated.js", decoratedCode, (err) => {
        if (err) throw err;
    });
}

function decorateFolder(path){
    const files = fs.readdirSync(path);
    files.forEach(file => {
        if (file.endsWith(".js")){
            decorateSingleFile(path + "/" + file);
        }
    })
}

function findFunctionCalls(path){
    const code = fs.readFileSync(path);
    const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true});
    return findFunctionCallsInAST(ast);
}

export { decorateString, decorateSingleFile, decorateFolder, findFunctionCalls };