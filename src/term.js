var fs = require('fs');
var yaml = require('js-yaml');

const gitpath = "../../";
const rawrepopath = "../../raw/";
const draftrepopath = "../../draft/";
const datapath = "../data/";
const viewpath = "../view/";

const helpstr = `
node term all   : term metada + termset metadata → allterm metadata
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
    } else if ((arguments.length == 2) & (arguments[0] == "term")) {
        // node term term id   : term metadata → term markdown + html
        var termid = arguments[1];
        loadallterm();
        maketermview(termid);
    } else if ((arguments.length == 2) & (arguments[0] != "termset")) {
        // node term termset id    ： termset metadata → termset markdown + html
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
    allterm["term"] = termmap ;
    allterm["termset"] = termsetmap;

    fs.writeFile(datapath+"allterm.yaml", yaml.dump(allterm), (err) => {
        if (err) throw err;
        console.log(datapath+'allterm.yaml文件已更新。');
      });
}

function maketermview(termid) {

}

function maketermsetview(termsetid) {

}