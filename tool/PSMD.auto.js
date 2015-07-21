var fs = require('fs');
var yaml = require('js-yaml');
var openpgp = require('openpgp');
var infra = require("./Infra");

exports.postfile = postfile ;
exports.postupdate = postupdate ;

function postfile(item) {
	console.log("process.argv:",process.argv);
	var thisHash = infra.getthisHash(process.argv[1]);
	console.log("enter PSMD postfile, ID:",thisHash);
	
	var pubfile = new Object();
	var files = fs.readdirSync("post/");

	files.forEach(function(filename) {
		if(filename.substr(0,4) == "nor."){
			var nor = yaml.safeLoad(fs.readFileSync("post/"+filename,'utf8'));
			var pubkey = openpgp.key.readArmored(nor.data.pubkey).keys[0];
			pubfile[pubkey.primaryKey.fingerprint] = "post/"+filename;
		}else if((filename.substr(filename.indexOf(".")+1,5) == "auto.") || (filename.substr(0,5) == "auto.")){
			var auto = yaml.safeLoad(fs.readFileSync("post/"+filename,'utf8'));
			pubfile[auto.data.id] = "post/"+filename;
		}
	});
	
	if (item.substr(0,9) == "transfer."){
		var obj = yaml.safeLoad(fs.readFileSync("post/"+item, 'utf8'));
		
		if(obj.log != undefined){
			var log = yaml.safeLoad(obj.log);
			data = yaml.safeLoad(log.data);
		}else{
			data = obj.data;
			var msg = openpgp.cleartext.readArmored(data);
			var author = obj.author ;
			var nor = yaml.safeLoad(fs.readFileSync(pubfile[author],'utf8'));
			var pubkeys = openpgp.key.readArmored(nor.data.pubkey).keys;
			var pubkey = pubkeys[0];
			var result = msg.verify(pubkeys);

			data = yaml.safeLoad(msg.text);
		}
		
		var input = data.input;
		var output = data.output;
		
		var id = output.id;
		if (id == thisHash) {
			var amount = output.amount;
			infra.CODtransfer(thisHash,'7c0fa6e0fff49e7d0b15a112cef2e8969dd42966',amount*0.02);
		}
	}
}

function postupdate() {
	console.log("enter PSMD postupdate");
}