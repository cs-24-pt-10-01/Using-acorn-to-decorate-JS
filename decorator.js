import * as fs from 'fs';
import * as acorn from 'acorn'
import { toJs } from 'estree-util-to-js'
import { decorateBrackets } from './decorators/brackets.js';
import { findFunctionCallsInAST, wrapFunctions, getFunctionName } from './decorators/functionCallWrapper.js';
import os from 'os';
import cp from 'child_process';
import { get } from 'http';
// reads a single file and returns a decorated version as a string
function decorateString(code, filename, onlyBody = false) {
    const acornOptions = { ecmaVersion: "latest", locations: true };

    const ast = acorn.parse(code, acornOptions);

    // rapl start and stop nodes (start and stop are functions)
    const startNodeGenerator = (node) => acorn.parse(nodeGenerator(true, node, filename), acornOptions).body[0];
    const stopNodeGenerator = (node) => acorn.parse(nodeGenerator(false, node, filename), acornOptions).body[0];
    const importNode = acorn.parse("const rapl = require('./rapl.js')", acornOptions).body[0];

    // wrap function calls in start and stop nodes
    wrapFunctions(ast, startNodeGenerator, stopNodeGenerator, importNode, onlyBody);

    return toJs(ast).value;
}

function nodeGenerator(start, node, filename) {
    const operation = start ? "start" : "stop";
    const line = node.loc.start.line;
    const functionName = getFunctionName(node);

    return `rapl.${operation}("${line}:${filename}:${functionName}")`;
}

function decorateSingleFile(path, appendString = "_decorated.js", onlyBody = false) {
    const code = fs.readFileSync(path);
    const filename = path.split("/").slice(-1);
    const decoratedCode = decorateString(code, filename, onlyBody);
    fs.writeFile(path + appendString, decoratedCode, (err) => {
        if (err) throw err;
    });
}

function decorateFolder(path, jsLibPath, raplLibpath, onlyBody = false) {
    const files = fs.readdirSync(path);
    let jsFound = false;
    files.forEach(file => {
        if (file.endsWith(".js")) {
            try {
                decorateSingleFile(path + "/" + file, "", onlyBody);// overwrite file
                jsFound = true;
            }
            catch (err) {
                console.log("Error could not decorate file:" + file);
                console.log(err);
            }
        }
        // Recursive call for folders
        if (fs.statSync(path + "/" + file).isDirectory()) {
            decorateFolder(path + "/" + file);
        }
    })

    if (jsFound) {
        // Copy rapl.js to the path, such that decorated files can use it.
        fs.copyFileSync(jsLibPath, path + "/rapl.js", 0, (err) => { throw err; });
        const libEnd = os.platform() == "win32" ? "dll" : "so";
        fs.copyFileSync(raplLibpath, path + "/rapl_lib." + libEnd, 0, (err) => { throw err; });

        // install koffi (used by rapl.js)
        cp.execSync("npm install koffi");
    }
}

function findFunctionCalls(path) {
    const code = fs.readFileSync(path);
    const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true });
    return findFunctionCallsInAST(ast);
}

export { decorateString, decorateSingleFile, decorateFolder, findFunctionCalls };