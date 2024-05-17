import * as decorator from "./decorator.js"
import os from 'os';
import cp from 'child_process';


const path = process.argv[2];
const seperator = os.platform() == "win32" ? "\\" : "/";
const projektPath = process.argv[1].split(seperator).slice(0, -1).join(seperator);
const libEnd = os.platform() == "win32" ? "dll" : "so";

const body = process.argv[3] == "true";

decorator.decorateFolder(path
    , projektPath + "/libs/rapl.js"
    , projektPath + "/libs/" + "thor_lib." + libEnd
    , body);

// install koffi (used by rapl.js)
cp.execSync("npm install --prefix " + path + " koffi");

console.log("folder decorated");