var exec = require("child_process").exec;

function start(response){
	console.log("request handler 'start' was called.");
	var content = "empty";
	
	exec("ls -a", function(error, stdout, stderr){
		response.writeHead(200, {"Content-Type": "text/plain"});
		response.write(stdout);
		console.log(stdout);
		response.end();
		console.log("request finished");
	});
	
	return content;
}

function upload(response){
	console.log("request handler 'upload' was called.");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("Hello Upload");
	response.end();
}

exports.start = start;
exports.upload = upload;