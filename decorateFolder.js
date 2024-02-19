import * as decorator from "./decorator.js"

const path = process.argv[2];
const jsLibPath = process.argv[3];
const raplLibPath = process.argv[4];

decorator.decorateFolder(path, jsLibPath, raplLibPath);

console.log("folder decorated");