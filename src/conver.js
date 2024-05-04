const fs = require('fs');
const yaml = require('js-yaml');

const datapath = "../data/";
var termmap = new Object()
var termsetmap = new Object();

try {
    fs.readdirSync(datapath).forEach(file => {
        if (file.substr(0, 5) == "term-") {
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
    console.log("enter termtoterm(), term id:", termobj.id);
    var bconver = false;
    var newobj = new Object();

    if (termobj.interface != null) {
        //console.log("interface before conver:\n%s", yaml.dump(termobj.interface));
        for (var key in termobj.interface) {
            if (key.slice(0, 6) == "<term.") {
                console.log("it is a new version term metadata.")
                break;
            } else {
                var interfacetype = key;
                for (var id in termobj.interface[interfacetype]) {
                    var oldplaceholder = "<" + interfacetype + "." + id + ">";
                    var newplaceholder = "<term." + termobj.id + "." + interfacetype + "." + id + ">";
                    //console.log("newplaceholder:",newplaceholder);
                    termobj.interface[newplaceholder] = termobj.interface[interfacetype][id];
                    delete termobj.interface[interfacetype][id];

                    termobj.text = termobj.text.split(oldplaceholder).join(newplaceholder);
                    if (termobj.readme != null) {
                        termobj.readme = termobj.readme.split(oldplaceholder).join(newplaceholder);
                    }
                }
                delete termobj.interface[interfacetype];
                bconver = true;
            }
        }
        //console.log("interface after conver:\n%s", yaml.dump(termobj.interface));
    } else {
        console.log("no interface field here.")
    }

    if (termobj.text != null) {
        console.log("it has a text field. move to item level.")
        termobj.item = new Array();
        var item = new Object();
        item.localid = "";
        item.text = termobj.text;
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
    //console.log("enter termsettoterm(), termset id:%s\n%s", termsetobj.id, yaml.dump(termsetobj, { 'lineWidth': -1 }));
    var newobj = new Object();
    newobj.name = termsetobj.name;
    newobj.id = termsetobj.id;

    var placeholdermap = new Object();
    if ((termsetobj.readme != null) && (termsetobj.readme != "")) {
        newobj.readme = termsetobj.readme;
    } if ((termsetobj.effect != null) && (termsetobj.effect != "")) {
        newobj.effect = termsetobj.effect;
    }
    // conver the placeholder
    if (termsetobj.interface != null) {
        newobj.interface = new Object();
        for (var interfacetype in termsetobj.interface) {
            if (termsetobj.interface[interfacetype] != null) {
                var typeobj = termsetobj.interface[interfacetype];
                for (var id in typeobj) {
                    var oldplaceholder = "<" + interfacetype + "." + id + ">";
                    var newplaceholder = "<term." + newobj.id + "." + interfacetype + "." + id + ">";
                    newobj.interface[newplaceholder] = typeobj[id];
                    placeholdermap[oldplaceholder] = newplaceholder;

                    // conver the term's readme
                    if (newobj.readme != null) {
                        newobj.readme = newobj.readme.split(oldplaceholder).join(newplaceholder);
                    }
                    // conver the term's effect
                    if (newobj.effect != null) {
                        newobj.effect = newobj.effect.split(oldplaceholder).join(newplaceholder);
                    }
                }
            }
        }
        /* console.log("%s termset interface:\n%s\nterm interface:\n%s\nthe conver map:\n%s",
            newobj.id,
            yaml.dump(termsetobj.interface),
            yaml.dump(newobj.interface),
            yaml.dump(placeholdermap)); */
    }

    // conver the item
    if (termsetobj.item != null) {
        newobj.item = new Array();
        for (var i in termsetobj.item) {
            newobj.item[i] = new Object();
            newobj.item[i].localid = termsetobj.item[i].sortid;
            newobj.item[i].termid = termsetobj.item[i].id; // whatever the type is term or termset, it has the same id.
            if (termsetobj.item[i].upgradeby != null) {
                if (termsetobj.item[i].upgradeby.slice(0, 6) == "<term.") {
                    // it is a placeholeder in term type
                    newobj.item[i].upgradeby = placeholdermap[termsetobj.item[i].upgradeby];
                } else {
                    // it is a sortid, now localid.
                    newobj.item[i].upgradeby = "<term." + newobj.id + ".localid" + "." + termsetobj.item[i].upgradeby + ">";
                }
            }
            if (termsetobj.item[i].map != null) {
                newobj.item[i].map = new Object();
                for (var maptype in termsetobj.item[i].map) {
                    var typeobj = termsetobj.item[i].map[maptype];
                    for (var id in typeobj) {
                        var itemlocalplaceholder = "<term." + newobj.item[i].termid + "." + maptype + "." + id + ">";
                        var globalplaceholder = "<term." + newobj.id + "." + maptype + "." + typeobj[id] + ">";
                        newobj.item[i].map[itemlocalplaceholder] = globalplaceholder;
                    }
                }
                /* console.log("%s termset item[%s].map:\n%s\nterm item.map:\n%s",
                    newobj.id, i,
                    yaml.dump(termsetobj.item[i].map),
                    yaml.dump(newobj.item[i].map)); */
            }
            // pass the type, path field
        }
    }
    //console.log("end of termsettoterm(), termset id:%s\n%s", termsetobj.id,yaml.dump(newobj,{ 'lineWidth': -1 }));
    return newobj;
}