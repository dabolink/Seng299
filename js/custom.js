//check if rewritten password == password
function checkPassword(){
	var pass = document.getElementById('password').value;
	var repass = document.getElementById('repassword').value;
	if(((pass != repass) && ((pass != '') && (repass != '')))){
		alert('passwords do not match');	
	}
}
//add schools to selection
function addSchools(){
	addSchool('University of Victoria');
	addSchool('University of British Columbia');
}
// add 1 school to selection
function addSchool(school){
	var x = document.getElementById('School');
	var option = document.createElement("option");
	option.text = school;
	x.add(option);
}

//send email
function sendEmail(){
	alert('Confirmation Email Sent');
}

function confirmUserPass(){
	var user = document.getElementById('userlogin').value;
	var pass = document.getElementById('passlogin').value;
	var loginB = document.getElementById('loginButton');
	if((user != '' )&&(pass != '')){
		loginB.setAttribute('href','#main');
	}
	else{
		alert('Incorrect Username or Password');
	}
}