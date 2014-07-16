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
		UserName: { type: String},
		Password: { type: String},
		EMail: { type: String},
		School: { type: String},
});

mongoose.connect('mongodb://generic:1234@ds041238.mongolab.com:41238/seng299', function(error){
	console.log('MongoDB connection ready');
});


var SchoolSchema = new mongoose.Schema({
	School: { type: String}
});
var User = mongoose.model('User', UserSchema);
var School = mongoose.model('School', SchoolSchema);
User.findOne({UserName: 'Dabolink'},function(err, obj){
	if(err) {
		console.log('test1');
		console.error(err);
	}
	else{
		console.log('test2');
		console.log(obj);
		if(obj == null){
			var test = new User({
				FirstName: 'Daniel',
				LastName: 'Bolink',
				DateOfBirth: '14-08-2014',
				gender: 'Male',
				UserName: 'Dabolink',
				Password: '1234',
				EMail: 'dabolink@gmail.com',
				School: 'University of Victoria',
			}); 
			test.save(function(err){
				if(err) return console.error(err);
				console.dir('test3');
			});
		}
		
	}
});	

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

app.post('/', function(req, res, next){
    console.log(req.body);
    console.log(req.body.number);
    next()
});

app.post('/addUser', function(req, res, next){
	console.log(req.body);
	console.log(req.body.Username);
	User.findOne({UserName: req.body.Username},function(err, obj){
	if(err) {
		console.log('test1');
		console.error(err);
	}
	else{
		console.log('test2');
		console.log(obj);
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
			}); 
			test.save(function(err){
				if(err) return console.error(err);
				console.dir('test3');
			});
		}
		
	}
});	
});