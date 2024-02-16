import * as fs from 'fs';
import * as decorator from "./decorator.js"

const code = fs.readFileSync("tests/testtest.js");

const decoratedCode = decorator.decorateString(code);

console.log("------ before ------");
console.log(code.toString());
console.log()

console.log("------ after ------");
console.log(decoratedCode);
console.log()

console.log("------ function calls ------");
const functioncalls = decorator.findFunctionCalls("tests/testtest.js");
console.log(functioncalls);

console.log("------ Decorating files ------");
decorator.decorateFolder("tests");
console.log("files decorated");