var infra = require("./Infra");

exports.postfile = postfile ;
exports.postupdate = postupdate ;

function postfile(item) {
	var thisHash = infra.getthisHash();
	console.log("enter PSMD postfile, ID:",thisHash);
	if (item.substr(0,9) == "transfer."){
		var obj = yaml.safeLoad(fs.readFileSync("post/"+item, 'utf8'));
		var log = yaml.safeLoad(obj.log);
		var data = yaml.safeLoad(log.data);
		
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