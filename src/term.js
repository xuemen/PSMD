var fs = require('fs');
var yaml = require('js-yaml');
//var Hashes = require('jshashes');
const crypto = require('crypto');
//import * as globalpath from "../../ego/src/path.js";
const globalpath = require('../../ego/src/path.js');

const gitpath = "../../";
const egosrcpath = "../../ego/src/";

const rawrepopath = "../../raw/";
const draftrepopath = "../../draft/";
const datapath = "../data/";
const viewpath = "../view/";

const helpstr = `
node term all   : term metada + termset metadata → allterm metadata
node term commit:   temp metadata → formal metadata
node term commit filename: temp metadata → formal metadata
node term term id   : term metadata → term markdown + html
node term termset id    : termset metadata → termset markdown + html
node term error id    : error metadata → error markdown + html
node term knowledge    : knowledge metadata → allknowledge metadata
node term knowledge id    : knowledge metadata → knowledge markdown + html
`;

var termmap = new Object();
var termsetmap = new Object();
var errormap = new Object();
var knowledgemap = new Object();

// read the arguments
var arguments = process.argv.splice(2);
if (arguments.length > 0) {
    if ((arguments.length == 1) & (arguments[0] == "all")) {
        // node term all   : term metada + termset metadata → allterm metadata
        loadallterm();
        makeallterm();
    } else if ((arguments.length == 1) & (arguments[0] == "knowledge")) {
        // node term knowledge    : knowledge metadata → allknowledge metadata
        loadallknowledge();
        makeallknowledge();
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
        // node term termset id    : termset metadata → termset markdown + html
        //console.log("node term termset id    : termset metadata → termset markdown + html"+ arguments[1]) ;
        var termsetid = arguments[1];
        loadallterm();
        maketermsetview(termsetid);
    } else if ((arguments.length == 2) & (arguments[0] == "error")) {
        // node term error id    : error metadata → error markdown + html
        var errorid = arguments[1];
        loadallknowledge();
        makeerrorview(errorid);
    } else if ((arguments.length == 2) & (arguments[0] == "knowledge")) {
        // node term knowledge id    : knowledge metadata → knowledge markdown + html
        var knowledgeid = arguments[1];
        loadallknowledge();
        makeknowledgeview(knowledgeid);
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
                var t = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
                termmap[t.id] = t;

            }
            if (file.substr(0, 8) == "termset.") {
                var ts = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
                termsetmap[ts.id] = ts;
            }
        });
    } catch (e) {
        // failure
        console.log("yaml read error！" + e);
    }
}

function loadallknowledge() {
    try {
        fs.readdirSync(datapath).forEach(file => {
            if (file.substr(0, 6) == "error.") {
                var e = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
                errormap[e.id] = e;

            }
            if (file.substr(0, 10) == "knowledge.") {
                var k = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
                knowledgemap[k.id] = k;
            }
        });
    } catch (e) {
        // failure
        console.log("yaml read error！" + e);
    }
}

function makeallknowledge() {
    var allknowledge = new Object();
    allknowledge["error"] = errormap;
    allknowledge["knowledge"] = knowledgemap;

    fs.writeFileSync(datapath + "allknowledge.yaml", yaml.dump(allknowledge,{'lineWidth': -1}));
    console.log(datapath + 'allknowledge.yaml文件已更新。\n' + yaml.dump(allknowledge,{'lineWidth': -1}));
}

function makeallterm() {
    //console.log(yaml.dump(termmap,{'lineWidth': -1}));
    //console.log(yaml.dump(termsetmap,{'lineWidth': -1}));
    var allterm = new Object();
    allterm["term"] = termmap;
    allterm["termset"] = termsetmap;

    fs.writeFile(datapath + "allterm.yaml", yaml.dump(allterm,{'lineWidth': -1}), (err) => {
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
            console.log("commit " + file);
            var tempterm = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltempterm[tempterm.id] = tempterm;

            //var hashid = crypto.createHash("sha256").update(tempterm.name).digest("hex").slice(0, 8);
            var hashid = makemetafileid(tempterm.name);
            console.log(tempterm.name, hashid);
            termmap[tempterm.id] = hashid;
        }
        if ((file.substr(0, 8) == "termset.") & (file.length < 21)) {
            console.log("commit " + file);
            var temptermset = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltemptermset[temptermset.id] = temptermset;


            //var hashid = crypto.createHash("sha256").update(temptermset.name).digest("hex").slice(0, 8);
            var hashid = makemetafileid(temptermset.name);
            console.log(temptermset.name, hashid);
            termsetmap[temptermset.id] = hashid;
        }
        if ((file.substr(0, 6) == "error.") & (file.length < 19)) {
            console.log("commit " + file);
            var temperror = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltemperror[temperror.id] = temperror;

            var hashid = makemetafileid(temperror.name);
            console.log(temperror.name, hashid);
            errormap[temperror.id] = hashid;
        } if ((file.substr(0, 10) == "knowledge.") & (file.length < 23)) {
            console.log("commit " + file);
            var tempknowledge = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltempknowledge[tempknowledge.id] = tempknowledge;

            var hashid = makemetafileid(tempknowledge.name);
            console.log(tempknowledge.name, hashid);
            knowledgemap[tempknowledge.id] = hashid;
        }
    });

    //console.log(yaml.dump(alltempterm,{'lineWidth': -1}));
    //console.log(yaml.dump(alltemptermset,{'lineWidth': -1}));

    for (var id in alltempterm) {
        var term = alltempterm[id];
        var oldfilename = datapath + "term." + id + ".yaml";

        if (termmap[id] != null) {
            term.id = termmap[id];
        } else {
            console.log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }

        var newfilename = datapath + "term." + termmap[id] + ".yaml";

        fs.writeFileSync(newfilename, yaml.dump(term,{'lineWidth': -1},{'lineWidth': -1}));
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

        fs.writeFileSync(newfilename, yaml.dump(error,{'lineWidth': -1}));
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
        fs.writeFileSync(newfilename, yaml.dump(termset,{'lineWidth': -1}));
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

        for (var errorid in knowledge.depend) {
            var oldid = errorid;
            if (errormap[oldid] != null) {
                var newid = errormap[oldid];
                console.log("knowledge depend replace. error:" + oldid + " -> " + newid);
                var newobj = yaml.load(yaml.dump(knowledge.depend[oldid],{'lineWidth': -1}));
                knowledge.depend[newid] = newobj;
                delete knowledge.depend[oldid];
            } else {
                console.log("旧文件:" + oldfilename + "中depend字段的id: " + oldid + " 未能替换，请人工检查。");
            }
        }

        if (knowledge.type == "termtoerror") {
            //replace the objid
            var oldid = knowledge.objid;
            if (termmap[oldid] != null) {
                var newid = termmap[oldid];
                console.log("knowledge objid replace:" + oldid + " -> " + newid);
                knowledge.objid = newid;
            } else {
                console.log("旧文件:" + oldfilename + "中objid: " + oldid + " 未能替换，请人工检查。");
            }

            //replace the effect
            for (var id in knowledge.effect) {
                oldid = id;
                if (errormap[oldid] != null) {
                    var newid = errormap[oldid];
                    console.log("knowledge effect replace. id:" + oldid + " -> " + newid);
                    var newobj = yaml.load(yaml.dump(knowledge.effect[oldid],{'lineWidth': -1}));
                    knowledge.effect[newid] = newobj;
                    delete knowledge.effect[oldid];
                } else {
                    console.log("旧文件:" + oldfilename + "中effect字段的id: " + oldid + " 未能替换，请人工检查。");
                }
            }
        }

        if (knowledge.type == "termsettoerror") {
            //replace the objid
            var oldid = knowledge.objid;
            if (termsetmap[oldid] != null) {
                var newid = termsetmap[oldid];
                console.log("knowledge objid replace:" + oldid + " -> " + newid);
                knowledge.objid = newid;
            } else {
                console.log("旧文件:" + oldfilename + "中objid: " + oldid + " 未能替换，请人工检查。");
            }

            //replace the effect
            for (var id in knowledge.effect) {
                oldid = id;
                if (errormap[oldid] != null) {
                    var newid = errormap[oldid];
                    console.log("knowledge effect replace. id:" + oldid + " -> " + newid);
                    var newobj = yaml.load(yaml.dump(knowledge.effect[oldid],{'lineWidth': -1}));
                    knowledge.effect[newid] = newobj;
                    delete knowledge.effect[oldid];
                } else {
                    console.log("旧文件:" + oldfilename + "中effect字段的id: " + oldid + " 未能替换，请人工检查。");
                }
            }
        }

        //var option = new Object({forceQuotes:true}); 
        fs.writeFileSync(newfilename, yaml.dump(knowledge,{'lineWidth': -1}));
        console.log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }
}

// commit a temp metadata file
// type unknown
function committemp(filename) {

}

function committempterm(obj) {

}

function committemptermset(obj) {

}


function committemperror(obj) {

}


function maketermview(termid) {
    var term = new Object();
    term.id = termid;
    var termtext = maketermtext(term, "", null);

    //console.log("return value:"+termtext) ;
    //console.log("return obj:\n"+yaml.dump(term,{'lineWidth': -1}));

    var viewfilename = viewpath + "term." + termid + ".md";
    var viewstr = "条款 " + termid + " 正文:\n" + term.treetext;
    if (term.treereadme != null) {
        viewstr = viewstr + "\n---\n条款 " + termid + " readme:\n" + term.treereadme
    }
    fs.writeFileSync(viewfilename, viewstr);
    console.log(viewfilename + "文件更新，内容如下:\n" + viewstr);
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
    if ((termsetobj.readme != null) & (termsetobj.readme != "")) {
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
        } else if (item.type == "term") {
            //console.log("before enter maketerttext(), item:"+yaml.dump(item,{'lineWidth': -1}));
            var termtext = maketermtext(item, subprefix, item.map);
            treetext = treetext + subprefix + " " + item.treetext;
            if (item.treereadme != null) {
                treereadme = treereadme + subprefix + " readme:\n" + item.treereadme;
            }
        } else {
            console.log("maketermsettext() non't know this type:" + item.type);
        }
    }

    // replace the placeholder
    for (var interfacetype in termsetobj.interface) {
        for (var localid in termsetobj.interface[interfacetype]) {
            var placeholder = "<" + interfacetype + "." + localid + ">";
            var newplaceholder = "";

            if (map != null) {
                if (map[interfacetype] != null) {
                    if (map[interfacetype][localid] != null) {
                        // replace the placeholder use the map from upper level
                        newplaceholder = "<" + interfacetype + "." + map[interfacetype][localid] + ">";
                    } else {
                        // default: replace the placeholder use local interface
                        newplaceholder = termsetobj.interface[interfacetype][localid];
                    }
                } else {
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
                if (map[interfacetype] != null) {
                    if (map[interfacetype][localid] != null) {
                        // replace the placeholder use the map from upper level
                        newplaceholder = "<" + interfacetype + "." + map[interfacetype][localid] + ">";
                    } else {
                        // default: replace the placeholder use local interface
                        newplaceholder = termobj.interface[interfacetype][localid];
                    }
                } else {
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

function makeerrorview(errorid) {
    var error = new Object();
    error.id = errorid;
    var errortext = makeerrortext(error, "", null);

    //console.log("return value:"+errortext) ;
    //console.log("return obj:\n"+yaml.dump(error,{'lineWidth': -1}));

    var viewfilename = viewpath + "error." + errorid + ".md";
    var viewstr = "问题 " + errorid + " 正文:\n" + error.treetext;
    if (error.treereadme != null) {
        viewstr = viewstr + "\n---\n问题 " + errorid + " readme:\n" + error.treereadme
    }

    var knowledgetable = new Object();
    viewstr = viewstr + "\n---\n解决建议:\n" +makeerrornet(errorid, errorid+">",knowledgetable)+"\n---\n";
    //fs.writeFileSync(viewfilename, viewstr);
    console.log(viewfilename + "文件更新，内容如下:\n" + viewstr);
}

// generate the error-depend error + knowledge- depend error 
function makeerrornet(errorid, prefix,knowledgetable) {
    console.log(prefix+"enter makeerrornet: " + errorid + " 已查找的knowledge:\n" + yaml.dump(knowledgetable,{'lineWidth': -1}));
    //console.log("allknowledge:\n"+yaml.dump(knowledgemap,{'lineWidth': -1}));
    var returnstr = "";
    for (var id in knowledgemap) {
        console.log(prefix+"search knowledge: " + id)
        var knowledgeobj = knowledgemap[id];
        //console.log("knowledgeobj:\n"+yaml.dump(knowledgeobj,{'lineWidth': -1}));
        for(effectid in knowledgeobj.effect){
            //console.log("effectid:\n"+effectid);
            if (effectid == errorid) {
                // find a effective knowledge
                if (knowledgetable[id] == null) {
                    if (knowledgeobj.type == "termtoerror") {
                        var termviewfilename = viewpath + "term." + knowledgeobj.objid + ".md" ;
                        var appendstr = prefix+"发现knowledge " + id + " :使用term [" + knowledgeobj.objid + "](" + termviewfilename + ") 可能解决 error " + errorid + " 预估有效的比例是 " + knowledgeobj.effect[effectid].percent + "%";
                        console.log(appendstr);
                        returnstr = returnstr + appendstr +"\n" ;
                    } else if (knowledgeobj.type == "termsettoerror") {
                        var termsetviewfilename = viewpath + "term." + knowledgeobj.objid + ".md" ;
                        var appendstr = prefix+"发现knowledge " + id + " :使用termset [" + knowledgeobj.objid + "](" + termsetviewfilename + ")  可能解决 error " + errorid + " 预估有效的比例是 " + knowledgeobj.effect[effectid].percent + "%" ;
                        console.log(appendstr);
                        returnstr = returnstr + appendstr +"\n" ;
                    }
                    knowledgetable[id] = true;
                    if (knowledgeobj.depend != null) {
                        var appendstr = prefix + "使用knowledge " + id + " 需要先解决error:" ;
                        console.log(appendstr);
                        returnstr = returnstr + appendstr +"\n" ;
                        for (var errorid in knowledgeobj.depend) {
                            var errorviewfilename = viewpath + "error." + errorid + ".md" ;
                            var appendstr = prefix+"[" + errorid + "](" + errorviewfilename +")"
                            console.log(appendstr);
                            returnstr = returnstr + appendstr+"\n" ;
                            
                            returnstr = returnstr + "\n" + makeerrornet(errorid, prefix+errorid+">" ,knowledgetable);
                        }
                    }
                    if (knowledgeobj.together != null) {
                        var appendstr = prefix + "使用knowledge " + id + " 需要同时解决error:";
                        console.log(appendstr);
                        returnstr = returnstr + appendstr +"\n" ;
                        for (var errorid in knowledgeobj.together) {
                            var errorviewfilename = viewpath + "error." + errorid + ".md" ;
                            var appendstr = prefix+"[" + errorid + "](" + errorviewfilename +")"
                            console.log(appendstr);
                            returnstr = returnstr + appendstr+"\n" ;
                            returnstr = returnstr + "\n" + makeerrornet(errorid,prefix+errorid+">", knowledgetable);
                        }
                    }
                }
            }
        }
    }
    return returnstr ;
}

function makeknowledgeview() {

}

function makeerrortext(error, prefix, map) {
    var errorfilename = datapath + "error." + error.id + ".yaml";
    var errorobj = yaml.load(fs.readFileSync(errorfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });

    var treetext = errorobj.text;
    var treereadme = errorobj.readme;

    for (var interfacetype in errorobj.interface) {
        for (var localid in errorobj.interface[interfacetype]) {
            //var localid = errorobj.interface[interfacetype][i].id;
            var placeholder = "<" + interfacetype + "." + localid + ">";
            var newplaceholder = "";

            if (map != null) {
                if (map[interfacetype] != null) {
                    if (map[interfacetype][localid] != null) {
                        // replace the placeholder use the map from upper level
                        newplaceholder = "<" + interfacetype + "." + map[interfacetype][localid] + ">";
                    } else {
                        // default: replace the placeholder use local interface
                        newplaceholder = errorobj.interface[interfacetype][localid];
                    }
                } else {
                    // default: replace the placeholder use local interface
                    newplaceholder = errorobj.interface[interfacetype][localid];
                }
            } else {
                // default: replace the placeholder use local interface
                newplaceholder = errorobj.interface[interfacetype][localid];
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
    error.treetext = treetext;
    if (treereadme != null) {
        error.treereadme = treereadme;
        return prefix + treetext + "\n\n---\n\n" + treereadme + "\n---\n";
    } else {
        return prefix + treetext;
    }
}

//util
function makemetafileid(name) {
    var hashid = crypto.createHash("sha256").update(name).digest("hex").slice(0, 8);
    return hashid;
}