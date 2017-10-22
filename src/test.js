"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_access_1 = require("./api-access");
const path = require("path");
const util_1 = require("util");
const settingsFile = path.normalize(process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, "../settings.json"));
const pr = new api_access_1.PathResolver(require(settingsFile).tree);
function inspectresult(result, expected) {
    const { item, end, more } = result;
    const ins = util_1.inspect([typeof item, end, more]);
    return util_1.format("%s : %s should be %s", ins === expected, ins, expected);
}
// console.log(inspectresult(pr.getTreePath(["tiddlywiki"]), "[ 'object', 0, false ]"));
// console.log(inspectresult(pr.getTreePath(["projects", "nonexist"]), "[ 'object', 1, false ]"));
// console.log(inspectresult(pr.getTreePath(["projects"]), "[ 'object', 1, false ]"));
// console.log(inspectresult(pr.getTreePath(["projects", "tiddlywiki"]), "[ 'string', 2, false ]"));
// console.log(inspectresult(pr.getTreePath(["projects", "tiddlywiki", "editions"]), "[ 'string', 2, true ]")); 
