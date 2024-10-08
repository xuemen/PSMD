const fs = require('fs');
const yaml = require('js-yaml');
const ejs = require('ejs');
const jade = require('jade');

const gitpath = "../../";
const egosrcpath = "../../ego/src/";

const globalpath = require('../../ego/src/path.js');
const util = require(egosrcpath + 'util.js');

const rawrepopath = "../../raw/";
const draftrepopath = "../../draft/";
const datapath = "../data/";
const viewpath = "../view/";

const helpstr = `
node term all   : term metada metadata → allterm metadata
node term commit:   temp metadata → formal metadata
node term commit filename: temp metadata → formal metadata
node term term id   : term metadata → term markdown + html
node term termtoCOM id   : term metadata → COM metadata
node term COM id   : COM metadata → COM markdown + html
node term error id    : error metadata → error markdown + html
node term knowledge    : knowledge metadata → allknowledge metadata
node term knowledge id    : knowledge metadata → knowledge markdown + html
`;

function log(...s) {
    s[0] = log.caller.name + "> " + s[0];
    console.log(...s);
}

var termmap = new Object();
var errormap = new Object();
var knowledgemap = new Object();

// read the arguments
var arguments = process.argv.splice(2);
if (arguments.length > 0) {
    if ((arguments.length == 1) & (arguments[0] == "all")) {
        // node term all   : term metada metadata → allterm metadata
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
    } else if ((arguments.length == 2) & (arguments[0] == "termtoCOM")) {
        //node term termtoCOM id   : term metadata → COM metadata
        var termid = arguments[1];
        loadallterm();
        termtoCOM(termid);
    } else if ((arguments.length == 2) & (arguments[0] == "COM")) {
        // node term COM id   : COM metadata → COM markdown + html
        var COMid = arguments[1];
        loadallterm();
        makeCOMview(COMid);
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
        log(helpstr);
        process.exit();
    }
} else {
    log(helpstr);
    process.exit();
}

function loadallterm() {
    try {
        fs.readdirSync(datapath).forEach(file => {
            if (file.substr(0, 5) == "term.") {
                var t = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
                termmap[t.id] = t;
                // test after conver
                //maketermview(t.id);
            }
        });
    } catch (e) {
        // failure
        log("yaml read error！" + e);
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
        log("yaml read error！" + e);
    }
}

function makeallknowledge() {
    var allknowledge = new Object();
    allknowledge["error"] = errormap;
    allknowledge["knowledge"] = knowledgemap;

    fs.writeFileSync(datapath + "allknowledge.yaml", yaml.dump(allknowledge, { 'lineWidth': -1 }));
    log(datapath + 'allknowledge.yaml文件已更新。\n' + yaml.dump(allknowledge, { 'lineWidth': -1 }));
}

function makeallterm() {
    //log(yaml.dump(termmap,{'lineWidth': -1}));
    var allterm = new Object();
    allterm["term"] = termmap;

    fs.writeFile(datapath + "allterm.yaml", yaml.dump(allterm, { 'lineWidth': -1 }), (err) => {
        if (err) throw err;
        log(datapath + 'allterm.yaml文件已更新。');
    });
}

function commit() {
    var alltempterm = new Object();
    var alltemperror = new Object();
    var alltempknowledge = new Object();
    var termmap = new Object();
    var errormap = new Object();
    var knowledgemap = new Object();

    fs.readdirSync(datapath).forEach(file => {
        if ((file.substr(0, 5) == "term.") & (file.length < 18)) {
            log("commit " + file);
            var tempterm = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltempterm[tempterm.id] = tempterm;

            //var hashid = crypto.createHash("sha256").update(tempterm.name).digest("hex").slice(0, 8);
            var hashid = util.makemetafileid(tempterm.name);
            log(tempterm.name, hashid);
            termmap[tempterm.id] = hashid;
        }
        if ((file.substr(0, 6) == "error.") & (file.length < 19)) {
            log("commit " + file);
            var temperror = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltemperror[temperror.id] = temperror;

            var hashid = util.makemetafileid(temperror.name);
            log(temperror.name, hashid);
            errormap[temperror.id] = hashid;
        } if ((file.substr(0, 10) == "knowledge.") & (file.length < 23)) {
            log("commit " + file);
            var tempknowledge = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltempknowledge[tempknowledge.id] = tempknowledge;

            var hashid = util.makemetafileid(tempknowledge.name);
            log(tempknowledge.name, hashid);
            knowledgemap[tempknowledge.id] = hashid;
        }
    });

    //log(yaml.dump(alltempterm,{'lineWidth': -1}));

    for (var id in alltempterm) {
        var term = alltempterm[id];
        var oldfilename = datapath + "term." + id + ".yaml";

        if (termmap[id] != null) {
            var oldplaceholder = new RegExp("<term." + id + ".", "g");
            var newplaceholder = "<term." + termmap[id] + ".";

            //log("before replace the main id:\n", yaml.dump(term, { 'lineWidth': -1 }));
            term.id = termmap[id];
            term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
            //log("after replace the main id:\n", yaml.dump(term, { 'lineWidth': -1 }));
        } else {
            log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }

        // replace the placeholds in item
        for (var itemid in term.item) {
            var itemobj = term.item[itemid];
            if ((itemobj.termid != null) && (termmap[itemobj.termid] != null)) {
                var oldplaceholder = new RegExp("<term." + itemobj.termid + ".", "g");
                var newplaceholder = "<term." + termmap[itemobj.termid] + ".";

                //log("before replace the %d-th item:\n", itemid,yaml.dump(term, { 'lineWidth': -1 }));
                term.item[itemid].termid = termmap[term.item[itemid].termid];
                term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
                //log("after replace the %d-th item:\n", itemid,yaml.dump(term, { 'lineWidth': -1 }));
            }
        }
        // replace the errorid
        if (term.depend != null) {
            for (var dependid in term.depend) {
                var errorid = term.depend[dependid].errorid;
                if (errormap[errorid] != null) {
                    var oldplaceholder = new RegExp("<error." + errorid + ".", "g");
                    var newplaceholder = "<error." + errormap[errorid] + ".";
                    //log("before replace the %d-th depend:\n", dependid,yaml.dump(term, { 'lineWidth': -1 }));
                    term.depend[dependid].errorid = errormap[errorid];
                    term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
                    //log("after replace the %d-th depend:\n", dependid,yaml.dump(term, { 'lineWidth': -1 }));
                }
            }
        }
        if (term.together != null) {
            for (var togetherid in term.together) {
                var errorid = term.together[togetherid].errorid;
                if (errormap[errorid] != null) {
                    var oldplaceholder = new RegExp("<error." + errorid + ".", "g");
                    var newplaceholder = "<error." + errormap[errorid] + ".";
                    term.together[id].errorid = errormap[errorid];
                    term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
                }
            }
        }
        if (term.effect != null) {
            for (var effectid in term.effect) {
                var errorid = term.effect[effectid].errorid;
                if (errormap[errorid] != null) {
                    var oldplaceholder = new RegExp("<error." + errorid + ".", "g");
                    var newplaceholder = "<error." + errormap[errorid] + ".";
                    //log("before replace the %d-th effect:\n%s", effectid, yaml.dump(term, { 'lineWidth': -1 }));
                    term.effect[effectid].errorid = errormap[errorid];
                    term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
                    //log("after replace the %d-th effect:\n%s", effectid, yaml.dump(term, { 'lineWidth': -1 }));
                }
            }
        }

        var newfilename = datapath + "term." + termmap[id] + ".yaml";
        fs.writeFileSync(newfilename, yaml.dump(term, { 'lineWidth': -1 }));
        log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }

    for (var id in alltemperror) {
        var error = alltemperror[id];
        var oldfilename = datapath + "error." + id + ".yaml";

        if (errormap[id] != null) {

            var oldplaceholder = new RegExp("<error." + id + ".", "g");
            var newplaceholder = "<error." + errormap[id] + ".";
            //log("before replace the error:\n%s", id, yaml.dump(error, { 'lineWidth': -1 }));
            error.id = errormap[id];
            error = yaml.load(yaml.dump(error, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
            //log("after replace the error:\n%s", id, yaml.dump(error, { 'lineWidth': -1 }));
        } else {
            log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }

        var newfilename = datapath + "error." + errormap[id] + ".yaml";

        fs.writeFileSync(newfilename, yaml.dump(error, { 'lineWidth': -1 }));
        log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }

    for (var id in alltempknowledge) {
        var knowledge = alltempknowledge[id];
        var oldfilename = datapath + "knowledge." + id + ".yaml";

        if (knowledgemap[id] != null) {
            knowledge.id = knowledgemap[id];
        } else {
            log("旧文件:" + oldfilename + "未能替换，请人工检查。")
        }
        var newfilename = datapath + "knowledge." + knowledgemap[id] + ".yaml";

        for (var errorid in knowledge.depend) {
            var oldid = errorid;
            if (errormap[oldid] != null) {
                var newid = errormap[oldid];
                log("knowledge depend replace. error:" + oldid + " -> " + newid);
                var newobj = yaml.load(yaml.dump(knowledge.depend[oldid], { 'lineWidth': -1 }));
                knowledge.depend[newid] = newobj;
                delete knowledge.depend[oldid];
            } else {
                log("旧文件:" + oldfilename + "中depend字段的id: " + oldid + " 未能替换，请人工检查。");
            }
        }

        if (knowledge.type == "termtoerror") {
            //replace the objid
            var oldid = knowledge.objid;
            if (termmap[oldid] != null) {
                var newid = termmap[oldid];
                log("knowledge objid replace:" + oldid + " -> " + newid);
                knowledge.objid = newid;
            } else {
                log("旧文件:" + oldfilename + "中objid: " + oldid + " 未能替换，请人工检查。");
            }

            //replace the effect
            for (var id in knowledge.effect) {
                oldid = id;
                if (errormap[oldid] != null) {
                    var newid = errormap[oldid];
                    log("knowledge effect replace. id:" + oldid + " -> " + newid);
                    var newobj = yaml.load(yaml.dump(knowledge.effect[oldid], { 'lineWidth': -1 }));
                    knowledge.effect[newid] = newobj;
                    delete knowledge.effect[oldid];
                } else {
                    log("旧文件:" + oldfilename + "中effect字段的id: " + oldid + " 未能替换，请人工检查。");
                }
            }
        }

        //var option = new Object({forceQuotes:true}); 
        fs.writeFileSync(newfilename, yaml.dump(knowledge, { 'lineWidth': -1 }));
        log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }
}

// commit a temp metadata file
// type unknown
function committemp(filename) {

}

function committempterm(obj) {

}

function committemperror(obj) {

}

function termtoCOM(termid) {
    var COMobj = new Object();
    COMobj.upgrade = new Object();
    COMobj.upgradeby = new Object();
    COMobj.const = new Object();
    COMobj.loop = new Object();
    COMobj.term = new Object(); // termid -> termobj
    COMobj.text = new Object(); // termid.localid -> text
    COMobj.item = new Object(); // termid -> its item in father term

    maketermrelation(COMobj, termid);
}

function maketermrelation(COMobj, termid) {
    //log("maketermrelation > termid: "+ termid + "\n" + yaml.dump(COMobj));
    log("maketermrelation > termid: " + termid + "\n" + yaml.dump(COMobj.upgrade));
    var termfilename = datapath + "term." + termid + ".yaml";
    var termobj = yaml.load(fs.readFileSync(termfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
    COMobj.term[termid] = termobj;

    var localid = new Object();
    for (var id in termobj.item) {
        // replace the interface to termid or termid.localid
        var itemobj = termobj.item[id];
        var index = termid + '.' + itemobj.localid;
        if (itemobj.termid != null) {
            // a term
            //localid[index] = itemobj.termid ;
            localid[itemobj.localid] = itemobj.termid;
        } else {
            // a text
            localid[itemobj.localid] = index;
            COMobj.text[index] = itemobj.text;
        }
    }
log("maketermrelation() > localid:\n"+yaml.dump(localid));


    for (var id in termobj.item) {
        var itemobj = termobj.item[id];
        if (COMobj.upgradeby[termid] != null) {
            //log("maketermrelation() > termid "+ termid + " is upgrade by " + COMobj.upgradeby[termid]);
            itemobj.upgradeby = COMobj.upgradeby[termid];
        } else if (itemobj.upgradeby != null) {
            if (COMobj.item[termid] != null && COMobj.item[termid].map[itemobj.upgradeby] != null) {
                // father term replace its upgradeby field
                // a termid or termid.localid
                itemobj.upgradeby = COMobj.item[termid].map[itemobj.upgradeby];
            }
            // if termid
            if ((termobj.interface != null) && (termobj.interface[itemobj.upgradeby] != null) && (localid[termobj.interface[itemobj.upgradeby]] != null)) {
                itemobj.upgradeby = localid[termobj.interface[itemobj.upgradeby]];
            } else if (itemobj.upgradeby.slice(14, 22) == ".localid") {
                // if termid.localid
                itemobj.upgradeby = localid[itemobj.upgradeby.slice(23, -1)];
            }
        } else {
            // it is const term
        }

        if (itemobj.termid != null) {
            if (itemobj.upgradeby != null) {
                COMobj.upgrade[itemobj.upgradeby] = itemobj.termid;
                COMobj.upgradeby[itemobj.termid] = itemobj.upgradeby;
            }

            if (itemobj.map != null) {
                for (var placeholder in itemobj.map) {
                    if (localid[termobj.interface[itemobj.map[placeholder]]] != null) {
                        // a termid or termid.localid
                        itemobj.map[placeholder] = localid[termobj.interface[itemobj.map[placeholder]]];
                    }
                }
            }

            COMobj.item[itemobj.termid] = itemobj;
            maketermrelation(COMobj, itemobj.termid);
        } else {
            // text term
            var index = termid + "." + itemobj.localid;
            COMobj.text[index] = termobj.text;
            if (itemobj.upgradeby != null) {
                COMobj.upgrade[itemobj.upgradeby] = index;
                COMobj.upgradeby[index] = itemobj.upgradeby;
            }
        }
    }

    log("maketermrelation() >COMobj.upgrade:\n" + yaml.dump(COMobj.upgrade) + "COMobj.upgradeby:\n" + yaml.dump(COMobj.upgradeby));
}

function makeCOMview(COMid) {
    var COMmetadatafilename = datapath + "COM." + COMid + ".yaml";
    var COMobj = yaml.load(fs.readFileSync(COMmetadatafilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });

    var COMmdfilename = viewpath + "COM." + COMid + ".md";
    var COMhtmlfilename = viewpath + "COM." + COMid + ".html";
    var mdtermstr = "# 共同体模型" + COMid + " 正文 \n";
    var mdreadmestr = "";
    var mddependstr = "";
    var mdtogetherstr = "";
    var mdeffectstr = "";
    /*     var mdreadmestr = "# 共同体模型" + COMid + " readme \n";
        var mddependstr = "# 共同体模型" + COMid + " depend \n";
        var mdtogetherstr = "# 共同体模型" + COMid + " together \n";
        var mdeffectstr = "# 共同体模型" + COMid + " effect \n"; */

    var item = new Object();

    if (COMobj.termmaker != null) {
        mdtermstr = mdtermstr + "## 决策条款  \n";
        if (COMobj.termmaker.const != null) {
            mdtermstr = mdtermstr + "### 不可修订条款  \n";
            for (var i in COMobj.termmaker.const) {
                var element = COMobj.termmaker.const[i];
                if (element.termid != null) {
                    // use termid
                    var localid = "不可修订条款" + (i + 1).toString() + ".";
                    element.localid = localid;
                    var termtext = maketermtext(element, localid, element.map);
                    mdtermstr = mdtermstr + element.treetext;

                    if (element.treereadme != null) {
                        mdreadmestr = mdreadmestr + localid + " " + element.treereadme
                    }
                    if (element.treedepend != null) {
                        mddependstr = mddependstr + localid + " " + element.treedepend
                    }
                    if (element.treetogether != null) {
                        mdtogetherstr = mdtogetherstr + localid + " " + element.treetogether
                    }
                    if (element.treeeffect != null) {
                        mdeffectstr = mdeffectstr + localid + " " + element.treeeffect
                    }
                } else if (element.readme != null) {
                    // use readme
                    mdtermstr = mdtermstr + element.readme;
                } else {
                    log("makeCOMview() > the const term has not termid and readme:", i);
                }
            }
        }
        if (COMobj.termmaker.loop != null) {
            mdtermstr = mdtermstr + "### 自修订条款  \n";
            for (var i in COMobj.termmaker.loop) {
                var element = COMobj.termmaker.loop[i];
                if (element.termid != null) {
                    // use termid
                    var localid = "自修订条款" + (parseInt(i) + 1).toString() + ".";
                    element.localid = localid;
                    element.upgradeby = localid;
                    var termtext = maketermtext(element, localid, element.map);
                    mdtermstr = mdtermstr + element.treetext;

                    if (element.treereadme != null) {
                        mdreadmestr = mdreadmestr + localid + " " + element.treereadme
                    }
                    if (element.treedepend != null) {
                        mddependstr = mddependstr + localid + " " + element.treedepend
                    }
                    if (element.treetogether != null) {
                        mdtogetherstr = mdtogetherstr + localid + " " + element.treetogether
                    }
                    if (element.treeeffect != null) {
                        mdeffectstr = mdeffectstr + localid + " " + element.treeeffect
                    }
                } else if (element.readme != null) {
                    // use readme
                    mdtermstr = mdtermstr + element.readme;
                } else {
                    log("makeCOMview() > the const term has not termid and readme:", i);
                }
            }
        }
        if (COMobj.termmaker.level1 != null) {
            mdtermstr = mdtermstr + "### 二级决策条款  \n";
            for (var i in COMobj.termmaker.level1) {
                var element = COMobj.termmaker.level1[i];
                var localid = "二级决策条款" + (parseInt(i) + 1).toString() + ".";
                if (element.termid != null) {
                    // use termid
                    element.localid = localid;
                    var termtext = maketermtext(element, localid, element.map);
                    mdtermstr = mdtermstr + element.treetext;

                    if (element.treereadme != null) {
                        mdreadmestr = mdreadmestr + localid + " " + element.treereadme
                    }
                    if (element.treedepend != null) {
                        mddependstr = mddependstr + localid + " " + element.treedepend
                    }
                    if (element.treetogether != null) {
                        mdtogetherstr = mdtogetherstr + localid + " " + element.treetogether
                    }
                    if (element.treeeffect != null) {
                        mdeffectstr = mdeffectstr + localid + " " + element.treeeffect
                    }
                } else if (element.readme != null) {
                    // use readme
                    mdtermstr = mdtermstr + localid + " 本条款按照" + element.upgradeby + ".条款修订。 [本条款内容待定] " + element.readme;
                } else {
                    log("makeCOMview() > the const term has not termid and readme:", i);
                }
            }
        }
        if (COMobj.termmaker.level2 != null) {
            mdtermstr = mdtermstr + "### 三级决策条款  \n";
            for (var i in COMobj.termmaker.level2) {
                var element = COMobj.termmaker.level2[i];
                var localid = "三级决策条款" + (parseInt(i) + 1).toString() + ".";
                if (element.termid != null) {
                    // use termid
                    element.localid = localid;
                    var termtext = maketermtext(element, localid, element.map);
                    mdtermstr = mdtermstr + element.treetext;

                    if (element.treereadme != null) {
                        mdreadmestr = mdreadmestr + localid + " " + element.treereadme
                    }
                    if (element.treedepend != null) {
                        mddependstr = mddependstr + localid + " " + element.treedepend
                    }
                    if (element.treetogether != null) {
                        mdtogetherstr = mdtogetherstr + localid + " " + element.treetogether
                    }
                    if (element.treeeffect != null) {
                        mdeffectstr = mdeffectstr + localid + " " + element.treeeffect
                    }
                } else if (element.readme != null) {
                    // use readme
                    mdtermstr = mdtermstr + localid + " 本条款按照" + element.upgradeby + ".条款修订。 [本条款内容待定] " + element.readme;
                } else {
                    log("makeCOMview() > the const term has not termid and readme:", i);
                }
            }
        }
    } // end of termmaker

    if (COMobj.termid != null) {
        mdtermstr = mdtermstr + "### 基本管理制度  \n";
        var element = new Object();
        element.termid = COMobj.termid;
        element.localid = "基本管理制度.";
        element.upgradeby = COMobj.upgradeby;
        element.map = COMobj.map;
        var termtext = maketermtext(element, "基本管理制度.", COMobj.map);
        mdtermstr = mdtermstr + element.treetext;

        if (element.treereadme != null) {
            mdreadmestr = mdreadmestr + localid + " " + element.treereadme
        }
        if (element.treedepend != null) {
            mddependstr = mddependstr + localid + " " + element.treedepend
        }
        if (element.treetogether != null) {
            mdtogetherstr = mdtogetherstr + localid + " " + element.treetogether
        }
        if (element.treeeffect != null) {
            mdeffectstr = mdeffectstr + localid + " " + element.treeeffect
        }
    }

    var mdstr = mdtermstr;
    if (mdreadmestr != "") {
        mdstr = mdstr + "\n---\n# 共同体模型" + COMid + " readme \n" + mdreadmestr;
    }
    if (mddependstr != "") {
        mdstr = mdstr + "\n---\n# 共同体模型" + COMid + " depend \n" + mddependstr;
    }
    if (mdtogetherstr != "") {
        mdstr = mdstr + "\n---\n# 共同体模型" + COMid + " together \n" + mdtogetherstr;
    }
    if (mdeffectstr != "") {
        mdstr = mdstr + "\n---\n# 共同体模型" + COMid + " effect \n" + mdeffectstr;
    }

    var item = new Object();
    item.treehtml = mdtermstr.replace(/\n/g, '<br/>\n');
    if (mdreadmestr != "") {
        item.readme = true;
        item.treereadmehtml = mdreadmestr.replace(/\n/g, '<br/>\n');
    } else {
        item.readme = false;
    }
    if (mddependstr != "") {
        item.depend = true;
        item.treedependhtml = mddependstr.replace(/\n/g, '<br/>\n');
    } else {
        item.depend = false;
    }
    if (mdtogetherstr != "") {
        item.together = true;
        item.treetogetherhtml = mdtogetherstr.replace(/\n/g, '<br/>\n');
    } else {
        item.together = false;
    }
    if (mdeffectstr != "") {
        item.effect = true;
        item.treeeffecthtml = mdeffectstr.replace(/\n/g, '<br/>\n');
    } else {
        item.effect = false;
    }

    var termhtml = maketermhtml(item);

    // all placeholders must been defined in local interface
    // all placeholders in global map must been defined in local interface 
    //log("makeCOMview() > before replace the plcaeholders\n"+mdstr);
    if (COMobj.interface != null) {
        for (var placeholder in COMobj.interface) {
            var value = COMobj.interface[placeholder];

            mdstr = mdstr.split(placeholder).join(value);
            termhtml = termhtml.split(placeholder).join(value);
        }
    }

    fs.writeFileSync(COMmdfilename, mdstr);
    log("makeCOMview() > " + COMmdfilename + "文件更新，内容如下:\n" + mdstr);

    fs.writeFileSync(COMhtmlfilename, termhtml);
    log("makeCOMview() > " + COMhtmlfilename + "文件更新，内容如下:\n" + termhtml);
}

function savemdfile(item){
    var mdfilename = viewpath + "term." + item.termid + ".md";
    var mdstr = "条款 " + termid + " 正文:\n" + item.treetext;
    if (item.treereadme != null) {
        mdstr = mdstr + "\n---\nreadme:\n条款 " + termid + ". " + item.treereadme
    }
    if (item.treedepend != null) {
        mdstr = mdstr + "\n---\ndepend:\n条款 " + termid + ".\n" + item.treedepend
    }
    if (item.treetogether != null) {
        mdstr = mdstr + "\n---\ntogether:\n条款 " + termid + ".\n" + item.treetogether
    }
    if (item.treeeffect != null) {
        mdstr = mdstr + "\n---\neffect:\n条款 " + termid + ".\n" + item.treeeffect
    }
    fs.writeFileSync(mdfilename, mdstr);
    log(mdfilename + "文件更新，内容如下:\n" + mdstr);
}

function savehtmlfile(item){

    item.treehtml = item.treetext.replace(/\n/g, '<br/>\n');
    if (item.treereadme != null) {
        item.readme = true;
        item.treereadmehtml = item.treereadme.replace(/\n/g, '<br/>\n');
    } else {
        item.readme = false;
    }
    if (item.treedepend != null) {
        item.depend = true;
        item.treedependhtml = item.treedepend.replace(/\n/g, '<br/>\n');
    } else {
        item.depend = false;
    }
    if (item.treetogether != null) {
        item.together = true;
        item.treetogetherhtml = item.treetogether.replace(/\n/g, '<br/>\n');
    } else {
        item.together = false;
    }
    if (item.treeeffect != null) {
        item.effect = true;
        item.treeeffecthtml = item.treetogether.replace(/\n/g, '<br/>\n');
    } else {
        item.effect = false;
    }

    var termhtml = maketermhtml(item);
    var htmlfilename = viewpath + "term." + item.termid + ".html";

    fs.writeFileSync(htmlfilename, termhtml);
    log(htmlfilename + "文件更新，内容如下:\n" + termhtml);
}

function maketermview(termid) {
    var item = new Object();
    item.termid = termid;
    
    var termtext = maketermtext(item, "", null);

    //log("return value:"+termtext) ;
    //log("return obj:\n"+yaml.dump(term,{'lineWidth': -1}));
    //savemdfile(item);
    //savehtmlfile(item);
    //log("item:",item);
}

function maketermhtml(item) {

    if (true) {
        //jade
        const tempfilename = datapath + "termtemp.jade";
        var tempstr = fs.readFileSync(tempfilename, 'utf-8');

        item.alert = false;
        item.confirm = false;
        item.prompt = false;
        //item.readme = true;

        item.alertstr = "alert(\"alert test.\")";
        item.confirmstr = "confirm(\"confirm test.\")";
        item.promptstr = "prompt(\"prompt test.\",\"default\")";
        var fn = jade.compile(tempstr);

        var htmlstr = fn(item);
        //log("html file:\n"+htmlstr);
        return htmlstr;
    } else {
        //ejs
        const tempfilename = datapath + "termtemp.ejs";
        var tempstr = fs.readFileSync(tempfilename, 'utf-8');

        item.alert = false;
        item.confirm = false;
        item.prompt = false;
        item.readme = true;

        item.alertstr = "alert(\"alert test.\")";
        item.confirmstr = "confirm(\"confirm test.\")";
        item.promptstr = "prompt(\"prompt test.\",\"default\")";
        //log("item:\n"+yaml.dump(item));
        var htmlstr = ejs.render(tempstr, item);
        //log("html file:\n"+htmlstr);
        return htmlstr;
    }
}

function maketermtext(item, prefix, map) {
    log("enter maketermtext:" + item.termid + "\tupgradeby:" + item.upgradeby + "\tprefix:" + prefix);
    var termfilename = datapath + "term." + item.termid + ".yaml";
    var termobj = yaml.load(fs.readFileSync(termfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });

    var treetext = "";
    var treereadme = "";
    var treedepend = "";
    var treetogether = "";
    var treeeffect = "";

    // this level readme,depend,together,effect first.
    if ((termobj.readme != null) & (termobj.readme != "")) {
        treereadme = treereadme + termobj.readme;
    }

    // depend, together, effect field -> text
    if (termobj.depend != null) {
        for (var i in termobj.depend) {
            var error = termobj.depend[i];
            if (termobj.depend[i].errorid != null) {
                error.id = error.errorid;
                //log("error:\n"+yaml.dump(error));
                var errortext = makeerrortext(error, "", error.map);

                treedepend = treedepend + "问题 " + error.errorid + ",影响率" + error.percent + "% 正文:  \n" + error.treetext;
                if (error.treereadme != null) {
                    treedepend = treedepend + "问题 " + error.errorid + " readme:\n" + error.treereadme;
                }
            } else if (termobj.depend[i].text != null) {
                treedepend = treedepend + "事项" + (parseInt(i) + 1).toString() + ",影响率" + error.percent + "% :\n" + error.text;
            }

        }
    }

    if (termobj.together != null) {
        for (var i in termobj.together) {
            var error = termobj.together[i];
            if (termobj.together[i].errorid != null) {
                error.id = error.errorid;
                //log("error:\n"+yaml.dump(error));
                var errortext = makeerrortext(error, "", error.map);

                treetogether = treetogether + "问题 " + error.errorid + ",影响率" + error.percent + "% 正文:  \n" + error.treetext;
                if (error.treereadme != null) {
                    treetogether = treetogether + "问题 " + error.errorid + " readme:\n" + error.treereadme;
                }
            } else if (termobj.together[i].text != null) {
                treetogether = treetogether + "事项" + (parseInt(i) + 1).toString() + ",影响率" + error.percent + "% :\n" + error.text;
            }
        }
    }

    if (termobj.effect != null) {
        for (var i in termobj.effect) {
            var error = termobj.effect[i];
            if (termobj.effect[i].errorid != null) {
                error.id = error.errorid;
                //log("error:\n"+yaml.dump(error));
                var errortext = makeerrortext(error, "", error.map);

                treeeffect = treeeffect + "问题 " + error.errorid + ",有效率" + error.percent + "% 正文:  \n" + error.treetext;
                if (error.treereadme != null) {
                    treeeffect = treeeffect + "问题 " + error.errorid + " readme:\n" + error.treereadme;
                }
            } else if (termobj.effect[i].text != null) {
                treeeffect = treeeffect + "事项" + (parseInt(i) + 1).toString() + ",有效率" + error.percent + "% :\n" + error.text;
            }
        }
    }

    var subprefix = prefix;
    for (var itemid in termobj.item) {
        var itemobj = termobj.item[itemid];

        // make prefix
        if ((itemobj.localid != null) && (itemobj.localid != "")) {
            subprefix = prefix + itemobj.localid + "."
        } else {
            subprefix = prefix;
        }
        //log("subprefix:"+subprefix);

        // make upgrade by...
        var upgradestr = "";
        if (item.upgradeby != null) {
            // use global item's metadata
            //log("item.upgradeby:%s\tsubprefix:%s", item.upgradeby, subprefix)
            if (item.upgradeby == subprefix) {
                upgradestr = "本条款按照本条款修订。"
            } else {
                upgradestr = "本条款按照" + item.upgradeby + ".条款修订。"
            }
            itemobj.upgradeby = item.upgradeby;
            //log("%s>global upgradeby:%s", item.termid, item.upgradeby);
        } else if ((itemobj.upgradeby != null) && (itemobj.upgradeby.slice(0, 6) == "<term.") && (itemobj.upgradeby.slice(6, 14) == item.termid) && (itemobj.upgradeby.slice(14, 22) == ".localid")) {
            // use localid
            var localupgradeby = prefix + itemobj.upgradeby.slice(23, -1);
            if (localupgradeby == subprefix) {
                localupgradeby = "本";
            }
            upgradestr = "本条款按照" + localupgradeby + ".条款修订。"
            itemobj.upgradeby = localupgradeby;
        } else if ((itemobj.upgradeby != null) && (itemobj.upgradeby.slice(0, 6) == "<term.") && (itemobj.upgradeby.slice(6, 14) == item.termid) && (itemobj.upgradeby.slice(14, 22) != ".localid")) {
            // use local placeholder 
            //var localupgradeby = termobj.interface[itemobj.upgradeby];
            //upgradestr = "本条款按照" + localupgradeby + ".条款修订。"
            upgradestr = "本条款按照" + itemobj.upgradeby + ".条款修订。"
            //itemobj.upgradeby = localupgradeby;
        }
        //log("%s>upgradestr:%s", item.termid, upgradestr);

        if (itemobj.text != null) {
            treetext = treetext + subprefix + " " + upgradestr + itemobj.text; // + "\n"
        }
        if (itemobj.termid != null) {
            // lower level readme,depend,together,effect 
            var itemtext = maketermtext(itemobj, subprefix, itemobj.map);
            treetext = treetext + itemobj.treetext;
            //treetext = treetext + subprefix + "\n" + itemobj.treetext;
            if ((itemobj.treereadme != null) && (itemobj.treereadme != "")) {
                treereadme = treereadme + subprefix + "\n" + itemobj.treereadme;// + "\n";
            }
            if ((itemobj.treedepend != null) && (itemobj.treedepend != "")) {
                treedepend = treedepend + subprefix + "\n" + itemobj.treedepend;// + "\n";
            }
            if ((itemobj.treetogether != null) && (itemobj.treetogether != "")) {
                treetogether = treetogether + subprefix + "\n" + itemobj.treetogether;// + "\n";
            }
            if ((itemobj.treeeffect != null) && (itemobj.treeeffect != "")) {
                treeeffect = treeeffect + subprefix + "\n" + itemobj.treeeffect;// + "\n";
            }
        }
    }

    // all placeholders must been defined in local interface
    // all placeholders in global map must been defined in local interface 
    if (termobj.interface != null) {
        for (var placeholder in termobj.interface) {
            var value = termobj.interface[placeholder];

            if ((map != null) && (map[placeholder] != null)) {
                value = map[placeholder];
            }
            treetext = treetext.split(placeholder).join(value);
            if (treereadme != null) {
                treereadme = treereadme.split(placeholder).join(value);
                //log("treereadme:  \n" + treereadme);
            }
            if (treedepend != null) {
                treedepend = treedepend.split(placeholder).join(value);
                //log("treereadme:  \n" + treereadme);
            }
        }
    }

    var returnstr = prefix + treetext;
    item.treetext = treetext;
    if (treereadme != "") {
        item.treereadme = treereadme;
        returnstr = returnstr + "\n\n---\n\n" + treereadme;
    }
    if (treedepend != "") {
        item.treedepend = treedepend;
        returnstr = returnstr + "\n\n---\n\n" + treedepend;
    }
    if (treetogether != "") {
        item.treetogether = treetogether;
        returnstr = returnstr + "\n\n---\n\n" + treetogether;
    }
    if (treeeffect != "") {
        item.treeeffect = treeeffect;
        returnstr = returnstr + "\n\n---\n\n" + treeeffect;
    }

    savemdfile(item);
    savehtmlfile(item);
    return returnstr;
}

function makeerrorview(errorid) {
    var error = new Object();
    error.id = errorid;
    var errortext = makeerrortext(error, "", null);

    //log("return value:"+errortext) ;
    //log("return obj:\n"+yaml.dump(error,{'lineWidth': -1}));

    var viewfilename = viewpath + "error." + errorid + ".md";
    var viewstr = "问题 " + errorid + " 正文:  \n" + error.treetext;
    if (error.treereadme != null) {
        viewstr = viewstr + "\n---\n问题 " + errorid + " readme:\n" + error.treereadme
    }

    var knowledgetable = new Object();
    viewstr = viewstr + "\n---\n解决建议:  \n出现偏差的部门内部互相确认:相关职务行为是有意识还是无意识的。\n  - 无意识的行为：应暂时停职，由相关成员自行纠偏，然后根据情况复职或者重新竞聘。\n  - 有意识的行为：可以基于理性人假设，从行为偏差分析规章偏差，根据情况产生工单。";
    var errornetstr = makeerrornet(errorid, "    - " + errorid + ">", knowledgetable);
    if (errornetstr == "") {
        viewstr = viewstr + "如需进一步建议请联系<huang@mars22.com>  \n---\n";
    } else {
        viewstr = viewstr + "可以参考以下内容：  \n" + errornetstr + "\n---\n";
    }
    fs.writeFileSync(viewfilename, viewstr);
    log(viewfilename + "文件更新，内容如下:\n" + viewstr);
}

// generate the error-depend error + knowledge- depend error 
function makeerrornet(errorid, prefix, knowledgetable) {
    //log(prefix+"enter makeerrornet: " + errorid + " 已查找的knowledge:\n" + yaml.dump(knowledgetable,{'lineWidth': -1}));
    //log("allknowledge:\n"+yaml.dump(knowledgemap,{'lineWidth': -1}));
    var returnstr = "";
    for (var id in knowledgemap) {
        //log(prefix+"search knowledge: " + id)
        var knowledgeobj = knowledgemap[id];
        //log("knowledgeobj:\n"+yaml.dump(knowledgeobj,{'lineWidth': -1}));
        for (effectid in knowledgeobj.effect) {
            //log("effectid:\n"+effectid);
            if (effectid == errorid) {
                // find a effective knowledge
                if (knowledgetable[id] == null) {
                    if (knowledgeobj.type == "termtoerror") {
                        var termviewfilename = viewpath + "term." + knowledgeobj.objid + ".md";
                        var appendstr = prefix + "发现knowledge " + id + " :使用term [" + knowledgeobj.objid + "](" + termviewfilename + ") 可能解决 error " + errorid + " 预估有效的比例是 " + knowledgeobj.effect[effectid].percent + "%";
                        log(appendstr);
                        returnstr = returnstr + appendstr + "\n";
                    }
                    knowledgetable[id] = true;
                    if (knowledgeobj.depend != null) {
                        var appendstr = prefix + "使用knowledge " + id + " 需要先解决error:";
                        log(appendstr);
                        returnstr = returnstr + appendstr;
                        for (var errorid in knowledgeobj.depend) {
                            var errorviewfilename = viewpath + "error." + errorid + ".md";
                            var appendstr = prefix + "[" + errorid + "](" + errorviewfilename + ")"
                            log(appendstr);
                            returnstr = returnstr + "[" + errorid + "](" + errorviewfilename + ") ";

                            returnstr = returnstr + "\n" + makeerrornet(errorid, prefix + errorid + ">", knowledgetable);
                        }
                    }
                    if (knowledgeobj.together != null) {
                        var appendstr = prefix + "使用knowledge " + id + " 需要同时解决error:";
                        log(appendstr);
                        returnstr = returnstr + appendstr + "\n";
                        for (var errorid in knowledgeobj.together) {
                            var errorviewfilename = viewpath + "error." + errorid + ".md";
                            var appendstr = prefix + "[" + errorid + "](" + errorviewfilename + ")"
                            log(appendstr);
                            returnstr = returnstr + "[" + errorid + "](" + errorviewfilename + ") ";
                            returnstr = returnstr + "\n" + makeerrornet(errorid, prefix + errorid + ">", knowledgetable);
                        }
                    }
                }
            }
        }
    }
    return returnstr;
}

function makeknowledgeview() {

}

function makeerrortext(error, prefix, map) {
    var errorfilename = datapath + "error." + error.id + ".yaml";
    var errorobj = yaml.load(fs.readFileSync(errorfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });

    var treetext = errorobj.text;
    var treereadme = errorobj.readme;

    for (var placeholder in errorobj.interface) {
        var newvalue;
        if ((map != null) && (map[placeholder] != null)) {
            // use global placeholder
            newvalue = map[placeholder];
        } else {
            // use local value
            newvalue = errorobj.interface[placeholder];
        }
        treetext = treetext.split(placeholder).join(newvalue);
        //log("treetext:  \n" + treetext);
        if (treereadme != null) {
            treereadme = treereadme.split(placeholder).join(newvalue);
            //log("treereadme:  \n" + treereadme);
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

