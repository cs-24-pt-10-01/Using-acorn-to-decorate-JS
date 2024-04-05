import * as decorateFile from "./decorator.js"

const path = process.argv[2];
const body = process.argv[3] == "true";

decorateFile.decorateSingleFile(path, body);

console.log("file decorated");