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

        if (localStorage.username) enableUser(localStorage.username);

        //Set user name
        inputUser.addEventListener('keypress', function(e) {
            if (e.which == 13 && this.value !== '') {
                
                enableUser(this.value);

                //Refresh username
                localStorage.username = this.value;

                this.blur();

            }
        });

        //Change user name
        nameEntred.addEventListener('click', function(e) {
            btnRing.setAttribute('disabled', 'disabled');
            inputUser.classList.remove('el-hide');
            inputUser.focus();
            this.classList.add('el-hide');
        });

        //ring events
        btnRing.addEventListener('click', function() {
            socket.emit('ring', localStorage.username);
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

        socket.on('user added', function(data){
            updateUserList(data.userList);
        });

        if (Notification.permission !== "granted")
        Notification.requestPermission();

    });

    function enableUser(username) {

        var btnRing = $('button'),
            inputUser = $('.user-name'),
            nameEntred = $('.name-entred');

        btnRing.removeAttribute('disabled');
        inputUser.classList.add('el-hide');
        nameEntred.classList.remove('el-hide');
        nameEntred.innerHTML = username;
        socket.emit('add user', nameEntred.innerHTML);

    }

    function updateUserList(userList) {
  //   	var i = 0,
  //   		total = userList.length,
  //           list = '';

		// for (i; i < total; i++) {
  //           list+= '<li>' + userList[i] + '</li>';
		// }

  //       $('.list-user').innerHTML = list;
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
                socket.emit('go', localStorage.username);
                notification.close();
            };

        }
    }
    
    function $(el) {
        return doc.querySelector(el);
    }

})(window, window.document)
