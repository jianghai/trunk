var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
app.set('port', process.env.PORT || 3001);
app.use(express.static(path.join(__dirname, '/')));

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});