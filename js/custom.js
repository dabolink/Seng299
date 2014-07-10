function checkPassword(){
	var pass = document.getElementById('password').value;
	var repass = document.getElementById('repassword').value;
	if(((pass != repass) && ((pass != '') && (repass != '')))){
		alert('passwords do not match');	
	}
}
function emptyInput(){
	if(this.value == 'NULL'){alert('invalid school');}
}

function sendEmail(){
	alert('Confirmation Email Sent');
}