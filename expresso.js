/*************************************************************************************************************************************
														Initialization
*************************************************************************************************************************************/


var express = require('express'),
	session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    app = express(),
    mongoose = require('mongoose'),
    https = require('https'),
	fs = require('fs');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){});


/* User Schemas */

var UserSchema = new mongoose.Schema({
		FirstName: { type: String},
		LastName: { type: String},
		DateOfBirth: { type: String},
		gender: { type: String},
		Username: { type: String},
		Password: { type: String},
		EMail: { type: String},
		School: { type: String},
		Privilege: { type: String},
		Logins: [{
			Dates: String,
			Loc: String
		}]
});

var SchoolSchema = new mongoose.Schema({
	name: String,
});
var GPSchema = new mongoose.Schema({
	name: String,
});

var ApptSchema = new mongoose.Schema({
	GPs: String,
	ApptDate: String,
	ApptTime: String,
	Patient: String,
	Reason: String,
});


mongoose.connect('mongodb://generic:1234@ds041238.mongolab.com:41238/seng299', function(error){
	console.log('MongoDB connection ready');
});

var GP = mongoose.model('GP', GPSchema);
var User = mongoose.model('User', UserSchema);
var School = mongoose.model('School', SchoolSchema);
var Appointments = mongoose.model('Appointments', ApptSchema);

app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
	secret: 'GetOnMyLevel',
    cookie: { maxAge: 3600000, }, //An idle seesion only lasts for 15 minutes
    saveUninitialized: true,
    resave: true
}));

app.get('/', function(req, res){
	if(!authenticate(req)){
		setTimeout(function(){
	    	res.sendfile('index.html');
	    }, 10000);
	}
	else{
		console.log('IT HAPPENED!!!!!!!');
		setTimeout(function(){
			res.sendfile('index.html');
		}, 10000);
	}
});

app.get('/_____admin', function(req, res){
	User.findOne({Username: req.query.Username}, function(err,obj){
		if(err){
			console.log(err);
			setTimeout(function(){
				res.send('Cannot GET ' + req.originalUrl);
			}, 10000);
		}
		else if(obj != null && req.query.secure == '4462174635846168'){
			setTimeout(function(){
				res.sendfile('admin.html');
			}, 10000);
		}
		else
		{
			setTimeout(function(){
				res.send('Cannot GET ' + req.originalUrl);
			}, 10000);
		}
	});
});

//Create the server on port 3000
var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port %d', server.address().port);
});

function authenticate(req){
	if (!req.session.userId || req.session.userId == '' || req.session.cookie.maxAge <= 0){
		req.session.userId = '';
		req.session.destroy();
		return false;
	}
	else{
		req.session.touch();
		return true;
	}
}

/*************************************************************************************************************************************
														serverPost Methods
*************************************************************************************************************************************/

//Note: If a function does not encounter any errors, it must call res.send(200);
//To send data back from the server, use res.json(200, < JSON string >);
//If there is an error, call res.send(500, < Error message >);

app.post('/', function(req, res, next){
    res.json(200, {message: 'You\'re a wizard, Harry'});
});


/* Load Form Data */

app.post('/getSchools', function(req,res,next){
	School.find(function(err,obj){
		if(err){
			console.log(err);
			setTimeout(function(){
				res.send(500);
			}, 10000);
		}
		else{
			var temp = [];
			for(i=0;i<obj.length;i++){
				temp.push({name: obj[i].name});
			}
			setTimeout(function(){
				res.json(200,{
					names: temp,
					});
			}, 10000);
		}
	}); 
});

app.post('/getGPs', function(req,res,next){
	GP.find(function(err,obj){
		if(err){
			console.log(err);
			setTimeout(function(){
				res.send(500);
			}, 10000);
		}
		else{
			var temp = [];
			for(i=0;i<obj.length;i++){
				temp.push({name: obj[i].name});
			}
			setTimeout(function(){
				res.json(200,{
					names: temp,
					});
			}, 10000);
		}
	});
});


/* Registration */


app.post('/addUser', function(req, res, next){
	User.findOne({Username: req.session.userId},function(err, obj){
		if(err) {
			setTimeout(function(){
				res.send(500, 'err');
			}, 10000);
			console.error(err);
		}
		else{
			if(obj == null){
				var test = new User({
					FirstName: req.body.FirstName,
					LastName: req.body.LastName,
					DateOfBirth: req.body.DateOfBirth,
					gender: req.body.gender,
					Username: req.body.Username,
					Password: req.body.Password,
					EMail: req.body.EMail,
					School: req.body.School,
					Privilege: req.body.Privilege,
				}); 
				test.save(function(err){
					if(err) return console.error(err);
					setTimeout(function(){
						res.json(200, {message: 'true'});
					}, 10000);
				});
			}
			else{
				setTimeout(function(){
					res.send(200, {message: 'false'});
				}, 10000);
			}
		}
	});	
});


/* Login / Logout */

app.post('/signOut', function(req, res, next){
	req.session.userId = '';
	req.session.destroy(function(err){
		if(err){
			console.log(err);
			setTimeout(function(){
				res.send(401, "Could not log out successfully");
			}, 10000);
		}
		else{
			setTimeout(function(){
				res.send(200);
			}, 10000);
		}
	});
})

app.post('/checkPass', function(req,res,next){
	User.findOne({Username: req.body.Username},function(err,obj){
		if(err){
			setTimeout(function(){
				res.send(500, 'err');
			}, 10000);
			console.log(err);
		}
		else{
			if(obj != null){
				if(req.body.Password == obj.Password){
					req.session.userId = req.body.Username;
					req.session.save();
					setTimeout(function(){
						res.send(200);
					}, 10000);
				}
				else{
					setTimeout(function(){
						res.json(200, {user: ''});
					}, 10000);
				}
			}
			else{
				setTimeout(function(){
					res.json(200, {user: ''});
				}, 10000);
			}
		}
	});
});

app.post('/storeLogin', function(req, res, next){
	User.findOne({Username: req.session.userId}, function(err, obj){
		if(err){
			console.log(err);
			setTimeout(function(){
				res.send(500);
			}, 10000);
		}
		else{
			if(obj == null){
				setTimeout(function(){
					res.send(500);
				}, 10000);
			}
			else{
				var test = obj;
				test.Logins.push({
					Dates: req.body.DateofLogin,
					Loc: req.body.Loc,
				});
				User.remove(obj, function(err){
					if(err){
						console.log(err);
						setTimeout(function(){
							res.send(500);
						}, 10000);
					}
					else{
						test.save(function(err){
							if(err){
								console.log(err);
								setTimeout(function(){
									res.send(500);
								}, 10000);
							}
							else
								setTimeout(function(){
									res.send(200);
								}, 10000);
						});
					}
				});
			}
		}
	});
});

/* sees if username is in database */
app.post('/checkUser', function(req,res,next){
	User.findOne({Username: req.body.Username},function(err,obj){
		if(err){
			setTimeout(function(){
				res.send(500,'err');
			}, 10000);
		}else
		{
			console.log(obj);
			if(obj != null){
				setTimeout(function(){
					res.json(200,{message: 'true'});
				}, 10000);
			}
			else{
				setTimeout(function(){
					res.json(200,{message: 'false'});
				}, 10000);
			}
		}
	});
});
/* Profile */

app.post('/getProfile', function(req, res, next){
	if(!authenticate(req)){
		res.send(401, "You are not logged in");
		next();
	}
	else{
		User.findOne({Username: req.session.userId},function(err, obj){
			if(err){
				setTimeout(function(){
					res.send(500,'err');
				}, 10000);
				console.log(err);
			}
			else {
				setTimeout(function(){
					res.json(200, {User: {
						FirstName: obj.FirstName,
						LastName: obj.LastName,
						DateOfBirth: obj.DateOfBirth,
						gender: obj.gender,
						Username: obj.Username,
						EMail: obj.EMail,
						School: obj.School,
					}});
				}, 10000);
			}
		});
	}
});

app.post('/getPastLogins', function(req, res, next){
	if(!authenticate(req)){
		setTimeout(function(){
			res.send(200, "You are not logged in"); //Sending 200 prevents 2 alerts from occurring in succession
		}, 10000);
		next();
	}
	else{
		User.findOne({Username: req.session.userId}, function(err, obj){
			if(err){
				console.log(err);
				setTimeout(function(){
					res.send(500);
				}, 10000);
			}
			else{
				setTimeout(function(){
					res.json(200, {
						logins: obj.Logins
					});
				}, 10000);
			}
		});
	}
});

/* Book Appointment */

app.post('/getApptTimes', function(req, res, next){
	Appointments.find({GPs: req.body.GPs, ApptDate: req.body.ApptDate, Patient: "", Reason: ""}, function(err, obj){
		if(err){
			setTimeout(function(){
				res.send(500, 'err');
			}, 10000);
			console.log(err);
		}
		else{
			if (obj.length > 0){
				var temp = [];
				for (var i = 0; i < obj.length; i++) {
					temp.push({Time: obj[i].ApptTime});
				};
				setTimeout(function(){
					res.json(200, {ApptTimes: temp});
				}, 10000);
			}
			else{
				setTimeout(function(){
					res.json(200, {message: 'Could not find any appointments'});
				}, 10000);
			}
		}
	})
});

app.post('/bookAppt', function(req, res, next){
	if(!authenticate(req)){
		setTimeout(function(){
			res.send(401, "You are not logged in");
		}, 10000);
		next();
	}
	else{
		Appointments.findOne({GPs: req.body.GPs, ApptDate: req.body.ApptDate, ApptTime: req.body.ApptTime}, function(err, obj){
			if(err){
				setTimeout(function(){
					res.send(500,'err');
				}, 10000);
				console.log(err);
			}
			else {
				obj.modified = new Appointments({
					GPs: req.body.GPs,
					ApptDate: req.body.ApptDate,
					ApptTime: req.body.ApptTime,
					Patient: req.session.userId,
					Reason: req.body.Reason,
				}).save(function(err){
					if (err){
						console.log(err);
						setTimeout(function(){
							res.send(500);
						}, 10000);
					}
					else{
						Appointments.remove({
							GPs: req.body.GPs,
							ApptDate: req.body.ApptDate,
							ApptTime: req.body.ApptTime,
							Patient: "",
							Reason: "",
						}, function(err){
							if(err){
								console.log(err);
								setTimeout(function(){
									res.send(500);
								}, 10000);
							}
							else
								setTimeout(function(){
									res.send(200);
								}, 10000);
						});
					}
				});
			}
		});
	}
});

/* Review Appt */

app.post('/cancelAppt', function(req, res, next){
	if(!authenticate(req)){
		setTimeout(function(){
			res.send(401, "You are not logged in");
		}, 10000);
		next();
	}
	else{
		Appointments.findOne({GPs: req.body.GPs, ApptDate: req.body.ApptDate, ApptTime: req.body.ApptTime, Patient: req.session.userId}, function(err, obj){
			if(err){
				setTimeout(function(){
					res.send(500,'err');
				}, 10000);
				console.log(err);
			}
			else {
				if(obj != null){
					obj.modified = new Appointments({
						GPs: obj.GPs,
						ApptDate: obj.ApptDate,
						ApptTime: obj.ApptTime,
						Patient: "",
						Reason: "",
					}).save(function(err){
						if (err){
							console.log(err);
							setTimeout(function(){
								res.send(500);
							}, 10000);
						}
						else{
							Appointments.remove({
								GPs: obj.GPs,
								ApptDate: obj.ApptDate,
								ApptTime: obj.ApptTime,
								Patient: req.session.userId,
							}, function(err){
								if(err){
									console.err(err);
									setTimeout(function(){
										res.send(500);
									}, 10000);
								}
								else{
									setTimeout(function(){
										res.send(200);
									}, 10000);
								}
							});
						}
					});
				}
				else{
					setTimeout(function(){
						res.send(500, 'Appointment does not exist.');
					}, 10000);
				}
			}
		});
	}
});

app.post('/getUserAppt', function(req, res, next){
	Appointments.find({Patient: req.session.userId}, function(err, obj){
		if(err){
			console.log(err);
			setTimeout(function(){
				res.send(500);
			}, 10000);
		}
		else{
			if (obj.length > 0){
				var temp = [];
				for (var i = 0; i < obj.length; i++) {
					temp.push({Appts: obj[i]});
				};
				setTimeout(function(){
					res.json(200, {Appts: temp});
				}, 10000);
			}
			else{
				setTimeout(function(){
					res.json(200, {message: 'You have no appointments booked.'});
				}, 10000);
			}
		}
	});
});

app.post('/getOneAppt', function(req, res, next){
	Appointments.findOne({Patient: req.session.userId, GPs: req.body.GPs, ApptDate: req.body.ApptDate, ApptTime: req.body.ApptTime}, function(err, obj){
		if(err){
			console.log(err);
			setTimeout(function(){
				res.send(500);
			}, 10000);
		}
		else{
			setTimeout(function(){
				res.json(200, {Appt: obj});
			}, 10000);
		}
	});
});


/*************************************************************************************************************************************
														admin functions
*************************************************************************************************************************************/
app.post('/addAllUsers', function(req,res,next){
	User.find(function(err,obj){
		if(err){
			console.log(err);
		}
		else{
			var temp = [];
			for(i=0;i<obj.length;i++){
				temp.push({Username: obj[i].Username});
			}
			setTimeout(function(){
				res.json(200,{
					Users: temp,
					});
			}, 10000);
		}
	});
});
app.post('/removeUser',function(req,res,next){
	User.remove({Username: req.body.Username},function(err,obj){
		if(err){
			setTimeout(function(){
				res.send(500,'err');
			}, 10000);
			console.log(err);
		}
		else{
			console.log('User was removed: ' + obj);
			setTimeout(function(){
				res.send(200,obj);
			}, 10000);
		}
	});
});
app.post('/addSchoolToDB',function(req,res,next){
	School.findOne({name: req.body.name},function(err, obj){
		if(err) {
			setTimeout(function(){
				res.send(500, 'err');
			}, 10000);
			console.error(err);
		}
		else{
			if(obj == null){
				var test = new School({
					name: req.body.name,
				}); 
				test.save(function(err){
					if(err) return console.error(err);
					setTimeout(function(){
						res.json(200, {message: 'true'});
					}, 10000);
				});
			}
			else{
				setTimeout(function(){
					res.send(200, {message: 'false'});
				}, 10000);
			}
		}
	});
});

app.post('/addGPToDB',function(req,res,next){
	GP.findOne({name: req.body.name},function(err, obj){
		if(err) {
			setTimeout(function(){
				res.send(500, 'err');
			}, 10000);
			console.error(err);
		}
		else{
			if(obj == null){
				var test = new GP({
					name: req.body.name,
				}); 
				test.save(function(err){
					if(err) return console.error(err);
					setTimeout(function(){
						res.json(200, {message: 'true'});
					}, 10000);
				});
			}
			else{
				setTimeout(function(){
					res.send(200, {message: 'false'});
				}, 10000);
			}
		}
	});
});
app.post('/addAppointment',function(req,res,next){
	Appointments.findOne({GPs: req.body.GPs, ApptDate: req.body.ApptDate, ApptTime: req.body.ApptTime},function(err, obj){
		if(err) {
			setTimeout(function(){
				res.send(500, 'err');
			}, 10000);
			console.error(err);
		}
		else{
			if(obj == null){
				var test = new Appointments({
					GPs: req.body.GPs,
					ApptDate: req.body.ApptDate,
					ApptTime: req.body.ApptTime,
					Patient: "",
					Reason: "",
				}); 
				test.save(function(err){
					if(err) return console.error(err);
					setTimeout(function(){
						res.json(200, {message: 'true'});
					}, 10000);
				});
			}
			else{
				setTimeout(function(){
					res.send(200, {message: 'false'});
				}, 10000);
			}
		}
	});
});
/*************************************************************************************************************************************
														DataBase Functions (only run once)
*************************************************************************************************************************************/

/* var test = new Schools({
	Schools: ['Univeristy of Victoria','University of British Columbia'],
});
test.save(function(err){
	if(err) return console.error(err);
});*/

/*  var test = new GPs({
	GPs: ['Greg Howe'],
});
test.save(function(err){
	if(err) return console.error(err);
}); */

/*var test = new Appointments({
	GPs: 'Greg Howe',
	ApptDate: '2014-07-25',
	ApptTime: '8 am',
	Patient: '',
	Reason: '',
});

test.save(function(err){
	if(err) return console.error(err);
});*/