import * as decorateFile from "./decorator.js"

const path = process.argv[2];

decorateFile.decorateSingleFile(path);

console.log("file decorated");