var curUser = '';
var Privilege = '';
var apptList = [];

function initialization(){
	addSchools();
	addGPs("GP");
	
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
		Privilege: '',
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
		for(i=0;i<result.names.length;i++){
			addSchool(result.names[i].name);
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

function addGPs(name){
	serverPost('getGPs',null,function(result){
		for(i=0;i<result.names.length;i++){
			addGP(result.names[i].name,name);
		}
	});
}

function addGP(GP,name){
	var x = document.getElementById(name);
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
			window.Privilege = result.Privilege;
			if(window.Privilege == 'admin'){
				addAllUsers();
				addGPs('allGPsApp');
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
function createAppointment(){
	var GP = document.getElementById('allGPsApp').value;
	var Date = document.getElementById('addedDateApp').value;
	var Time = document.getElementById('addedTimeApp').value;
	var AMPM = document.getElementById('addedAMPMApp').value;
	var appointment = JSON.stringify({
		GPs: GP,
		ApptDate: Date,
		ApptTime: Time + " " + AMPM,
		Patient: '',
		Reason: '',
	});
	serverPost('addAppointment', appointment, function(result){
		if(result.message == 'true'){
			alert("appointment added");
		}
		else{
			alert("appointment already created");
		}
	});
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
	var bookB = document.getElementById('bookButton');
	var field = document.getElementById('availableTimes');
	var curGP = document.getElementById('GP').value;
	var selectedDate = document.getElementById('BookApptDate').value;

	bookB.setAttribute('href','#');
	bookB.setAttribute('onmouseup', '');
	field.innerHTML = '';
	var tempHTML = '';
	if (curGP != 'NULL' && selectedDate && beforeTomorrow(selectedDate)){
		field.innerHTML = '<p>Loading, please wait.</p>';
		serverPost('getApptTimes', JSON.stringify({
			GPs: curGP,
			ApptDate: selectedDate
		}), function(result){
			if (!result.message){
				tempHTML = '<legend>Choose a time:</legend>\n';
				for( i = 0; i < result.ApptTimes.length; i++){
					tempHTML += '<input type=\"radio\" name=\"radio-mini\" id=\"radio-mini-' + i + '\" value=\"' + result.ApptTimes[i].Time + '\" />\n<label for=\"radio-mini-' + i + '\">' + result.ApptTimes[i].Time + '</label>\n';
				}
				field.innerHTML = tempHTML;
				bookB.setAttribute('onmouseup', 'bookAppointment()');
			}
			else {
				field.innerHTML = '<strong>Sorry, ' + curGP + ' is not available for the requested date.</strong>'
			}
			$("#bookAppt").trigger("pagecreate");
		});
	}
	else{
		if(!beforeTomorrow(selectedDate) && curGP != 'NULL' && selectedDate){
			field.innerHTML = '<strong>Sorry, ' + curGP + ' is not available for the requested date.</strong>'
		}
		else{
			field.innerHTML = '<p><strong>Please select a date and/or a GP.<strong></p>'
		}
	}
}

function bookAppointment(){
	if($('input[name=radio-mini]:checked').size() > 0){
		serverPost('bookAppt', JSON.stringify({
			GPs: document.getElementById('GP').value,
			ApptDate: document.getElementById('BookApptDate').value,
			ApptTime: $('input[name=radio-mini]:checked').val(),
			Patient: curUser,
			Reason: document.getElementById('apptReason').value
		}), function(result){
			alert('Appointment booked');
			retrieveAppts();
			$.mobile.changePage("#viewAppt");
		})
		
	}
	else{
		alert('Please select a time.');
	}
}

function getDate(){
	var d = new Date();

	var month = d.getMonth()+1;
	var day = d.getDate();

	return (d.getFullYear() + '-' +
	    (month<10 ? '0' : '') + month + '-' +
	    (day<10 ? '0' : '') + day);
}

//Compares dates if they are string of the form yyyy-mm-dd
function beforeTomorrow(date1){
	try{
		var date2 = getDate();
		var year1 = date1.charAt(0) + date1.charAt(1) + date1.charAt(2) + date1.charAt(3),
		year2 = date2.charAt(0) + date2.charAt(1) + date2.charAt(2) + date2.charAt(3);
		if(parseInt(year2) <= parseInt(year1)){
			var month1 = date1.charAt(5) + date1.charAt(6),
			month2 = date2.charAt(5) + date2.charAt(6);
			if(parseInt(month2) <= parseInt(month1)){
				var day1 = date1.charAt(8) + date1.charAt(9),
				day2 = date2.charAt(8) + date2.charAt(9);
				if(parseInt(day2) < parseInt(day1)){
					return true;
				}
			}
		}
		return false;
	}
	catch(err){
		alert('Invalid string format\n' + err);
	}
}

function retrieveAppts(){
	apptList = [];
	var list = document.getElementById('userApptsList');
	list.innerHTML = '<p>Loading, please wait.</p>';
	serverPost('getUserAppt', JSON.stringify({
		Patient: curUser
	}), function(result){
		if(!result.message){
			var HTMLstring = '<legend>Appointments:</legend>';
			for(var i=0; i < result.Appts.length; i++){
				HTMLstring += '<input type="checkbox" name="checkbox-' + i + '" id="checkbox-' + i + '" class="custom" /><label for="checkbox-' + i + '">';
				HTMLstring += result.Appts[i].Appts.ApptDate + ' @ ' + result.Appts[i].Appts.ApptTime + ' with ' + result.Appts[i].Appts.GPs + '</label>';
				apptList.push({GPs: result.Appts[i].Appts.GPs, ApptDate: result.Appts[i].Appts.ApptDate, ApptTime: result.Appts[i].Appts.ApptTime});
			}
			list.innerHTML = HTMLstring;
			$("#viewAppt").trigger("pagecreate");
		}
		else{
			list.innerHTML = '<p>' + result.message + '</p>';
		}
	});
}

function cancelAppointment(){
	var temp = [];
	if(apptList.length > 0){
		for(var i = 0; i < apptList.length; i++){
			if (document.getElementById('checkbox-' + i).checked)
				temp.push({
					GPs: apptList[i].GPs,
					ApptDate: apptList[i].ApptDate,
					ApptTime: apptList[i].ApptTime,
					Patient: curUser
				});
		}
		serverPost('cancelAppt', JSON.stringify({
			Appts: temp
		}), function(result){
			alert('Appointment cancelled.\n');
			retrieveAppts();
		});
	}
	else{
		alert('There are no appointments to cancel');
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
		for(i=0;i<result.Users.length;i++){
			addUsers(result.Users[i].Username);
		}
	});
}
function addSchoolToDB(){
	var SchoolName = document.getElementById('addedSchool').value;
	serverPost('addSchoolToDB',JSON.stringify({name: SchoolName}),function(result){
		if(result == 'false'){
			alert('school already in database');
		}
		else{
			alert(SchoolName + ' has been added to the database');
		}
	});
}

function addUsers(user){
	var x = document.getElementById('allUsers');
	var option = document.createElement("option");
	option.text = user;
	option.value = user;
	x.add(option);
}

function addGPToDB(){
	var GPName = document.getElementById('addedGP').value;
	serverPost('addGPToDB',JSON.stringify({name: GPName}),function(result){
		if(result == 'false'){
			alert('GP already in database');
		}
		else{
			alert(GPName + ' has been added to the database');
		}
	});
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
	if(window.curUser == '' || window.Privilege != 'admin'){
		$.mobile.changePage("#login");
		alert("You Must have higher standing to access this page");
	}
});