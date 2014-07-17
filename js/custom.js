function initialization(){
	addSchools();
	addGPs();
}

//Post data to a server, or create an alert if there was an error.
//A function can be passed in if the server is expected to send a JSON response.
//Variables:
//	uri 		An indicator the server will read in as the action (See serverPost Methods in expresso.js)
//	data 		A valid JSON string. Use JSON.stringify({ data:value })
function serverPost(uri, keyPair, successFunction){

	$.ajax({
    url: '/' + uri, 
    type: 'POST', 
    contentType: 'application/json', 
    data: keyPair,
    success: function(result){
    	successFunction(result);
    },
	error: function(xhr){
		alert('There was a problem.\n' + xhr.responseText);
	}})
}

function createUser(){
	if(!checkRegistration()){
		return;
	}
	var user = JSON.stringify({
		FirstName: document.getElementById('firstName').value,
		LastName: document.getElementById('lastName').value,
		DateOfBirth: document.getElementById('birthDate').value,
		gender: checkMF(),
		Username: document.getElementById('username').value,
		Password: document.getElementById('password').value,
		EMail: document.getElementById('Email').value,
		School: document.getElementById('School').value
	});
	alert(user.Username);
	serverPost('addUser', user, function(result){
		alert(result.message);
		if(result.message == 'true'){
			alert('registration sucessfull');
			$.mobile.changePage("#login");
			alert('confirmation email sent');
		}		
		else if(result.message == 'err'){
		
		}
		else{
			alert('Username is already Taken');
		}
	});
}

//check if rewritten password == password
function checkPassword(){
	var pass = document.getElementById('password').value;
	var repass = document.getElementById('repassword').value;
	if((pass != repass) && (pass != '') && (repass != '')){
		return true;
	}
	return false;
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

function addGPs(){
	addGP('Greg Howe');
}

function addGP(GP){
	var x = document.getElementById('GP');
	var option = document.createElement("option");
	option.text = GP;
	x.add(option);
}

//send email
function sendEmail(){
	alert('Confirmation Email Sent');
}
function checkFgtPassUser(){
	var x = document.getElementById('fgtpassUser');
	var sendEmailB = document.getElementById('sendEmailB');
	var y = x.value;
	if (y == ''){
		alert('please input username');
	}
	else{
		alert('confirmation email sent');
		sendEmailB.setAttribute('href','#login');
	}
}
function checkRegistration(){
	var valid = true;
	var fName = document.getElementById('firstName').value;
	var lName = document.getElementById('lastName').value;
	var DoB = document.getElementById('birthDate').value;
	var reg = document.getElementById('Register');
	if(DoB == ''){
		alert('date not correct');
		valid = false;
	}
	if ((fName == '') || (lName == '')){
		alert('missing first or last name');
		valid = false;
	}
	var MF = checkMF();
	if(MF == 'undefined'){
		alert('please select gender');
		valid = false;
	}
	if(!checkUser()){
		alert('username taken');
		valid = false;
	}
	if(checkPassword()){
		alert("passwords don't match or are empty");
		valid = false;
	}
	var email = document.getElementById('Email').value;
	if(email == ''){
		alert('please enter E-Mail address');
		valid = false;
	}
	var School = document.getElementById('School').value;
	if(School == 'NULL'){
		alert('please select school you are currently attending');
		valid = false;
	}
	var ToS = document.getElementById('ToS');
	if(!ToS.checked){
		alert('please accept Terms of Service');
		valid = false;
	}
	if(valid){
		return true;
	} 
	else {
		alert('registration incomplete');
		return false;
	}
}
function checkUser(){
	var user = document.getElementById('username').value;
	alert(user);
	if(user != ''){
		return true;
	}
	return false;
}
function checkMF(){
	var male = document.getElementById('Male').checked;
	var female = document.getElementById('Female').checked;
	if((!male) && (!female)){
		return 'undefined';
	}else if (male){
		return 'male';
	} else if (female) {
		return 'female';
	}
}
function confirmUserPass(){
	var user = document.getElementById('userlogin').value;
	var pass = document.getElementById('passlogin').value;
	var user = JSON.stringify({
		Username: user,
		Password: pass,
	});
	serverPost('checkPass',user, function(result){
		alert(result.message);
		if(result.message == 'true'){
			$.mobile.changePage("#main");
		}
		else if (result.message == 'err'){
		
		}
		else{
			alert("Invalid Username or Password");
		}
	});
}
function alternateCheck(){

}
function cancelAppointment(){
	serverPost('', JSON.stringify({number:1}), function(result){alert(result.message);});
	alert('Appointment cancelled.\n')
}