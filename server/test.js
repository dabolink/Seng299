var mongoose = require('mongoose');

var FN = 'Daniel';
var LN = 'Bolink';
var DoB = '08-14-1993';
var g = 'male';
var Username = 'dabolink';
var Password = '1234';
var email = 'dabolink@gmail.ca';
var School = 'University of Victoria';



var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){});
mongoose.connect('mongodb://DigitalCoffee:1234@ds041208.mongolab.com:41238/seng299');

var School = new mongoose.Schema({
	School: { type: String}
	});

var UserSchema = new mongoose.Schema({
	FirstName: { type: String},
	LastName: { type: String},
	DateOfBirth: { type: Date},
	gender: { type: String},
	UserName: { type: String},
	Password: { type: String},
	EMail: { type: String},
	School: { type: String},
	});
var User = mongoose.model('User', UserSchema);

var test = new User({
	FirstName: FN,
	LastName: LN,
	DateOfBirth: DoB,
	gender: 'Male',
	UserName: Username,
	Password: Password,
	EMail: email,
	School: School,
	});
	
test.save(function(err, test){
	if(err) return console.error(err);
	console.dir(test);
});