/*************************************************************************************************************************************
														Admin Functions
*************************************************************************************************************************************/

function adminInit(){
	addAllUsers();
	addGPs('allGPsApp');
}

function removeUser(){
	var User = document.getElementById('allUsers').value;
	serverPost('removeUser',JSON.stringify({Username: User}),function(result){
		alert(User + " has been deleted for the database");
		if(User == curUser){
			alert("Deleted your own account");
			signOut();
		}
		location.reload();
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
			alert('School already in database');
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
			alert("Appointment added");
		}
		else{
			alert("Appointment already created");
		}
	});
}