var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = Number(process.env.PORT || 3000)

app.use(express.static('static'));

http.listen(port, function(){
  console.log('listening on *:3000');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    
    socket.on('ring', function(user){
        socket.broadcast.emit('ring', user);
    });

    socket.on('go', function(user){
        socket.broadcast.emit('go', user);
    });
});
