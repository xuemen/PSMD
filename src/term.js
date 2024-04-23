var fs = require('fs');
var yaml = require('js-yaml');
//var Hashes = require('jshashes');
const crypto = require('crypto');

const gitpath = "../../";
const rawrepopath = "../../raw/";
const draftrepopath = "../../draft/";
const datapath = "../data/";
const viewpath = "../view/";

const helpstr = `
node term all   : term metada + termset metadata → allterm metadata
node term commit:   temp metadata → formal metadata
node term commit filename: temp metadata → formal metadata
node term term id   : term metadata → term markdown + html
node term termset id    ： termset metadata → termset markdown + html
`;

var termmap = new Object();
var termsetmap = new Object();

// read the arguments
var arguments = process.argv.splice(2);
if (arguments.length > 0) {
    if ((arguments.length == 1) & (arguments[0] == "all")) {
        // node term all   : term metada + termset metadata → allterm metadata
        loadallterm();
        makeallterm();
    } else if ((arguments.length == 1) & (arguments[0] == "commit")) {
        // node term commit:   temp metadata → formal metadata
        commit();
    } else if ((arguments.length == 2) & (arguments[0] == "commit")) {
        var filename = arguments[1];
        commit(filename);
    } else if ((arguments.length == 2) & (arguments[0] == "term")) {
        // node term term id   : term metadata → term markdown + html
        var termid = arguments[1];
        loadallterm();
        maketermview(termid);
    } else if ((arguments.length == 2) & (arguments[0] == "termset")) {
        // node term termset id    ： termset metadata → termset markdown + html
        //console.log("node term termset id    ： termset metadata → termset markdown + html"+ arguments[1]) ;
        var termsetid = arguments[1];
        loadallterm();
        maketermsetview(termsetid);
    } else {
        console.log(helpstr);
        process.exit();
    }
} else {
    console.log(helpstr);
    process.exit();
}

function loadallterm() {
    try {
        fs.readdirSync(datapath).forEach(file => {
            if (file.substr(0, 5) == "term.") {
                var t = yaml.load(fs.readFileSync(datapath + file, 'utf8'));
                termmap[t.id] = t;

            }
            if (file.substr(0, 8) == "termset.") {
                var ts = yaml.load(fs.readFileSync(datapath + file, 'utf8'));
                termsetmap[ts.id] = ts;
            }
        });
    } catch (e) {
        // failure
        console.log("yaml read error！" + e);
    }
}

function makeallterm() {
    //console.log(yaml.dump(termmap));
    //console.log(yaml.dump(termsetmap));
    var allterm = new Object();
    allterm["term"] = termmap;
    allterm["termset"] = termsetmap;

    fs.writeFile(datapath + "allterm.yaml", yaml.dump(allterm), (err) => {
        if (err) throw err;
        console.log(datapath + 'allterm.yaml文件已更新。');
    });
}

function commit() {
    var alltempterm = new Object();
    var alltemptermset = new Object();
    var alltemperror = new Object();
    var alltempknowledge = new Object();
    var termmap = new Object();
    var termsetmap = new Object();
    var errormap = new Object();
    var knowledgemap = new Object();

    fs.readdirSync(datapath).forEach(file => {
        if ((file.substr(0, 5) == "term.") & (file.length < 18)) {
            console.log("commit "+ file);
            var tempterm = yaml.load(fs.readFileSync(datapath + file, 'utf8'));
            alltempterm[tempterm.id] = tempterm;

            //var hashid = crypto.createHash("sha256").update(tempterm.name).digest("hex").slice(0, 8);
            var hashid = makemetafileid(tempterm.name);
            console.log(tempterm.name, hashid);
            termmap[tempterm.id] = hashid;
        }
        if ((file.substr(0, 8) == "termset.") & (file.length < 21)) {
            console.log("commit "+ file);
            var temptermset = yaml.load(fs.readFileSync(datapath + file, 'utf8'));
            alltemptermset[temptermset.id] = temptermset;


            //var hashid = crypto.createHash("sha256").update(temptermset.name).digest("hex").slice(0, 8);
            var hashid = makemetafileid(temptermset.name);
            console.log(temptermset.name, hashid);
            termsetmap[temptermset.id] = hashid;
        }
        if ((file.substr(0, 6) == "error.") & (file.length < 19)) {
            console.log("commit "+ file);
            var temperror = yaml.load(fs.readFileSync(datapath + file, 'utf8'));
            alltemperror[temperror.id] = temperror;

            var hashid = makemetafileid(temperror.name);
            console.log(temperror.name, hashid);
            errormap[temperror.id] = hashid;
        }if ((file.substr(0, 10) == "knowledge.") & (file.length < 23)) {
            console.log("commit "+ file);
            var tempknowledge = yaml.load(fs.readFileSync(datapath + file, 'utf8'));
            alltempknowledge[tempknowledge.id] = tempknowledge;

            var hashid = makemetafileid(tempknowledge.name);
            console.log(tempknowledge.name, hashid);
            knowledgemap[tempknowledge.id] = hashid;
        }
    });

    //console.log(yaml.dump(alltempterm));
    //console.log(yaml.dump(alltemptermset))

    for (var id in alltempterm) {
        var term = alltempterm[id];
        var oldfilename = datapath + "term." + id + ".yaml";

        if (termmap[id] != null) {
            term.id = termmap[id];
        } else {
            console.log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }

        var newfilename = datapath + "term." + termmap[id] + ".yaml";

        fs.writeFileSync(newfilename, yaml.dump(term));
        console.log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }

    for (var id in alltemperror) {
        var error = alltemperror[id];
        var oldfilename = datapath + "error." + id + ".yaml";

        if (errormap[id] != null) {
            error.id = errormap[id];
        } else {
            console.log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }

        var newfilename = datapath + "error." + errormap[id] + ".yaml";

        fs.writeFileSync(newfilename, yaml.dump(error));
        console.log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }

    for (var id in alltemptermset) {
        var termset = alltemptermset[id];
        var oldfilename = datapath + "termset." + id + ".yaml";

        if (termsetmap[id] != null) {
            termset.id = termsetmap[id];
        } else {
            console.log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }
        var newfilename = datapath + "termset." + termsetmap[id] + ".yaml";

        for (var itemid in termset.item) {
            if (termset.item[itemid].type == "term") {

                if (termmap[termset.item[itemid].id] != null) {
                    var oldid = termset.item[itemid].id;
                    termset.item[itemid].id = termmap[termset.item[itemid].id];
                    console.log("path replace:" + termset.item[itemid].path, termset.item[itemid].path.replace("." + oldid + ".", "." + termmap[oldid] + "."));
                    termset.item[itemid].path = termset.item[itemid].path.replace("." + oldid + ".", "." + termmap[oldid] + ".");
                } else {
                    console.log("旧文件:" + oldfilename + "中item:" + itemid + "的id:" + termset.item[itemid].id + "未能替换，请人工检查。");
                }


            } else if (termset.item[itemid].type == "termset") {
                if (termsetmap[termset.item[itemid].id] != null) {
                    var oldid = termset.item[itemid].id;
                    termset.item[itemid].id = termsetmap[termset.item[itemid].id];

                    console.log("path replace:" + termset.item[itemid].path, termset.item[itemid].path.replace("." + oldid + ".", "." + termsetmap[oldid] + "."));
                    termset.item[itemid].path = termset.item[itemid].path.replace("." + oldid + ".", "." + termsetmap[oldid] + ".");
                } else {
                    console.log("旧文件:" + oldfilename + "中itemset:" + itemid + "的id:" + termset.item[itemid].id + "未能替换，请人工检查。");
                }

            } else {
                console.log("invaild type: " + termset.item[itemid].type + " in file:" + oldfilename);
            }
        }

        //var option = new Object({forceQuotes:true}); 
        fs.writeFileSync(newfilename, yaml.dump(termset));
        console.log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }

    for (var id in alltempknowledge) {
        var knowledge = alltempknowledge[id];
        var oldfilename = datapath + "knowledge." + id + ".yaml";

        if (knowledgemap[id] != null) {
            knowledge.id = knowledgemap[id];
        } else {
            console.log("旧文件:" + oldfilename + "未能替换，请人工检查。")
        }
        var newfilename = datapath + "knowledge." + knowledgemap[id] + ".yaml";

        for (var type in knowledge.env) {
            for(var i in knowledge.env[type]){
                if(type == "term"){
                    if(termmap[knowledge.env[type][i].id] != null){
                        var oldid = knowledge.env[type][i].id ;
                        console.log("knowledge env replace. type: " + type + "id: " + knowledge.env[type][i].id + " -> " + termmap[knowledge.env[type][i].id]) ;
                        knowledge.env[type][i].id = termmap[knowledge.env[type][i].id];
                    }else{
                        console.log("旧文件:" + oldfilename + "中env字段, type:" + type + "的id:" + knowledge.env[type][i].id + "未能替换，请人工检查。");
                    }
                } else if (type == "termset") {
                    if(termsetmap[knowledge.env[type][i].id] != null){
                        var oldid = knowledge.env[type][i].id ;
                        console.log("knowledge env replace. type: " + type + "id: " + knowledge.env[type][i].id + " -> " + termsetmap[knowledge.env[type][i].id]) ;
                        knowledge.env[type][i].id = termsetmap[knowledge.env[type][i].id];
                    }else{
                        console.log("旧文件:" + oldfilename + "中env字段, type:" + type + "的id:" + knowledge.env[type][i].id + "未能替换，请人工检查。");
                    }
                } else if (type == "error") {
                    if(errormap[knowledge.env[type][i].id] != null){
                        var oldid = knowledge.env[type][i].id ;
                        console.log("knowledge env replace. type: " + type + "id: " + knowledge.env[type][i].id + " -> " + errormap[knowledge.env[type][i].id]) ;
                        knowledge.env[type][i].id = errormap[knowledge.env[type][i].id];
                    }else{
                        console.log("旧文件:" + oldfilename + "中env字段, type:" + type + "的id:" + knowledge.env[type][i].id + "未能替换，请人工检查。");
                    }
                }
            }
        }

        for(var type in knowledge.depend){
            for(var i in knowledge.depend[type]){
                if(type == "term"){
                    if(termmap[knowledge.depend[type][i].id] != null){
                        var oldid = knowledge.depend[type][i].id ;
                        console.log("knowledge depend replace. type: " + type + "id: " + knowledge.depend[type][i].id + " -> " + termmap[knowledge.depend[type][i].id]) ;
                        knowledge.depend[type][i].id = termmap[knowledge.depend[type][i].id];
                    }else{
                        console.log("旧文件:" + oldfilename + "中depend字段, type:" + type + "的id:" + knowledge.depend[type][i].id + "未能替换，请人工检查。");
                    }
                } else if (type == "termset") {
                    if(termsetmap[knowledge.depend[type][i].id] != null){
                        var oldid = knowledge.depend[type][i].id ;
                        console.log("knowledge depend replace. type: " + type + "id: " + knowledge.depend[type][i].id + " -> " + termsetmap[knowledge.depend[type][i].id]) ;
                        knowledge.depend[type][i].id = termsetmap[knowledge.depend[type][i].id];
                    }else{
                        console.log("旧文件:" + oldfilename + "中depend字段, type:" + type + "的id:" + knowledge.depend[type][i].id + "未能替换，请人工检查。");
                    }
                } else if (type == "error") {
                    if(errormap[knowledge.depend[type][i].id] != null){
                        var oldid = knowledge.depend[type][i].id ;
                        console.log("knowledge depend replace. type: " + type + "id: " + knowledge.depend[type][i].id + " -> " + errormap[knowledge.depend[type][i].id]) ;
                        knowledge.depend[type][i].id = errormap[knowledge.depend[type][i].id];
                    }else{
                        console.log("旧文件:" + oldfilename + "中depend字段, type:" + type + "的id:" + knowledge.depend[type][i].id + "未能替换，请人工检查。");
                    }
                }
            }
        }

        for(var i in knowledge.term){
            if(termmap[knowledge.term[i].id] != null){
                var oldid = knowledge.term[i].id ;
                console.log("knowledge term replace. id: " + knowledge.term[i].id + " -> " + termmap[knowledge.term[i].id]) ;
                knowledge.term[i].id = termmap[knowledge.term[i].id];
            }else{
                console.log("旧文件:" + oldfilename + "中term字段, id:" + knowledge.term[i].id + "未能替换，请人工检查。");
            }
        }
        
        for(var i in knowledge.termset){
            if(termsetmap[knowledge.termset[i].id] != null){
                var oldid = knowledge.termset[i].id ;
                console.log("knowledge termset replace. id: " + knowledge.termset[i].id + " -> " + termsetmap[knowledge.termset[i].id]) ;
                knowledge.termset[i].id = termsetmap[knowledge.termset[i].id];
            }else{
                console.log("旧文件:" + oldfilename + "中termset字段, id:" + knowledge.termset[i].id + "未能替换，请人工检查。");
            }
        }
        
        for(var i in knowledge.error){
            if(errormap[knowledge.error[i].id] != null){
                var oldid = knowledge.error[i].id ;
                console.log("knowledge error replace. id: " + knowledge.error[i].id + " -> " + errormap[knowledge.error[i].id]) ;
                knowledge.error[i].id = errormap[knowledge.error[i].id];
            }else{
                console.log("旧文件:" + oldfilename + "中error字段, id:" + knowledge.error[i].id + "未能替换，请人工检查。");
            }
        }

        //var option = new Object({forceQuotes:true}); 
        fs.writeFileSync(newfilename, yaml.dump(knowledge));
        console.log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }
}

// commit a temp metadata file
// type unknown
function committemp(filename){

}

function committempterm(obj){

}

function committemptermset(obj){

}


function committemperror(obj){

}


function maketermview(termid) {

}

function maketermsetview(termsetid) {
    //console.log("enter maketermsetview:"+termsetid)
    var termsetfilename = datapath + "termset." + termsetid + ".yaml";
    //var termsetobj = yaml.load(fs.readFileSync(termsetfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA }););
    var termsetasitem = new Object();
    termsetasitem.sortid = "";
    termsetfilename.type = "termset";
    termsetasitem.id = termsetid;
    termsetasitem.path = termsetfilename;

    var termsettext = maketermsettext(termsetasitem, "", null);

    //console.log("maketermsettext()返回值内容如下:\n" + termsettext);
    //console.log("\ntreetext内容如下:\n" + termsetasitem.treetext);
    //console.log("\ntreereadme内容如下:\n" + termsetasitem.treereadme);

    var viewfilename = viewpath + "termset." + termsetid + ".md";
    fs.writeFileSync(viewfilename, termsettext);
    console.log(viewfilename + "文件更新，内容如下:\n" + termsettext);
}

function maketermsettext(termset, prefix, map) {
    var termsetfilename = datapath + "termset." + termset.id + ".yaml";
    var termsetobj = yaml.load(fs.readFileSync(termsetfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });

    var treetext = "";
    var treereadme = "";
    if ((termsetobj.readme != null)&(termsetobj.readme != "")) {
        treereadme = termsetobj.readme;
    } else {
        treereadme = "";
    }
    //console.log("termsetobj.readme: "+termsetobj.readme);
    //console.log("begin "+treereadme);

    for (var i in termsetobj.item) {
        var item = termsetobj.item[i];
        var subprefix = prefix + item.sortid + "."
        if (item.type == "termset") {
            var itemtext = maketermsettext(item, subprefix, item.map);
            treetext = treetext + subprefix + "\n" + item.treetext;
            if (item.treereadme != "") {
                treereadme = treereadme + subprefix + " readme:\n" + item.treereadme;
            }
            //treereadme = treereadme + item.treereadme;
        } else {
            //console.log("before enter maketerttext(), item:"+yaml.dump(item))
            var termtext = maketermtext(item, subprefix, item.map);
            treetext = treetext + subprefix + " " + item.treetext;
            if (item.treereadme != null) {
                treereadme = treereadme + subprefix + " readme:\n" + item.treereadme;
            }
        }
    }

    // replace the placeholder
    for (var interfacetype in termsetobj.interface) {
        for (var localid in termsetobj.interface[interfacetype]) {
            var placeholder = "<" + interfacetype + "." + localid + ">";
            var newplaceholder = "";

            if (map != null) {
                if(map[interfacetype] != null){
                    if (map[interfacetype][localid] != null) {
                        // replace the placeholder use the map from upper level
                        newplaceholder = "<" + interfacetype + "." + map[interfacetype][localid] + ">";
                    } else {
                        // default: replace the placeholder use local interface
                        newplaceholder = termsetobj.interface[interfacetype][localid];
                    }
                }else{
                    // default: replace the placeholder use local interface
                    newplaceholder = termsetobj.interface[interfacetype][localid];
                }
            } else {
                // default: replace the placeholder use local interface
                newplaceholder = termsetobj.interface[interfacetype][localid];
            }
            //console.log(placeholder + " -> " + newplaceholder);

            //termsettext = termsettext.replace(placeholder, newplaceholder);
            treetext = treetext.split(placeholder).join(newplaceholder);
            //console.log("treetext:  \n" + treetext);

            treereadme = treereadme.split(placeholder).join(newplaceholder);
            //console.log("treereadme:  \n" + treereadme);
        }
    }

    termset.treetext = treetext;
    termset.treereadme = treereadme;

    if (treereadme != "") {
        return prefix + treetext + "\n---\n\n" + treereadme + "\n---\n";
    } else {
        return prefix + treetext;
    }

}

function maketermtext(term, prefix, map) {
    //console.log("enter maketermtext:"+termid+prefix);
    var termfilename = datapath + "term." + term.id + ".yaml";
    var termobj = yaml.load(fs.readFileSync(termfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });

    var treetext = termobj.text;
    var treereadme = termobj.readme;

    for (var interfacetype in termobj.interface) {
        for (var localid in termobj.interface[interfacetype]) {
            //var localid = termobj.interface[interfacetype][i].id;
            var placeholder = "<" + interfacetype + "." + localid + ">";
            var newplaceholder = "";

            if (map != null) {
                if(map[interfacetype] != null){
                    if (map[interfacetype][localid] != null) {
                        // replace the placeholder use the map from upper level
                        newplaceholder = "<" + interfacetype + "." + map[interfacetype][localid] + ">";
                    } else {
                        // default: replace the placeholder use local interface
                        newplaceholder = termobj.interface[interfacetype][localid];
                    }
                }else{
                    // default: replace the placeholder use local interface
                    newplaceholder = termobj.interface[interfacetype][localid];
                }
            } else {
                // default: replace the placeholder use local interface
                newplaceholder = termobj.interface[interfacetype][localid];
            }
            //console.log(placeholder + " -> " + newplaceholder);

            treetext = treetext.split(placeholder).join(newplaceholder);
            //console.log("treetext:  \n" + treetext);
            if (treereadme != null) {
                treereadme = treereadme.split(placeholder).join(newplaceholder);
                //console.log("treereadme:  \n" + treereadme);
            }
        }
    }
    term.treetext = treetext;
    if (treereadme != null) {
        term.treereadme = treereadme;
        return prefix + treetext + "\n\n---\n\n" + treereadme + "\n---\n";
    } else {
        return prefix + treetext;
    }
}

//util
function makemetafileid(name){
    var hashid = crypto.createHash("sha256").update(name).digest("hex").slice(0, 8);
    return hashid;
}