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
});

var SchoolSchema = new mongoose.Schema({
	Schools: [String],
});
var GPSchema = new mongoose.Schema({
	GPs: [String],
});

mongoose.connect('mongodb://generic:1234@ds041238.mongolab.com:41238/seng299', function(error){
	console.log('MongoDB connection ready');
});

var GPs = mongoose.model('GPs', GPSchema);
var User = mongoose.model('User', UserSchema);
var Schools = mongoose.model('Schools', SchoolSchema);

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
	Schools.findOne(function(err,obj){
		if(err){
			res.send(500,'err');
			console.log(err);
		}
		else{
			res.json(200, {Schools: obj.Schools});
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
					res.json(200, {message: 'true'});
				}
				else{
					res.json(200, {message: 'false'});
				}
			}
			else{
				res.json(200, {message: 'false'});
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
	GPs.findOne(function(err,obj){
		if(err){
			res.send(500,'err');
			console.log(err);
		}
		else{
			res.json(200, {GPs: obj.GPs});
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