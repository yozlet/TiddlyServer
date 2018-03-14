"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_types_1 = require("./server-types");
const rx_1 = require("../lib/rx");
const path_1 = require("path");
let settings;
let eventer;
let serveSettingsPage;
function initSettingsRequest(e) {
    eventer = e;
    eventer.on('settings', function (set) {
        settings = set;
        //serve the settings page file
        if (serveSettingsPage)
            serveSettingsPage.complete();
        serveSettingsPage = new rx_1.Subject();
        server_types_1.serveFile(serveSettingsPage.asObservable(), "settingsPage.html", settings.__assetsDir).subscribe();
    });
}
exports.initSettingsRequest = initSettingsRequest;
const data = [
    { type: 2, name: "tree", valueType: "function", },
    { type: 0, name: "types", valueType: "function", },
    { type: 1, name: "host", valueType: "string" },
    { type: 1, name: "port", valueType: "number" },
    { type: 1, name: "username", valueType: "string" },
    { type: 1, name: "password", valueType: "string" },
    { type: 0, name: "backupDirectory", valueType: "string" },
    { type: 0, name: "etag", valueType: "enum", valueOptions: ["string", ["", "disabled", "required"]] },
    { type: 0, name: "etagWindow", valueType: "number" },
    { type: 1, name: "useTW5path", valueType: "boolean" },
    { type: 0, name: "debugLevel", valueType: "enum", valueOptions: ["number", [4, 3, 2, 1, 0, -1, -2, -3, -4]] },
    {
        type: 1,
        name: "allowNetwork",
        valueType: "hashmapenum",
        valueOptions: [
            ["boolean"],
            ["mkdir", "upload", "settings", "WARNING_all_settings_WARNING"]
        ]
    },
];
const descriptions = {
    tree: "The mount structure of the server",
    types: "Specifies which extensions get used for each icon",
    host: "The IP address to listen on for requests. 0.0.0.0 listens on all IP addresses. "
        + "127.0.0.1 only listens on localhost. <br/>"
        + "TECHNICAL: 127.0.0.1 is always bound to even when another IP is specified.",
    port: "The port number to listen on.",
    username: "The basic auth username to use. Also forwarded to data folders for signing edits.",
    password: "The basic auth password to use.",
    etag: "disabled (Don't check etags), "
        + "required (Require etags to be used), "
        + "&lt;not specified&gt; (only check etag if sent by the client)",
    etagWindow: "If the etag gets checked, allow a file to be saved if the etag is not stale by more than this many seconds.",
    backupDirectory: "The directory to save backup files in from single file wikis. Data folders are not backed up.",
    debugLevel: "Print out messages with this debug level or higher. <a href=\"https://github.com/Arlen22/TiddlyServer#debuglevel\">See the readme for more detail.</a>",
    useTW5path: "Mount data folders as the directory index (like NodeJS: /mydatafolder/) instead of as a file (like single-file wikis: /mydatafolder). It is recommended to leave this off unless you need it.",
    allowNetwork: {
        mkdir: "Allow network users to create directories and datafolders.",
        upload: "Allow network users to upload files.",
        settings: "Allow network users to change non-critical settings.",
        WARNING_all_settings_WARNING: "Allow network users to change critical settings: <br/>"
            + `<pre>${data.filter(e => e.type > 0).map(e => e.name).join(', ')}</pre>`
    },
    maxAge: "",
    tsa: "",
    _disableLocalHost: "",
    __dirname: "READONLY: Directory of currently loaded settings file",
    __assetsDir: ""
};
function generateSettingsPage(key) {
    // let out = "";
    // if (typeof key === "number") {
    // 	out = data.map(item =>
    // 		processItem(item, settings[item.name], item.type > key, descriptions[item.name])
    // 	).join('<br/>\n');
    // } else {
    // 	let item = data.find(e => e.name === key);
    // 	if (!item) throw new Error("item was falsy");
    // 	out = processItem(item, settings[item.name], false, descriptions[item.name])
    // }
    return `<!doctype html>
<html>
<head>
<style>
dl.treelist {
	margin: 0;
}
<!-- https://code.angularjs.org/1.6.9 -->
<script>
${JSON.stringify({ data, settings, descriptions }, null, 2)}
</script>
<script src="/static/angular.min.js"></script>
<script src="/static/settings-page.js"></script>
</style>
<title></title>
</head>
<body>

</body>
</html>
`;
}
exports.generateSettingsPage = generateSettingsPage;
// type settings = keyof ServerConfig;
function processItem(item, defValue, readonly, description) {
    const primitivesTypeMap = {
        "string": "text",
        "number": "number",
        "boolean": "checkbox"
    };
    const { valueType } = item;
    const valueTypeParts = valueType.split('-');
    if (item.valueType === "function") {
        // if (!item.valueOptions) return "";
        // else return `<fieldset><legend>${item.name}</legend>${
        // 	item.valueOptions[0](defValue as any, [item.name], readonly, description)
        // 	}</fieldset>`;
    }
    else if (item.valueType === "hashmapenum") {
        if (!item.valueOptions)
            return "";
        const dataTypes = item.valueOptions[0];
        const valueOptions = item.valueOptions[1];
        return `<fieldset><legend>${item.name}</legend>${valueOptions.map((e, i) => `${processItem({ name: e, type: item.type, valueType: dataTypes[0] }, defValue[e], readonly, description[e])}`).join('\n')}</fieldset>`;
    }
    else if (Object.keys(primitivesTypeMap).indexOf(item.valueType) > -1) {
        let type = primitivesTypeMap[item.valueType];
        return `<fieldset><legend>${item.name}</legend><input type="${type}" value="${defValue ? defValue.toString().replace(/"/g, "&dquot;") : ""}" name="${item.name}" ${readonly ? "disabled" : ""} /> ${description}</fieldset>`;
    }
    else if (item.valueType === "enum") {
        if (!item.valueOptions)
            return "";
        let options = item.valueOptions[1];
        let type = item.valueOptions[0];
        return `
<fieldset><legend>${item.name}</legend>
<select name="${item.name}" value="" ${readonly ? "disabled" : ""}>
${(options).map(e => `<option ${defValue === e ? "selected" : ""} value="${e}">${e}</option>`).join('\n')}
</select> ${description}
</fieldset>`;
    }
}
function treeGenerate(defValue, keys) {
    let res = "";
    let type = (val) => `onclick="this.form.elements.tree.disabled=true;" ${(typeof defValue === val ? "checked" : "")}`;
    res += `<fieldset><legend>Root Mount Type</legend><label>`
        + `<input type="radio" name="treeType" value="string" ${type("string")}/> Folder`
        + `</label><label>`
        + `<input type="radio" name="treeType" value="object" ${type("object")}/> Category`
        + `</label></fieldset>`;
    if (typeof defValue === "object") {
        // res = `<dl class="treelist">${keys.length > 1 ? `<dt>${keys[keys.length - 1]}</dt>` : ""}\n`
        // 	+ Object.keys(defValue).map(e => `<dd>${treeFunction(defValue[e], keys.concat(e))}</dd>`).join('\n')
        // 	+ `</dl>`
        res += `<p>Add or remove folders in the directory index</p>`;
        res += `<input type="hidden" name="tree" value=""`;
    }
    else {
        res += `<br/><input type="text" name="tree" value="${defValue.toString()}"/>`;
    }
    return res;
}
function treeValidate(post) {
    let checks = [post.treeType === "string" || post.treeType === "object"];
    let getChecks = () => checks.filter(e => {
        Array.isArray(e) ? !e[0] : !e;
    });
    return rx_1.Observable.of({}).mergeMap(() => {
        if (post.treeType === "string") {
            checks.push([typeof post.tree === "string", "TREETYPE_CHANGED"]);
            let treePath = path_1.resolve(settings.__dirname, post.tree);
            return server_types_1.obs_stat()(treePath);
        }
        else {
            return rx_1.Observable.of("true");
        }
    }).map((res) => {
        if (!Array.isArray(res))
            return getChecks();
        let [err, stat, tag, filePath] = res;
        checks.push([!err, "The specified path does not exist"]);
        checks.push([
            stat.isDirectory() || stat.isFile(),
            "The specified path is not a directory or file."
        ]);
        return getChecks();
    });
}
function treeSave(post, checks) {
    //OK, this whole tree thing is vulnerable to a critical attack
    //I drive myself crazy thinking of every single scenario.
    //Evil Villian: OK, let me make an Iframe that will load the 
    //              localhost page and then I will add a tree item
    //              pointing to the C:/ drive and download the 
    //              registry and passwords. 
    //https://security.stackexchange.com/a/29502/109521
    let ch = checks.filter(e => Array.isArray(e) && e[1] === "TREETYPE_CHANGED");
    let tt = typeof settings.tree === post.treeType;
    if (ch.length && checks.length === 1) {
        settings.tree = post.tree;
        eventer.emit("settings", settings);
    }
}
function typesFunction(defValue, keys) {
    // return `<dl class="treelist">${keys.length > 1 ? `<dt>${keys[keys.length - 1]}</dt>` : ""}\n`
    // 	+ Object.keys(defValue).map(e => `<dd>${e}<dl class="treelist">${defValue[e].map(f => `<dd>${f}</dd>`).join('')}</dl></dd>`).join('\n')
    // 	+ `</dl>`
    return `<dl>${Object.keys(defValue).map(e => `<dt>${e}</dt><dd><input type="text" name="types-${e}" value=${JSON.stringify(defValue[e].join(', '))} /></dd>`)}</dl>`;
}
function handleSettingsRequest(state) {
    if (state.req.method === "GET") {
        console.log(state.path);
        // let key;
        // if (state.path.length > 3) {
        // 	let l2index = data.filter(e => e.type === 2).map(e => e.name).indexOf(state.path[3]);
        // 	if (l2index > -1) key = data[l2index].name
        // 	else return state.throw(404);
        // } else {
        // 	key = (state.isLocalHost || settings.allowNetwork.WARNING_all_settings_WARNING) ? 1
        // 		: (settings.allowNetwork.settings ? 0 : -1);
        // }
        // let data;
        if (state.path[3] === "") {
            // console.log("serving");
            serveSettingsPage.next(state);
            // state.res.writeHead(200);
            // state.res.write(JSON.stringify({ data, settings, descriptions }, null, 2));
            // state.res.end();
        }
    }
}
exports.handleSettingsRequest = handleSettingsRequest;