/*************************************************************************************************************************************
														Initialization
*************************************************************************************************************************************/


var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    mongoose = require('mongoose'),
    https = require('https'),
	fs = require('fs');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){});

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
});

var SchoolSchema = new mongoose.Schema({
	name: String,
});
var GPSchema = new mongoose.Schema({
	name: String,
});

var ApptSchema = new mongoose.Schema({
	GPs: [String],
	ApptDate: [String],
	ApptTime: [String],
	Patient: [String],
	Reason: [String],
})

mongoose.connect('mongodb://generic:1234@ds041238.mongolab.com:41238/seng299', function(error){
	console.log('MongoDB connection ready');
});

var GP = mongoose.model('GP', GPSchema);
var User = mongoose.model('User', UserSchema);
var School = mongoose.model('School', SchoolSchema);
var Appointments = mongoose.model('Appointments', ApptSchema);

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendfile('index.html');
});

//Create the server on port 3000
var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

/*************************************************************************************************************************************
														serverPost Methods
*************************************************************************************************************************************/

//Note: If a function does not encounter any errors, it must call res.send(200);
//To send data back from the server, use res.json(200, < JSON string >);
//If there is an error, call res.send(500, < Error message >);

app.post('/', function(req, res, next){
    console.log(req.body);
    res.json(200, {message: 'This is text!'});
});

app.post('/getSchools', function(req,res,next){
	School.find(function(err,obj){
		if(err){
			console.log(err);
		}
		else{
			var temp = [];
			for(i=0;i<obj.length;i++){
				temp.push({name: obj[i].name});
			}
			res.json(200,{
				names: temp,
				});
		}
	}); 
});
app.post('/checkPass', function(req,res,next){
	User.findOne({Username: req.body.Username},function(err,obj){
		if(err){
			res.send(500, 'err');
			console.log(err);
		}
		else{
			if(obj != null){
				if(req.body.Password == obj.Password){
					res.json(200, {user: obj.Username, Privilege: obj.Privilege,});
				}
				else{
					res.json(200, {user: '', Privilege: '',});
				}
			}
			else{
				res.json(200, {user: '', Privilege: '',});
			}
		}
	});
});
app.post('/addUser', function(req, res, next){
	User.findOne({Username: req.body.Username},function(err, obj){
		if(err) {
			res.send(500, 'err');
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
					res.json(200, {message: 'true'});
				});
			}
			else{
					res.send(200, {message: 'false'});
			}
		}
	});	
});

app.post('/getGPs', function(req,res,next){
	GP.find(function(err,obj){
		if(err){
			console.log(err);
		}
		else{
			var temp = [];
			for(i=0;i<obj.length;i++){
				temp.push({name: obj[i].name});
			}
			res.json(200,{
				names: temp,
				});
		}
	});
});

app.post('/getProfile', function(req, res, next){
	User.findOne({Username: req.body.Username},function(err, obj){
		if(err){
			res.send(500,'err');
			console.log(err);
		}
		else {
			res.json(200, {User: {
				FirstName: obj.FirstName,
				LastName: obj.LastName,
				DateOfBirth: obj.DateOfBirth,
				gender: obj.gender,
				Username: obj.Username,
				EMail: obj.EMail,
				School: obj.School,
			}});
		}
	});
});

app.post('/getApptTimes', function(req, res, next){
	Appointments.find({GPs: req.body.GPs, ApptDate: req.body.ApptDate, Patient: '', Reason: ''}, function(err, obj){
		if(err){
			res.send(500, 'err');
			console.log(err);
		}
		else{
			if (obj!=null){
				var temp = [];
				for (var i = 0; i < obj.length; i++) {
					temp.push({Time: obj[i].ApptTime});
					console.log(obj[i]);
				};
				res.json(200, {ApptTimes: temp});
			}
			else{
				res.send(500, 'Could not find');
			}
		}
	})
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
			res.json(200,{
				Users: temp,
				});
		}
	});
});
app.post('/removeUser',function(req,res,next){
	User.remove({Username: req.body.Username},function(err,obj){
		if(err){
			res.send(500,'err');
			console.log(err);
		}
		else{
			console.log('User was removed: ' + obj);
			res.send(200,obj);
		}
	});
});
app.post('/addSchoolToDB',function(req,res,next){
	School.findOne({name: req.body.name},function(err, obj){
		if(err) {
			res.send(500, 'err');
			console.error(err);
		}
		else{
			if(obj == null){
				var test = new School({
					name: req.body.name,
				}); 
				test.save(function(err){
					if(err) return console.error(err);
					res.json(200, {message: 'true'});
				});
			}
			else{
					res.send(200, {message: 'false'});
			}
		}
	});
});

app.post('/addGPToDB',function(req,res,next){
	GP.findOne({name: req.body.name},function(err, obj){
		if(err) {
			res.send(500, 'err');
			console.error(err);
		}
		else{
			if(obj == null){
				var test = new GP({
					name: req.body.name,
				}); 
				test.save(function(err){
					if(err) return console.error(err);
					res.json(200, {message: 'true'});
				});
			}
			else{
					res.send(200, {message: 'false'});
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
	ApptDate: '2014-07-18',
	ApptTime: '8 am',
	Patient: '',
	Reason: '',
});

test.save(function(err){
	if(err) return console.error(err);
});*/