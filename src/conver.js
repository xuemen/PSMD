const fs = require('fs');
const yaml = require('js-yaml');

const datapath = "../data/";
var termmap = new Object()
var termsetmap = new Object();

try {
    fs.readdirSync(datapath).forEach(file => {
        if (file.substr(0, 5) == "term.") {
            var t = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            termmap[t.id] = t;

            var newobj = termtoterm(t);
            if (newobj != null) {
            //fs.writeFileSync(file,yaml.dump(newobj,{ 'lineWidth': -1 }));
            console.log("文件%s已经更新，内容：\n%s", file, yaml.dump(newobj, { 'lineWidth': -1 }));
            }
        }
        if (file.substr(0, 8) == "termset.") {
            var ts = yaml.load(fs.readFileSync(datapath + file, 'utf8'), { schema: yaml.FAILSAFE_SCHEMA });
            termsetmap[ts.id] = ts;

            var newobj = termsettoterm(ts);
            if (newobj != null) {
                //fs.writeFileSync(file,yaml.dump(newobj,{ 'lineWidth': -1 }));
                console.log("文件%s已经更新，内容：\n%s", file, yaml.dump(newobj, { 'lineWidth': -1 }));
            }

        }
    });
} catch (e) {
    // failure
    console.log("yaml read error！" + e);
}

function termtoterm(termobj) {
    console.log("enter termtoterm(), term id:",termobj.id);
    var bconver = false;
    var newobj = new Object();

    if (termobj.interface != null) {
        //console.log("interface before conver:\n%s", yaml.dump(termobj.interface));
        for (var key in termobj.interface) {
            if(key.slice(0,6) == "<term."){
                console.log("it is a new version term metadata.")
                break;
            }else{
                var interfacetype = key ;
                for (var id in termobj.interface[interfacetype]) {
                    var oldplaceholder = "<" + interfacetype + "." + id + ">";
                    var newplaceholder = "<term." + termobj.id + "." + interfacetype + "." + id + ">";
                    //console.log("newplaceholder:",newplaceholder);
                    termobj.interface[newplaceholder] = termobj.interface[interfacetype][id];
                    delete termobj.interface[interfacetype][id];
    
                    termobj.text = termobj.text.split(oldplaceholder).join(newplaceholder);
                    if(termobj.readme != null){
                        termobj.readme = termobj.readme.split(oldplaceholder).join(newplaceholder);
                    }
                }
                delete termobj.interface[interfacetype];
                bconver = true;
            }
        }
        //console.log("interface after conver:\n%s", yaml.dump(termobj.interface));
    }else{
        console.log("no interface field here.")
    }

    if(termobj.text != null){
        console.log("it has a text field. move to item level.")
        termobj.item = new Array();
        var item = new Object();
        item.localid = "";
        item.text = termobj.text ;
        delete termobj.text;
        //readme remain in root level
        termobj.item.push(item);
        bconver = true;
    }

    if (bconver) {
        return termobj;
    } else {
        return;
    }
}

function termsettoterm(termsetobj) {
    var bconver = false;

    
    if (bconver) {
        return termobj;
    } else {
        return;
    }
}