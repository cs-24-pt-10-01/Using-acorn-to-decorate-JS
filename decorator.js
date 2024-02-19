import * as fs from 'fs';
import * as acorn from 'acorn'
import { toJs } from 'estree-util-to-js'
import { decorateBrackets } from './decorators/brackets.js';
import { findFunctionCallsInAST, wrapFunctions } from './decorators/functionCallWrapper.js';

// reads a single file and returns a decorated version as a string
function decorateString(code){
    const acornOptions = {ecmaVersion: "latest", locations: true};

    const ast = acorn.parse(code, acornOptions);
    
    // rapl start and stop nodes
    const startNodeGenerator = (node) => acorn.parse("rapl.start(" + node.loc.start.line + ")", acornOptions).body[0]; 
    const stopNodeGenerator = (node) => acorn.parse("rapl.stop(" + node.loc.start.line + ")", acornOptions).body[0];
    const importNode = acorn.parse("const rapl = require('./rapl.js')", acornOptions).body[0];
    
    // wrap function calls in start and stop nodes
    wrapFunctions(ast, startNodeGenerator, stopNodeGenerator, importNode);
    
    return toJs(ast).value;
}

function decorateSingleFile(path, appendString = "_decorated.js"){
    const code = fs.readFileSync(path);
    const decoratedCode = decorateString(code);
    fs.writeFile(path + appendString, decoratedCode, (err) => {
        if (err) throw err;
    });
}

function decorateFolder(path, jsLibPath, raplLibpath){
    const files = fs.readdirSync(path);
    let jsFound = false;
    files.forEach(file => {
        if (file.endsWith(".js")){
            try{
                decorateSingleFile(path + "/" + file, "");// overwrite file
                jsFound = true;
            }
            catch (err){
                console.log("Error could not decorate file:" + file);
                console.log(err);
            }
        }
        // Recursive call for folders
        if (fs.statSync(path + "/" + file).isDirectory()){
            decorateFolder(path + "/" + file);
        }
    })

    if (jsFound) {
        // Copy rapl.js to the path, such that decorated files can use it.
        fs.copyFileSync(jsLibPath, path + "/rapl.js",0, (err) => {throw err;}); // TODO write this directly into code
        fs.copyFileSync(raplLibpath, path + "/rapl_lib.dll",0, (err) => {throw err;});
    }
}

function findFunctionCalls(path){
    const code = fs.readFileSync(path);
    const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true});
    return findFunctionCallsInAST(ast);
}

export { decorateString, decorateSingleFile, decorateFolder, findFunctionCalls };