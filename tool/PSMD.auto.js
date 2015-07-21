var infra = require("./Infra");

exports.postfile = postfile ;
exports.postupdate = postupdate ;

function postfile() {
	console.log("enter PSMD postfile");
	var thisHash = infra.getthisHash();
	if (item.substr(0,9) == "transfer."){
		var obj = yaml.safeLoad(fs.readFileSync("post/"+item, 'utf8'));
		var log = yaml.safeLoad(obj.log);
		var data = yaml.safeLoad(log.data);
		
		var input = data.input;
		var output = data.output;
		
		var id = output.id;
		if (id == thisHash) {
			var amount = output.amount;
			infra.CODtransfer(thisHash,'f82478ea56a214d867522cdbcd52c7b5b323f939',amount*0.02);
		}
	}
}

function postupdate() {
	console.log("enter PSMD postupdate");
}