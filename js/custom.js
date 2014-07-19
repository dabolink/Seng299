var curUser = '';
var privlage = '';

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
		School: document.getElementById('School').value,
		Privlage: '',
	});
	serverPost('addUser', user, function(result){
		if(result.message == 'true'){
			alert('registration sucessful');
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
	serverPost('getSchools',null,function(result){
		for(i=0;i<result.Schools.length;i++){
			addSchool(result.Schools[i]);
		}
	});
}
// add 1 school to selection
function addSchool(school){
	var x = document.getElementById('School');
	var option = document.createElement("option");
	option.text = school;
	x.add(option);
}

function addGPs(){
	serverPost('getGPs',null,function(result){
		for(i=0;i<result.GPs.length;i++){
			addGP(result.GPs[i]);
		}
	});
}

function addGP(GP){
	var x = document.getElementById('GP');
	var option = document.createElement("option");
	option.text = GP;
	x.add(option);
}

//send email
function sendEmail(){
	alert('Confirmation Email Sent (To Be Implemented)');
}
function checkFgtPassUser(){
	var x = document.getElementById('fgtpassUser');
	var sendEmailB = document.getElementById('sendEmailB');
	var y = x.value;
	if (y == ''){
		alert('please input username');
	}
	else{
		alert('confirmation email sent (To Be Implemented)');
		sendEmailB.setAttribute('href','#login');
	}
}
function checkRegistration(){
	var valid = true;
	var fName = document.getElementById('firstName').value;
	var lName = document.getElementById('lastName').value;
	var DoB = document.getElementById('birthDate').value;
	var reg = document.getElementById('Register');
	var incomplete = '';
	if(DoB == ''){
		incomplete += 'Date not correct\n';
		valid = false;
	}
	if ((fName == '') || (lName == '')){
		incomplete +='Missing first or last name\n';
		valid = false;
	}
	var MF = checkMF();
	if(MF == 'undefined'){
		incomplete += 'Please select gender\n';
		valid = false;
	}
	if(!checkUser()){
		incomplete += 'Username taken\n';
		valid = false;
	}
	if(checkPassword()){
		incomplete += "Passwords don't match or are empty\n";
		valid = false;
	}
	var email = document.getElementById('Email').value;
	if(email == ''){
		incomplete += 'Please enter an E-Mail address\n';
		valid = false;
	}
	var School = document.getElementById('School').value;
	if(School == 'NULL'){
		incomplete +='Please select school you are currently attending\n';
		valid = false;
	}
	var ToS = document.getElementById('ToS');
	if(!ToS.checked){
		incomplete += 'Please accept Terms of Service\n';
		valid = false;
	}
	if(valid){
		return true;
	} 
	else {
		alert('Registration incomplete. Please fix the following:\n\n' + incomplete);
		return false;
	}
}
function checkUser(){
	var user = document.getElementById('username').value;
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
		return 'Male';
	} else if (female) {
		return 'Female';
	}
}
function signOut(){
	window.curUser = '';
}
function confirmUserPass(){
	var userE = document.getElementById('userlogin').value;
	var passE = document.getElementById('passlogin').value;
	var user = JSON.stringify({
		Username: userE,
		Password: passE,
	});
	serverPost('checkPass',user, function(result){
		if(result.user != ''){
			window.curUser = userE;
			window.Privlage = result.Privlage;
			if(window.Privlage == 'admin'){
				addAllUsers();
			}
			$.mobile.changePage("#main");
		}
		else if (result.message == 'err'){
		
		}
		else{
			alert("Invalid Username or Password");
		}
	});
}

function cancelAppointment(){
	serverPost('', JSON.stringify({number:1}), function(result){alert(result.message);});
	alert('Appointment cancelled.\n')
}

function getProfileInfo(){
	serverPost('getProfile', JSON.stringify({Username: curUser}), function(result){
		var userInfo = document.getElementById('profileInfo');
		userInfo.innerHTML = '<p>Name: ' + result.User.FirstName + " " + result.User.LastName
			+ '</p><p>Date of Birth: ' + result.User.DateOfBirth
			+ '</p><p>Gender: ' + result.User.gender
			+ '</p><p>Username: ' + result.User.Username
			+ '</p><p>E-Mail: ' + result.User.EMail
			+ '</p><p>School: ' + result.User.School + '</p>';
	});
}

function getApptTimes(){
	var field = document.getElementById('availableTimes');
	var curGP = document.getElementById('GP').value;
	var selectedDate = document.getElementById('BookApptDate').value;

	field.innerHTML = '';
	if (curGP != 'NULL' && selectedDate){
		serverPost('getApptTimes', JSON.stringify({
			GPs: curGP,
			ApptDate: selectedDate
		}), function(result){
			alert(result.ApptTimes);
			if (result.ApptTimes){
				field.innerHTML = '<fieldset data-role=\"controlgroup\" data-mini=\"true\"><legend>Choose a time:</legend>';
				for( i = 0; i < result.ApptTimes.length; i++){
					field.innerHTML += '<input type=\"radio\" name=\"radio-mini\" id=\"radio-mini-' + i + '\" value=\"' + result.ApptTimes[i].Time + '\" /><label for=\"radio-mini-' + i + '\">' + result.ApptTimes[i].Time + '</label>';
				}
				innerHTML += '</fieldset>';
			}
			else {
				field.innerHTML = '<strong>Sorry, ' + curGP + ' is not available times for the requested date.</strong>'
			}
		});
	}
	else{
		field.innerHTML = '<p><strong>Please select a date and/or a GP.<strong></p>'
	}
}


/*************************************************************************************************************************************
														admin functions
*************************************************************************************************************************************/


function removeUser(){
	var User = document.getElementById('allUsers').value;
	serverPost('removeUser',JSON.stringify({Username: User}),function(result){
		alert(User + " has been deleted for the database");
		if(User == curUser){
			alert("deleted your own account");
			signOut();
		}
	});
}
function addAllUsers(){
	serverPost('addAllUsers',null,function(result){
		for(i=0;i<result.Users.Users.length;i++){
			addUsers(result.Users.Users[i].Username);
		}
	});
}
// add 1 school to selection
function addUsers(user){
	var x = document.getElementById('allUsers');
	var option = document.createElement("option");
	option.text = user;
	option.value = user;
	x.add(option);
}
function addSchoolToDB(){

}
function addGPToDB(){

}

/*************************************************************************************************************************************
														Redirect to login if no current login
*************************************************************************************************************************************/


$('#main').live('pageinit',function(){
	if(window.curUser == ''){
		$.mobile.changePage("#login");
		alert("Must be logged in to access this page");
	}
});
$('#profile').live('pageinit',function(){
	if(window.curUser == ''){
		$.mobile.changePage("#login");
		alert("Must be logged in to access this page");
	}
});
$('#bookAppt').live('pageinit',function(){
	if(window.curUser == ''){
		$.mobile.changePage("#login");
		alert("Must be logged in to access this page");
	}
});
$('#viewAppt').live('pageinit',function(){
	if(window.curUser == ''){
		$.mobile.changePage("#login");
		alert("Must be logged in to access this page");
	}
});
$('#admin').live('pageinit',function(){
	if(window.curUser == '' || window.Privlage != 'admin'){
		$.mobile.changePage("#login");
		alert("You Must have higher standing to access this page");
	}
});