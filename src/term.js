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

    fs.writeFileSync(datapath + "allknowledge.yaml", yaml.dump(allknowledge, { 'lineWidth': -1 }));
    console.log(datapath + 'allknowledge.yaml文件已更新。\n' + yaml.dump(allknowledge, { 'lineWidth': -1 }));
}

function makeallterm() {
    //console.log(yaml.dump(termmap,{'lineWidth': -1}));
    //console.log(yaml.dump(termsetmap,{'lineWidth': -1}));
    var allterm = new Object();
    allterm["term"] = termmap;
    allterm["termset"] = termsetmap;

    fs.writeFile(datapath + "allterm.yaml", yaml.dump(allterm, { 'lineWidth': -1 }), (err) => {
        if (err) throw err;
        console.log(datapath + 'allterm.yaml文件已更新。');
    });
}

function commit() {
    var alltempterm = new Object();
    //var alltemptermset = new Object();
    var alltemperror = new Object();
    var alltempknowledge = new Object();
    var termmap = new Object();
    //var termsetmap = new Object();
    var errormap = new Object();
    var knowledgemap = new Object();

    fs.readdirSync(datapath).forEach(file => {
        if ((file.substr(0, 5) == "term.") & (file.length < 18)) {
            console.log("commit " + file);
            var tempterm = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltempterm[tempterm.id] = tempterm;

            //var hashid = crypto.createHash("sha256").update(tempterm.name).digest("hex").slice(0, 8);
            var hashid = util.makemetafileid(tempterm.name);
            console.log(tempterm.name, hashid);
            termmap[tempterm.id] = hashid;
        }
        if ((file.substr(0, 6) == "error.") & (file.length < 19)) {
            console.log("commit " + file);
            var temperror = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltemperror[temperror.id] = temperror;

            var hashid = util.makemetafileid(temperror.name);
            console.log(temperror.name, hashid);
            errormap[temperror.id] = hashid;
        } if ((file.substr(0, 10) == "knowledge.") & (file.length < 23)) {
            console.log("commit " + file);
            var tempknowledge = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            alltempknowledge[tempknowledge.id] = tempknowledge;

            var hashid = util.makemetafileid(tempknowledge.name);
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
            var oldplaceholder = new RegExp("<term." + id + ".", "g");
            var newplaceholder = "<term." + termmap[id] + ".";

            //console.log("before replace the main id:\n", yaml.dump(term, { 'lineWidth': -1 }));
            term.id = termmap[id];
            term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
            //console.log("after replace the main id:\n", yaml.dump(term, { 'lineWidth': -1 }));
        } else {
            console.log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }

        // replace the placeholds in item
        for (var itemid in term.item) {
            var itemobj = term.item[itemid];
            if ((itemobj.termid != null) && (termmap[itemobj.termid] != null)) {
                var oldplaceholder = new RegExp("<term." + itemobj.termid + ".", "g");
                var newplaceholder = "<term." + termmap[itemobj.termid] + ".";

                //console.log("before replace the %d-th item:\n", itemid,yaml.dump(term, { 'lineWidth': -1 }));
                term.item[itemid].termid = termmap[term.item[itemid].termid];
                term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
                //console.log("after replace the %d-th item:\n", itemid,yaml.dump(term, { 'lineWidth': -1 }));
            }
        }
        // replace the errorid
        if (term.depend != null) {
            for (var dependid in term.depend) {
                var errorid = term.depend[dependid].errorid;
                if (errormap[errorid] != null) {
                    var oldplaceholder = new RegExp("<error." + errorid + ".", "g");
                    var newplaceholder = "<error." + errormap[errorid] + ".";
                    //console.log("before replace the %d-th depend:\n", dependid,yaml.dump(term, { 'lineWidth': -1 }));
                    term.depend[dependid].errorid = errormap[errorid];
                    term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
                    //console.log("after replace the %d-th depend:\n", dependid,yaml.dump(term, { 'lineWidth': -1 }));
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
                    //console.log("before replace the %d-th effect:\n%s", effectid, yaml.dump(term, { 'lineWidth': -1 }));
                    term.effect[effectid].errorid = errormap[errorid];
                    term = yaml.load(yaml.dump(term, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
                    //console.log("after replace the %d-th effect:\n%s", effectid, yaml.dump(term, { 'lineWidth': -1 }));
                }
            }
        }

        var newfilename = datapath + "term." + termmap[id] + ".yaml";
        fs.writeFileSync(newfilename, yaml.dump(term, { 'lineWidth': -1 }));
        console.log(newfilename + "文件已更新。" + oldfilename + "可以删除。");
    }

    for (var id in alltemperror) {
        var error = alltemperror[id];
        var oldfilename = datapath + "error." + id + ".yaml";

        if (errormap[id] != null) {

            var oldplaceholder = new RegExp("<error." + id + ".", "g");
            var newplaceholder = "<error." + errormap[id] + ".";
            //console.log("before replace the error:\n%s", id, yaml.dump(error, { 'lineWidth': -1 }));
            error.id = errormap[id];
            error = yaml.load(yaml.dump(error, { 'lineWidth': -1 }).replace(oldplaceholder, newplaceholder), { schema: yaml.FAILSAFE_SCHEMA });
            //console.log("after replace the error:\n%s", id, yaml.dump(error, { 'lineWidth': -1 }));
        } else {
            console.log("旧文件:" + oldfilename + "中的id:" + id + "未能替换，请人工检查。")
        }

        var newfilename = datapath + "error." + errormap[id] + ".yaml";

        fs.writeFileSync(newfilename, yaml.dump(error, { 'lineWidth': -1 }));
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
                var newobj = yaml.load(yaml.dump(knowledge.depend[oldid], { 'lineWidth': -1 }));
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
                    var newobj = yaml.load(yaml.dump(knowledge.effect[oldid], { 'lineWidth': -1 }));
                    knowledge.effect[newid] = newobj;
                    delete knowledge.effect[oldid];
                } else {
                    console.log("旧文件:" + oldfilename + "中effect字段的id: " + oldid + " 未能替换，请人工检查。");
                }
            }
        }

        //var option = new Object({forceQuotes:true}); 
        fs.writeFileSync(newfilename, yaml.dump(knowledge, { 'lineWidth': -1 }));
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
    var item = new Object();
    item.termid = termid;
    var termtext = maketermtext(item, "", null);

    //console.log("return value:"+termtext) ;
    //console.log("return obj:\n"+yaml.dump(term,{'lineWidth': -1}));

    var viewfilename = viewpath + "term." + termid + ".md";
    var viewstr = "条款 " + termid + " 正文:\n" + item.treetext;
    if (item.treereadme != null) {
        viewstr = viewstr + "\n---\n条款 " + termid + " readme:\n" + item.treereadme
    }
    fs.writeFileSync(viewfilename, viewstr);
    console.log(viewfilename + "文件更新，内容如下:\n" + viewstr);


    item.treehtml = item.treetext.replace(/\n/g,'<br/>\n');
    item.treereadmehtml = item.treereadme.replace(/\n/g,'<br/>\n');

    var termhtml = maketermhtml(item);
    viewfilename = viewpath + "term." + termid + ".html";
    
    fs.writeFileSync(viewfilename, termhtml);
    console.log(viewfilename + "文件更新，内容如下:\n" + termhtml);
}

function maketermhtml(item){

    if(true){
        //jade
        const tempfilename = datapath + "termtemp.jade" ;
        var tempstr = fs.readFileSync(tempfilename,'utf-8');

        item.alert = false;
        item.confirm = true;
        item.prompt = false;
        item.readme = true;
    
        item.alertstr = "alert(\"alert test.\")";
        item.confirmstr = "confirm(\"confirm test.\")";
        item.promptstr = "prompt(\"prompt test.\",\"default\")";
        var fn = jade.compile(tempstr);

        var htmlstr = fn(item);
        //console.log("html file:\n"+htmlstr);
        return htmlstr ;
    }else{
        //ejs
        const tempfilename = datapath + "termtemp.ejs" ;
        var tempstr = fs.readFileSync(tempfilename,'utf-8');
    
        item.alert = false;
        item.confirm = false;
        item.prompt = false;
        item.readme = true;
    
        item.alertstr = "alert(\"alert test.\")";
        item.confirmstr = "confirm(\"confirm test.\")";
        item.promptstr = "prompt(\"prompt test.\",\"default\")";
        //console.log("item:\n"+yaml.dump(item));
        var htmlstr = ejs.render(tempstr, item);
        //console.log("html file:\n"+htmlstr);
        return htmlstr ;
    }
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
            item.termid = item.id;
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

function maketermtext(item, prefix, map) {
    console.log("enter maketermtext:"+item.termid+"\tprefix:"+prefix);
    var termfilename = datapath + "term." + item.termid + ".yaml";
    var termobj = yaml.load(fs.readFileSync(termfilename, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });

    var treetext = "";
    var treereadme;
    if ((termobj.readme != null) & (termobj.readme != "")) {
        treereadme = termobj.readme;
    } else {
        treereadme = "";
    }

    for (var itemid in termobj.item) {
        var itemobj = termobj.item[itemid];
        
        // make prefix
        var subprefix = prefix;
        if ((itemobj.localid != null) && (itemobj.localid != "")) {
            subprefix = prefix + itemobj.localid + "."
        }
        //console.log("subprefix:"+subprefix);

        // make upgrade by...
        var upgradestr = "";
        if(itemobj.upgradeby != null){
            console.log("%s>local upgradeby slice:\n0~6:%s\n6~14:%s\n14~22:%s\n23~-1:%s",item.termid,itemobj.upgradeby.slice(0,6),itemobj.upgradeby.slice(6,14),itemobj.upgradeby.slice(14,22),itemobj.upgradeby.slice(23,-1))
        }
        
        if(item.upgradeby != null){
            // use global item's metadata
            upgradestr = "本条款按照" + item.upgradeby + "条款修订。"
        }else if((itemobj.upgradeby != null)&&(itemobj.upgradeby.slice(0,6) == "<term.")&&(itemobj.upgradeby.slice(6,14) == item.termid)&&(itemobj.upgradeby.slice(14,22) == ".localid")){
            // use local metadata
            var localupgradeby = prefix + itemobj.upgradeby.slice(23,-1) + ".";
            if(localupgradeby == subprefix){
                localupgradeby = "本";
            }
            upgradestr = "本条款按照" + localupgradeby + "条款修订。"
            itemobj.upgradeby = localupgradeby ;
        }
        console.log("%s>upgradestr:%s",item.termid,upgradestr);

        if (itemobj.text != null) {
            treetext = treetext + subprefix + " " + upgradestr + itemobj.text; // + "\n"
        }
        if (itemobj.termid != null) {
            var itemtext = maketermtext(itemobj, subprefix, itemobj.map);
            treetext = treetext + itemobj.treetext;
            //treetext = treetext + subprefix + "\n" + itemobj.treetext;
            if ((itemobj.treereadme != null) && (itemobj.treereadme != "")) {
                treereadme = treereadme + subprefix + " " + itemobj.treereadme;// + "\n";
                //treereadme = treereadme + subprefix + " readme:\n" + item.treereadme;
            }
        }
    }

    // depend, together, effect field -> text
    if(termobj.depend != null){
        for(var id in termobj,depend){

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
                //console.log("treereadme:  \n" + treereadme);
            }
        }
    }

    item.treetext = treetext;
    if (treereadme != "") {
        item.treereadme = treereadme;
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
    console.log(viewfilename + "文件更新，内容如下:\n" + viewstr);
}

// generate the error-depend error + knowledge- depend error 
function makeerrornet(errorid, prefix, knowledgetable) {
    //console.log(prefix+"enter makeerrornet: " + errorid + " 已查找的knowledge:\n" + yaml.dump(knowledgetable,{'lineWidth': -1}));
    //console.log("allknowledge:\n"+yaml.dump(knowledgemap,{'lineWidth': -1}));
    var returnstr = "";
    for (var id in knowledgemap) {
        //console.log(prefix+"search knowledge: " + id)
        var knowledgeobj = knowledgemap[id];
        //console.log("knowledgeobj:\n"+yaml.dump(knowledgeobj,{'lineWidth': -1}));
        for (effectid in knowledgeobj.effect) {
            //console.log("effectid:\n"+effectid);
            if (effectid == errorid) {
                // find a effective knowledge
                if (knowledgetable[id] == null) {
                    if (knowledgeobj.type == "termtoerror") {
                        var termviewfilename = viewpath + "term." + knowledgeobj.objid + ".md";
                        var appendstr = prefix + "发现knowledge " + id + " :使用term [" + knowledgeobj.objid + "](" + termviewfilename + ") 可能解决 error " + errorid + " 预估有效的比例是 " + knowledgeobj.effect[effectid].percent + "%";
                        console.log(appendstr);
                        returnstr = returnstr + appendstr + "\n";
                    } else if (knowledgeobj.type == "termsettoerror") {
                        var termsetviewfilename = viewpath + "term." + knowledgeobj.objid + ".md";
                        var appendstr = prefix + "发现knowledge " + id + " :使用termset [" + knowledgeobj.objid + "](" + termsetviewfilename + ")  可能解决 error " + errorid + " 预估有效的比例是 " + knowledgeobj.effect[effectid].percent + "%";
                        console.log(appendstr);
                        returnstr = returnstr + appendstr + "\n";
                    }
                    knowledgetable[id] = true;
                    if (knowledgeobj.depend != null) {
                        var appendstr = prefix + "使用knowledge " + id + " 需要先解决error:";
                        console.log(appendstr);
                        returnstr = returnstr + appendstr;
                        for (var errorid in knowledgeobj.depend) {
                            var errorviewfilename = viewpath + "error." + errorid + ".md";
                            var appendstr = prefix + "[" + errorid + "](" + errorviewfilename + ")"
                            console.log(appendstr);
                            returnstr = returnstr + "[" + errorid + "](" + errorviewfilename + ") ";

                            returnstr = returnstr + "\n" + makeerrornet(errorid, prefix + errorid + ">", knowledgetable);
                        }
                    }
                    if (knowledgeobj.together != null) {
                        var appendstr = prefix + "使用knowledge " + id + " 需要同时解决error:";
                        console.log(appendstr);
                        returnstr = returnstr + appendstr + "\n";
                        for (var errorid in knowledgeobj.together) {
                            var errorviewfilename = viewpath + "error." + errorid + ".md";
                            var appendstr = prefix + "[" + errorid + "](" + errorviewfilename + ")"
                            console.log(appendstr);
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
        if ((map != null)&&(map[placeholder] != null)) {
            // use global placeholder
            newvalue = map[placeholder];
        } else {
            // use local value
            newvalue = errorobj.interface[placeholder];
        }
        treetext = treetext.split(placeholder).join(newvalue);
        //console.log("treetext:  \n" + treetext);
        if (treereadme != null) {
            treereadme = treereadme.split(placeholder).join(newvalue);
            //console.log("treereadme:  \n" + treereadme);
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

