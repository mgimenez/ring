var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = Number(process.env.PORT || 3000);
var userList = [];
var userCount = 0;

app.use(express.static('static'));

http.listen(port, function(){
  console.log('listening on *:3000');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

    var addedUser = false;
    console.log('user connected', userList);

    socket.on('ring', function(user){
        socket.broadcast.emit('ring', user);
    });

    socket.on('go', function(user){
        socket.broadcast.emit('go', user);
    });

    socket.on('validate user', function(userName, userNamePrev){
        var i = 0,
            total,
            loginError = false;
        // console.log(userList);
        // if (userNamePrev && userNamePrev !== userName) removeFromArray(userList, userNamePrev);
        total = userList.length;
        for (i; i < total; i++) {
            if (userName === userList[i] && userName !== userNamePrev) {
                loginError = true;
                socket.emit('loginError', {
                    userName: userName
                });
            }
        }

        if (!loginError) {
            socket.emit('loginSuccess', {
                userName: userName
            });
        }

    });

    socket.on('add user', function(userName) {
        if (addedUser) return;

        socket.userName = userName;
        socket.userList = userList.push(userName);
        ++userCount; 
        addedUser = true;

        socket.emit('login', {
                userCount: userCount,
                userName: userName,
                userList: userList
        });

        console.log(userList);

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            userCount: userCount,
            userName: userName,
            userList: userList
        });

    });


    socket.on('disconnect', function() {

        console.log('user disconnected');
        if (addedUser) {
            --userCount;

            var i = 0,
                total = userList.length;

            for (i; i < total; i++) {
                if (userList[i] === socket.userName) {
                    userList.splice(i, 1);
                }
            }

            console.log(userList);

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.userName,
                userCount: userCount,
                userList: userList
            });
        }
    });
});

function removeFromArray(array, el) {
    var index = array.indexOf(el);

    if (index > -1) {
        array.splice(index, 1);
    }

    return array;
}
