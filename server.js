var express = require('express');
var app = express();

app.use("/node_modules", express.static('node_modules'));
app.use("/bower_components", express.static('bower_components'));
app.use("/assets", express.static('assets'));
app.use("/views", express.static('views'));

app.get('/', function(request, response) {
    console.log("request against " + request.url);
    //response.sendFile(__dirname + '/views/quickstart.html');
    response.sendFile(__dirname + '/views/calenderEvents.html');
});

console.log('server up');
app.listen(8080);