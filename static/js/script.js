(function(win, doc){

    var socket = io(),
        audio = new Audio('assets/ring.mp3'),
        conf = {
            iconRing: 'assets/img/ring.png'
        },
        users = [];

    doc.addEventListener('DOMContentLoaded', function () {

        var btnRing = $('button'),
            inputUser = $('.user-name'),
            nameEntred = $('.name-entred'),
            msgWait = $('.msg-wait'),
            userNameDesignate = $('.user-name-designate');

        //Start user name
        $('.form-row').classList.remove('el-hidden');

        if (localStorage.userName) validateUser(localStorage.userName);

        //Set user name
        inputUser.addEventListener('keypress', function(e) {
            if (e.which == 13 && this.value !== '') {
                validateUser(this.value);
                // this.blur();
            }
        });

        //Change user name
        nameEntred.addEventListener('click', function(e) {
            changeUserName();
        });

        //ring events
        btnRing.addEventListener('click', function() {
            socket.emit('ring', localStorage.userName);
        });

        socket.on('loginSuccess', function(data){
            $('.user-name').classList.remove('error');
            console.log('success', data.userName);
            enableUser(data.userName);
            socket.emit('add user', data.userName);
        });


        socket.on('loginError', function(data){
            $('.user-name').classList.add('error');
            changeUserName();
        });
        
        socket.on('login', function(data){
            updateUserList(data);
            //Refresh username
            localStorage.userName = data.userName;
        });

        // Whenever the server emits 'user joined', log it in the chat body
        socket.on('user joined', function(data) {
            updateUserList(data);
        });

        socket.on('ring', function(msg){
            notifyMe(msg);
            audio.play();
        });

        //go events
        socket.on('go', function(userName){

            userNameDesignate.innerHTML = userName;
            msgWait.classList.remove('el-hide');

            btnRing.setAttribute('disabled', 'disabled');

            setTimeout(function (){
                msgWait.classList.add('el-hide');
                btnRing.removeAttribute('disabled');
            }, 10000)

            if ("vibrate" in navigator) {
                navigator.vibrate([500, 100, 500]);
            }
            new Notification('Go!', {
                icon: conf.iconRing,
                body: userName
            });


        });

        // Whenever the server emits 'user left', log it in the chat body
        socket.on('user left', function(data) {
            console.log('user left', data.userList)
            updateUserList(data);
        });

        if (Notification.permission !== "granted")
        Notification.requestPermission();

    });

    function validateUser(userName) {
        socket.emit('validate user', userName, localStorage.userName);
    }

    function changeUserName() {

        var btnRing = $('button'),
            inputUser = $('.user-name'),
            nameEntred = $('.name-entred');

        btnRing.setAttribute('disabled', 'disabled');
        inputUser.classList.remove('el-hide');
        inputUser.focus();
        nameEntred.classList.add('el-hide');

    }

    function enableUser(userName) {

        var btnRing = $('button'),
            inputUser = $('.user-name'),
            nameEntred = $('.name-entred');

        btnRing.removeAttribute('disabled');
        inputUser.classList.add('el-hide');
        nameEntred.classList.remove('el-hide');
        nameEntred.innerHTML = userName;
        console.log('enableUser');

    }

    function updateUserList(data) {
    	var i = 0,
            userList = data.userList,
    		total = userList.length,
            list = '';

		for (i; i < total; i++) {
            list+= '<li>' + userList[i] + '</li>';
		}

        $('.list-user').innerHTML = list;
        $('.user-count').innerHTML = data.userCount;
		console.log(userList);
    }


    function notifyMe(user) {
        if (!Notification) {
            alert('Desktop notifications not available in your browser. Try Updating Chrome.');
            return;
        }

        if (Notification.permission !== "granted")
            Notification.requestPermission();
        else {
            var notification = new Notification('Ring!', {
                icon: conf.iconRing,
                body: "Hey, I'm " + user + "! Open the door!",
            });

            notification.onclick = function () {
                socket.emit('go', localStorage.userName);
                notification.close();
            };

        }
    }
    
    function $(el) {
        return doc.querySelector(el);
    }

})(window, window.document)
