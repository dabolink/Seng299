var express = require('express'),
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

mongoose.connect('mongodb://generic:1234@ds041238.mongolab.com:41238/seng299');

var SchoolSchema = new mongoose.Schema({
	School: { type: String}
});

var User = mongoose.model('User', UserSchema);
var School = mongoose.model('School', SchoolSchema);

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
	
test.save(function(err, test){
	if(err) return console.error(err);
	console.dir(test);
});

if(mongoose.connection.readyState != 1){}
console.log('MongoDB connection ready-state:  '+ mongoose.connection.readyState);

app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendfile('index.html');
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});