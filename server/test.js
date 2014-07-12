var mongoose = require('mongoose');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){});
mongoose.connect('mongodb://DigitalCoffee:1234@ds041208.mongolab.com:41238/seng299');
//ds041208.mongolab.com:41238/seng299');

var movieSchema = new mongoose.Schema({
	title: { type: String}
	});
var Movie = mongoose.model('Movie',movieSchema);
var thor = new Movie({
	title: 'thor'});
thor.save(function(err, thor){
	if(err) return console.error(err);
	console.dir(thor);
});