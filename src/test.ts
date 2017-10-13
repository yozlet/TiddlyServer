import { PathResolver } from "./api-access";
import * as path from "path";
import { inspect, format } from "util";

const settingsFile = path.normalize(process.argv[2]
	? path.resolve(process.argv[2])
	: path.join(__dirname, "../settings.json"));

const pr = new PathResolver(require(settingsFile).tree);

function inspectresult(result, expected) {
	const { item, end, more } = result;
	const ins = inspect([typeof item, end, more]);

	return format("%s : %s should be %s", ins === expected, ins, expected);
}

console.log(inspectresult(pr.getTreePath(["tiddlywiki"]), "[ 'object', 0, false ]"));
console.log(inspectresult(pr.getTreePath(["projects", "nonexist"]), "[ 'object', 1, false ]"));
console.log(inspectresult(pr.getTreePath(["projects"]), "[ 'object', 1, false ]"));
console.log(inspectresult(pr.getTreePath(["projects", "tiddlywiki"]), "[ 'string', 2, false ]"));
console.log(inspectresult(pr.getTreePath(["projects", "tiddlywiki", "editions"]), "[ 'string', 2, true ]"));