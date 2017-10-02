var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(path.join(__dirname + '/app')));

app.get('/', function(request, response) {
    console.log("request against " + request.url);
    response.sendFile(__dirname + '/index.html')
});

console.log('server up');
app.listen(8080);