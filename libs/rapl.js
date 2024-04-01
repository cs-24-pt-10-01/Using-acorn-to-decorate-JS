const os = require("os");
const koffi = require('koffi');

const libPath = os.platform() == "win32" ? "rapl_lib.dll" : "./rapl_lib.so";

const lib = koffi.load(libPath);

module.exports.start = lib.func('int start_rapl(const char*)');
module.exports.stop = lib.func('void stop_rapl(const char*)');
