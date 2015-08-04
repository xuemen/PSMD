var fs = require('fs');
var yaml = require('js-yaml');
var openpgp = require('openpgp');
var infra = require("./Infra");

exports.transfer = transfer ;
exports.nor = nor ;
exports.auto = auto ;
exports.deploy = deploy ;

function transfer(item,callback) {
	var thisHash = infra.getthisHash(__filename,3);
	console.log("PSMD transfer> ID:",thisHash);
	console.log("PSMD transfer> item:\n",item);
	
	if (item.filename.substr(0,9) == "transfer."){
		var obj = yaml.safeLoad(item.content);
		var data ;
		if(obj.log != undefined){
			var log = yaml.safeLoad(obj.log);
			data = yaml.safeLoad(log.data);
		}else if (obj.sigtype == 0){
			data = obj.data;
		}else if (obj.sigtype == 2){
			data = obj.data;
			var msg = openpgp.cleartext.readArmored(data);
			var author = obj.author ;
			var nor = yaml.safeLoad(fs.readFileSync(infra.key[author].norfilename,'utf8'));
			var pubkeys = openpgp.key.readArmored(nor.data.pubkey).keys;
			var pubkey = pubkeys[0];
			var result = msg.verify(pubkeys);
			data = yaml.safeLoad(msg.text);
		}
		if(data.hasOwnProperty("output")) {
			var output = data.output;
			var id = output.id;
			var amount = output.amount;
			if (id == thisHash) {
				var amount = output.amount;
				infra.CODtransfer(thisHash,'7c0fa6e0fff49e7d0b15a112cef2e8969dd42966',amount*0.02);
			}
		}
	}
	
	if (typeof(callback) != "undefined") {
		callback();
	}
}

function nor(item,callback) {
	console.log("PSMD nor> item:\n",item);
	if (typeof(callback) != "undefined") {
		callback();
	}
}

function auto(item,callback) {
	console.log("PSMD auto> item:\n",item);

	if (typeof(callback) != "undefined") {
		callback();
	}
}

function deploy(item,callback) {
	console.log("PSMD deploy> item:\n",item);
	if (typeof(callback) != "undefined") {
		callback();
	}
}