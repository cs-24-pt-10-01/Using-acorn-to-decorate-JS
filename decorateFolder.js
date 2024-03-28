import * as decorator from "./decorator.js"
import os from 'os';

const path = process.argv[2];
const projektPath = process.argv[1].split("\\").slice(0, -1).join("\\");
const libEnd = os.platform() == "win32" ? "dll" : "so";

decorator.decorateFolder(path
    , projektPath + "/libs/rapl.js"
    , projektPath + "/libs/" + "thor_local_client." + libEnd);

console.log("folder decorated");
