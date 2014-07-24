/*******************************************************************************************************
 Global Variables
 ******************************************************************************************************/

var apptList = [];
var curAppt = -1;

/*******************************************************************************************************
 Utility Functions
 ******************************************************************************************************/
//Functions that are used by other functions to perform a a basic task

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
		if(xhr.status == 401){
			delete $.mobile.urlHistory.stack[0];
			$.mobile.changePage("#login");
		}
	}})
}

//Returns the current date in the form of yyyy-mm-dd
function getDate(){
	var d = new Date();

	var month = d.getMonth()+1;
	var day = d.getDate();

	return (d.getFullYear() + '-' +
	    (month<10 ? '0' : '') + month + '-' +
	    (day<10 ? '0' : '') + day);
}

//Compares a date with today's date if they are string of the form yyyy-mm-dd
// returns true if the specified date is today's date or comes before today's date
function beforeTomorrow(date1){
	try{
		var today = getDate();
		var year1 = date1.charAt(0) + date1.charAt(1) + date1.charAt(2) + date1.charAt(3),
		thisYear = today.charAt(0) + today.charAt(1) + today.charAt(2) + today.charAt(3);
		if(parseInt(thisYear) >= parseInt(year1)){
			var month1 = date1.charAt(5) + date1.charAt(6),
			thisMonth = today.charAt(5) + today.charAt(6);
			if(parseInt(thisMonth) >= parseInt(month1)){
				var day1 = date1.charAt(8) + date1.charAt(9),
				day = today.charAt(8) + today.charAt(9);
				if((parseInt(day)+1) > parseInt(day1)){
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

/*******************************************************************************************************
 Page Functions
 ******************************************************************************************************/
 // Functions that are used by separate pages

function initialization(){
	addSchools();
	addGPs("GP");
}

function signOut(){
	serverPost('signOut', {}, function(result){
		delete $.mobile.urlHistory.stack[0];
	})
}

//Add schools to selection menus
function addSchools(){
	serverPost('getSchools',null,function(result){
		for(i=0;i<result.names.length;i++){
			addSchool(result.names[i].name);
		}
	});
}

// Adds 1 school to selection menus
function addSchool(school){
	var x = document.getElementById('School');
	var option = document.createElement("option");
	option.text = school;
	x.add(option);
}

//Adds GPs to selection menus
function addGPs(name){
	serverPost('getGPs',null,function(result){
		for(i=0;i<result.names.length;i++){
			addGP(result.names[i].name,name);
		}
	});
}

// Adds a GP to selection menus
function addGP(GP,name){
	var x = document.getElementById(name);
	var option = document.createElement("option");
	option.text = GP;
	x.add(option);
}


/* Login */

function confirmUserPass(){
	var userE = document.getElementById('userlogin').value;
	var passE = md5(document.getElementById('passlogin').value);
	var user = JSON.stringify({
		Username: userE,
		Password: passE,
	});
	serverPost('checkPass',user, function(result){
		if(result.user != ''){
			storeLogin();
			$.mobile.changePage("#main");
			document.getElementById('userlogin').value = '';
			document.getElementById('passlogin').value = '';
		}
		else if (result.message == 'err'){
		
		}
		else{
			alert("Invalid Username or Password");
			document.getElementById('passlogin').value = '';
		}
	});
}

function storeLogin(){
	var curDate = getDate();
	var location = '';

	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(pos){
		
			geocoder = new google.maps.Geocoder();
			var lat = parseFloat(pos.coords.latitude);
			var lng = parseFloat(pos.coords.longitude);
			var latLng = new google.maps.LatLng(lat, lng);

			geocoder.geocode({'latLng': latLng}, function(results, status){
				if(status == google.maps.GeocoderStatus.OK){
					if(results[1]){
						serverPost('storeLogin', JSON.stringify({
							DateofLogin: curDate,
							Loc: results[1].formatted_address
							}), function(result){}
						);
					}
					else{
						serverPost('storeLogin', JSON.stringify({
							DateofLogin: curDate,
							Loc: 'Unknown location'
							}), function(result){}
						);
					}
				}
				else{
					console.log('Geocoder failed due to ' + status);
					serverPost('storeLogin', JSON.stringify({
							DateofLogin: curDate,
							Loc: 'Unknown location'
							}), function(result){}
						);
				}
			});
		}, function(err){
			serverPost('storeLogin', JSON.stringify({
				DateofLogin: curDate,
				Loc: 'Unknown location'
			}), function(result){});
		});
	}
	else{
		serverPost('storeLogin', JSON.stringify({
			DateofLogin: curDate,
			Loc: 'Unknown location'
			}), function(result){}
		);
	}
}


/* Registration Page */

//Creates a user from form data and posts it to the server
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
		Password: md5(document.getElementById('password').value),
		EMail: document.getElementById('Email').value,
		School: document.getElementById('School').value,
		Privilege: '',
	});
	serverPost('addUser', user, function(result){
		if(result.message == 'true'){
			alert('Registration sucessful');
			$.mobile.changePage("#login");
			alert('Confirmation email sent');
			document.getElementById('firstName').value = '';
			document.getElementById('lastName').value = '';
			document.getElementById('birthDate').value = '';
			document.getElementById('username').value = '';
			document.getElementById('password').value = '';
			document.getElementById('Email').value = '';
			document.getElementById('repassword').value = '';
			document.getElementById('ToS').checked = false;
			document.getElementById('Male').checked = false;
			document.getElementById('Female').checked = false;
		}		
		else if(result.message == 'err'){
		
		}
		else{
			alert('Username is already Taken');
		}
	});
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
	var emailMatch = new RegExp(/.*@.*\.(ca|com)/);
	if(email == '' || !emailMatch.test(email)){
		incomplete += 'Please enter a valid E-Mail address\n';
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

//check if rewritten password == password
function checkPassword(){
	var pass = document.getElementById('password').value;
	var repass = document.getElementById('repassword').value;
	if((pass != repass) && (pass != '') && (repass != '')){
		return true;
	}
	return false;
}

//send email
function sendEmail(){
	alert('Confirmation Email Sent (To Be Implemented)');
}


/* Forgot Password Page */

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


/* Profile */

function getProfileInfo(){
	var userInfo = document.getElementById('profileInfo');
	userInfo.innerHTML = ''
	serverPost('getProfile', {}, function(result){
		userInfo.innerHTML = '<p>Name: ' + result.User.FirstName + " " + result.User.LastName
			+ '</p><p>Date of Birth: ' + result.User.DateOfBirth
			+ '</p><p>Gender: ' + result.User.gender
			+ '</p><p>Username: ' + result.User.Username
			+ '</p><p>E-Mail: ' + result.User.EMail
			+ '</p><p>School: ' + result.User.School + '</p>';
	});
	getPastLogins();
}

function getPastLogins(){
	var logList = document.getElementById('textarea-b');
	logList.value = '';
	serverPost('getPastLogins', {}, function(result){
		for(i = result.logins.length-1; i >= 0 && i >= result.logins.length-51; i--){
			logList.value += 'Date: ' + result.logins[i].Dates + ',  Location: ' + result.logins[i].Loc + '\n';
		}
	});
}

/* Book Appointment */

function apptInit(){
	document.getElementById('BookApptDate').value = '';
	document.getElementById('apptReason').value = '';
	getApptTimes();
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
	if (curGP != 'NULL' && selectedDate && !beforeTomorrow(selectedDate)){
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
		if(beforeTomorrow(selectedDate) && curGP != 'NULL' && selectedDate){
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
			Reason: document.getElementById('apptReason').value
		}), function(result){
			alert('Appointment booked');
			retrieveAppts();
			$.mobile.changePage("#main");
		})
		
	}
	else{
		alert('Please select a time.');
	}
}


/* View Appointments */

//Retrieves all appointments the current user has booked
function retrieveAppts(){
	curAppt = -1;
	apptList = [];
	var list = document.getElementById('userApptsList');
	list.innerHTML = '<p>Loading, please wait.</p>';
	serverPost('getUserAppt', JSON.stringify({
	}), function(result){
		if(!result.message){
			var HTMLstring = '<legend>Appointments:</legend>';
			for(var i=0; i < result.Appts.length; i++){
				HTMLstring += '<a href = "#reviewAppt" data-role = "button" id = "' + i + '" onmouseup = getSingleAppt(' + i + ')>'
				HTMLstring += result.Appts[i].Appts.ApptDate + ' @ ' + result.Appts[i].Appts.ApptTime + ' with ' + result.Appts[i].Appts.GPs + '</a>';
				apptList.push({GPs: result.Appts[i].Appts.GPs, ApptDate: result.Appts[i].Appts.ApptDate, ApptTime: result.Appts[i].Appts.ApptTime});
			}
			list.innerHTML = HTMLstring;
			$("#viewAppt").trigger("pagecreate");
		}
		else{
			list.innerHTML = '<center><p>' + result.message + '</p></center>';
		}
	});
}

function getSingleAppt(btnID){
	curAppt = btnID;
	serverPost('getOneAppt', JSON.stringify({
		GPs: apptList[curAppt].GPs,
		ApptDate: apptList[curAppt].ApptDate,
		ApptTime: apptList[curAppt].ApptTime,
	}), function(result){
		var appt = document.getElementById('singleAppt');
		appt.innerHTML = '<p><strong>GP: </strong>' + result.Appt.GPs + '</p>';
		appt.innerHTML += '<p><strong>Date: </strong>' + result.Appt.ApptDate + '</p>';
		appt.innerHTML += '<p><strong>Time: </strong>' + result.Appt.ApptTime + '</p>';
		appt.innerHTML += '<p><strong>Reason: </strong>' + result.Appt.Reason + '</p>';
		if(!beforeTomorrow(result.Appt.ApptDate)){
			appt.innerHTML += '<center><a href = "#" data-role = "button" onmouseup = cancelAppointment()>Cancel Appointment</a></center>';
			$("#reviewAppt").trigger("pagecreate");
		}
	});
}

// Cancels an appointment through a post to the server
function cancelAppointment(){
	serverPost('cancelAppt', JSON.stringify({
		GPs: apptList[curAppt].GPs,
		ApptDate: apptList[curAppt].ApptDate,
		ApptTime: apptList[curAppt].ApptTime,
	}), function(result){
		curAppt = -1;
		alert('Appointment cancelled.\n');
		retrieveAppts();
		$.mobile.changePage('#viewAppt');
	});
}