var infra = require('./Infra');

var fs = require('fs');
var readline = require('readline');
var yaml = require('js-yaml');

var config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'));



function listWorkshop(){
	console.log("实训班清单（课号）：") ;
	var files = fs.readdirSync("post/");
	// list the private key
	files.forEach(function(item) {
		if (item.substr(0,14) === 'PSMD.workshop.'){
			var workshop = yaml.safeLoad(fs.readFileSync("post/"+item,'utf8'));
			console.log(workshop.data.id);
		}
	});
}

function JoinWorkshop(){
	var secuserinfo = infra.secuserinfo;
	var pubuserinfo = infra.pubuserinfo;
	var balance = infra.balance;
	
	process.stdin.setEncoding('utf8');
	process.stdout.setEncoding('utf8');
	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	var workshopid,id;

	rl.question("请输入课号：\n", function(answer) {
		workshopid = answer;
		console.log("可选的学员(付款人):")
		for (var key in secuserinfo) {
			console.log("账号：\t"+key+"\n户主：\t"+secuserinfo[key]+"\n余额：\t"+balance[key]+"\n");
		}
		rl.question("学员账号：\n", function(answer) {
			for (var fingerprint in secuserinfo) {
				if (fingerprint.indexOf(answer) == 0){
					id = fingerprint;
				}
			}
			if(id == undefined){
				console.log('没有这个账号。');
				return;
			}
			console.log('学员完整账号：',id);

			rl.question("私钥密码：\n", function(answer) {
				passphrase = answer;
				rl.close();

				infra.transfer(id,"3BuyYUZ8JJqDOWvjLhIZkAPTSmQZpVCHAgzl8zpofpEvyJW79S2WvbZ8F18JgOvA5Mt6nJCv8SroMFhymqjRWQ==",1700,passphrase,function(retstr){
					console.log("\n\nenter join whokshop callback...\n");
					var data = new Object();
					data.id = workshopid;
					data.studentid = id;
					
					var item = new Object();
					item.cod = "PSMD";
					item.tag = "joinworkshop";
					item.author = id;
					item.data = data;
					item.sigtype = 0;
					item.remark = "join workshop"+retstr;
					console.log("join workshop:\n",item);
					
					infra.sent(item,"POST",function(retstr){
						console.log(retstr," 已创建.");
					});
				});
				
				
			});
		});
	});
}

function createWorkshop(){
	process.stdin.setEncoding('utf8');
	process.stdout.setEncoding('utf8');
	var rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	var workshopid,time,fee,admin;

	rl.question("请输入课号：\n", function(answer) {
		workshopid = answer;
		rl.question("开课时间：\n", function(answer) {
			time = answer;
			rl.question("学费：\n", function(answer) {
				fee = answer;
				rl.question("实训主任（不含空格的字符串）：\n", function(answer) {
					if(answer.indexOf(" ") == -1){
						admin = answer;
						rl.close();

						var data = new Object();
						data.id = workshopid;
						data.time = time;
						data.fee = fee;
						data.admin = admin;
						
						var item = new Object();
						item.cod = "PSMD";
						item.tag = "workshop";
						item.author = admin;
						item.data = data;
						item.sigtype = 0;
						item.remark = "workshop create";
						
						infra.sent(item,"POST",function(retstr){
							console.log(retstr," 已创建.");
						});
					}else {
						console.log("实训主任名字带空格，请重新运行。");
						process.exit(0);
					}
					
				});
			});
		});
	});
}

exports.postfile = postfile ;
exports.postupdate = postupdate ;

function postfile(item) {
	console.log("enter PSMD deploy postfile:\t",item);
	if (item.substr(0,14) == "PSMD.workshop."){
		var obj = yaml.safeLoad(fs.readFileSync("post/"+item, 'utf8'));
		console.log("psmd postfile obj:\n",obj);
		var data = obj.data;
	}
}

function postupdate() {
	console.log("enter PSMD deploy postupdate");
}