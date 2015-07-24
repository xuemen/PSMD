var fs = require('fs');
var yaml = require('js-yaml');
var openpgp = require('openpgp');
var infra = require("./Infra");

exports.postfile = postfile ;
exports.postupdate = postupdate ;

function postfile(item) {
	var thisHash = infra.getthisHash(__filename,3);
	console.log("enter PSMD postfile, ID:",thisHash);
	
	if (item.filename.substr(0,9) == "transfer."){
		var obj = yaml.safeLoad(item.content);
		//console.log("\npostupdate event item:\n",item);
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
}

function postupdate() {
	console.log("enter PSMD postupdate");
}