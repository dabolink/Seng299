var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    https = require('https'),
	fs = require('fs');

app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendfile('index.html');
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});
